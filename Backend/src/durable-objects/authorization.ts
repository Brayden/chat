import { Hono } from "hono";
import { cors } from "hono/cors";
import { DurableObject } from "cloudflare:workers";
import { Browsable } from "@outerbase/browsable-durable-object";
import { Env } from "../types/env";
import { upgradeWebSocket } from 'hono/cloudflare-workers'

@Browsable()
export class AuthorizationDurableObject extends DurableObject<Env> {
    private app: Hono = new Hono();
    public sql: SqlStorage;
    public connections = new Map<string, WebSocket>()

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        this.sql = ctx.storage.sql;

        this.setup();
    }

    private async setup() {
        await this.executeQuery({
            sql: `
                CREATE TABLE IF NOT EXISTS user (
                    id TEXT PRIMARY KEY,
                    email TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    avatar TEXT,
                    created_at INTEGER DEFAULT (unixepoch())
                );

                CREATE TABLE IF NOT EXISTS channel (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    is_private INTEGER DEFAULT 0,
                    created_at INTEGER DEFAULT (unixepoch())
                );

                CREATE TABLE IF NOT EXISTS channel_user (
                    id TEXT PRIMARY KEY,
                    channel_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    created_at INTEGER DEFAULT (unixepoch()),
                    FOREIGN KEY (channel_id) REFERENCES channel(id) ON DELETE CASCADE,
                    UNIQUE(channel_id, user_id)
                );

                CREATE TABLE IF NOT EXISTS session (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    created_at INTEGER DEFAULT (unixepoch()),
                    expires_at INTEGER NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
                );
            `
        });

        this.setupRoutes();
    }

    private setupRoutes() {
        this.app.use('*', async (c, next) => {
            const path = new URL(c.req.url).pathname;
            
            // Skip CORS for WebSocket routes
            if (path === '/ws') {
                return next();
            }
            
            // Apply CORS for other routes
            return cors()(c, next);
        });
        
        // List all users
        this.app.get('/users', async (c) => {
            const users = await this.executeQuery({
                sql: `SELECT id, email, first_name, last_name, avatar FROM user`,
                isRaw: false
            }) as Record<string, SqlStorageValue>[];
            
            return c.json({ success: true, users });
        });

        // Get list of channels for current user
        this.app.get('/channels', async (c) => {
            const sessionId = c.req.header('X-Session-Id') || '';
            const { valid, userId } = await this.validateSession(sessionId);
            
            if (!valid || !userId) {
                return c.json({ success: false, error: 'Invalid session' }, 401);
            }

            const channels = await this.executeQuery({
                sql: `
                    SELECT 
                        c.*,
                        COUNT(DISTINCT cu2.user_id) as member_count,
                        GROUP_CONCAT(cu2.user_id) as member_ids
                    FROM channel c
                    INNER JOIN channel_user cu ON c.id = cu.channel_id
                    LEFT JOIN channel_user cu2 ON c.id = cu2.channel_id
                    WHERE cu.user_id = ?
                    GROUP BY c.id
                    ORDER BY c.created_at DESC
                `,
                params: [userId]
            }) as Record<string, SqlStorageValue>[];
            
            const channelsWithMemberArray = channels.map(channel => ({
                ...channel,
                member_ids: channel.member_ids ? (channel.member_ids as string).split(',') : []
            }));
            
            return c.json({ success: true, channels: channelsWithMemberArray });
        });

        // Add new endpoint to get online users
        this.app.get('/users/online', async (c) => {
            const onlineUserIds = Array.from(this.connections.keys());
            
            if (onlineUserIds.length === 0) {
                return c.json({ 
                    success: true, 
                    onlineUsers: [] 
                });
            }
            
            const onlineUsers = await this.executeQuery({
                sql: `
                    SELECT id, email, first_name, last_name, avatar 
                    FROM user 
                    WHERE id IN (${onlineUserIds.map(() => '?').join(',')})
                `,
                params: onlineUserIds,
                isRaw: false
            }) as Record<string, SqlStorageValue>[];
            
            return c.json({ 
                success: true, 
                onlineUsers 
            });
        });

        // Login route
        this.app.post('/login', async (c) => {
            const { email, password } = await c.req.json();
            
            if (!email || !password) {
                return c.json({ 
                    success: false, 
                    error: 'Email and password are required' 
                }, 400);
            }

            const hashedPassword = await this.hashPassword(password);

            const [user] = await this.executeQuery({
                sql: `
                    SELECT id, email, first_name, last_name, avatar 
                    FROM user 
                    WHERE email = ? AND password = ?
                    LIMIT 1
                `,
                params: [email, hashedPassword],
                isRaw: false
            }) as Record<string, SqlStorageValue>[];

            if (!user) {
                return c.json({ 
                    success: false, 
                    error: 'Invalid email or password' 
                }, 401);
            }

            // Create new session
            const sessionId = crypto.randomUUID();
            const expiresAt = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now

            await this.executeQuery({
                sql: `
                    INSERT INTO session (id, user_id, expires_at)
                    VALUES (?, ?, ?)
                `,
                params: [sessionId, user.id, expiresAt]
            });

            return c.json({ 
                success: true, 
                user,
                session: {
                    id: sessionId,
                    expires_at: expiresAt
                }
            });
        });

        // Register route
        this.app.post('/register', async (c) => {
            const { email, password, firstName, lastName, avatar } = await c.req.json();
            
            // Validate required fields
            if (!email || !password || !firstName || !lastName) {
                return c.json({ 
                    success: false, 
                    error: 'Email, password, first name, and last name are required' 
                }, 400);
            }

            try {
                // Check if email already exists
                const [existingUser] = await this.executeQuery({
                    sql: 'SELECT 1 FROM user WHERE email = ? LIMIT 1',
                    params: [email]
                }) as Record<string, SqlStorageValue>[];

                if (existingUser) {
                    return c.json({ 
                        success: false, 
                        error: 'Email already registered' 
                    }, 409);
                }

                const hashedPassword = await this.hashPassword(password);
                const userId = crypto.randomUUID();

                // Create new user
                await this.executeQuery({
                    sql: `
                        INSERT INTO user (id, email, password, first_name, last_name, avatar)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    params: [userId, email, hashedPassword, firstName, lastName, avatar || null]
                });

                // Fetch the created user
                const [user] = await this.executeQuery({
                    sql: `
                        SELECT id, email, first_name, last_name, avatar 
                        FROM user 
                        WHERE id = ?
                    `,
                    params: [userId],
                    isRaw: false
                }) as Record<string, SqlStorageValue>[];

                // Create new session
                const sessionId = crypto.randomUUID();
                const expiresAt = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days from now

                await this.executeQuery({
                    sql: `
                        INSERT INTO session (id, user_id, expires_at)
                        VALUES (?, ?, ?)
                    `,
                    params: [sessionId, userId, expiresAt]
                });

                return c.json({ 
                    success: true, 
                    user,
                    session: {
                        id: sessionId,
                        expires_at: expiresAt
                    }
                });
            } catch (error) {
                console.error('Registration error:', error);
                return c.json({ 
                    success: false, 
                    error: 'Failed to create user' 
                }, 500);
            }
        });

        // Optional: Add session validation endpoint
        this.app.get('/session/:sessionId', async (c) => {
            const sessionId = c.req.param('sessionId');
            
            const [session] = await this.executeQuery({
                sql: `
                    SELECT s.*, u.email, u.first_name, u.last_name, u.avatar
                    FROM session s
                    JOIN user u ON s.user_id = u.id
                    WHERE s.id = ? AND s.expires_at > unixepoch()
                    LIMIT 1
                `,
                params: [sessionId],
                isRaw: false
            }) as Record<string, SqlStorageValue>[];

            if (!session) {
                return c.json({ 
                    success: false, 
                    error: 'Invalid or expired session' 
                }, 401);
            }

            return c.json({ 
                success: true, 
                session: {
                    id: session.id,
                    expires_at: session.expires_at
                },
                user: {
                    id: session.user_id,
                    email: session.email,
                    first_name: session.first_name,
                    last_name: session.last_name,
                    avatar: session.avatar
                }
            });
        });

        // Logout route
        this.app.post('/logout', async (c) => {
            const sessionId = c.req.header('X-Session-Id');
            
            if (!sessionId) {
                return c.json({ 
                    success: false, 
                    error: 'Session ID is required' 
                }, 400);
            }

            // Update the session to expire immediately
            await this.executeQuery({
                sql: `
                    UPDATE session 
                    SET expires_at = unixepoch()
                    WHERE id = ?
                `,
                params: [sessionId]
            });

            // Get user ID from session to remove WebSocket connection if exists
            const [session] = await this.executeQuery({
                sql: `SELECT user_id FROM session WHERE id = ?`,
                params: [sessionId]
            }) as Record<string, SqlStorageValue>[];

            if (session?.user_id) {
                const userId = session.user_id as string;
                const connection = this.connections.get(userId);
                
                if (connection) {
                    connection.close(1000, 'Logged out');
                    this.connections.delete(userId);
                    await this.broadcastUserPresence(userId, false);
                }
            }

            return c.json({ 
                success: true 
            });
        });

        // Create new channel
        this.app.post('/channels', async (c) => {
            const sessionId = c.req.header('X-Session-Id');

            // Verify there at least exists a sessionId otherwise access is not granted
            if (!sessionId) {
                return c.json({ 
                    success: false, 
                    error: 'No session for this user exists' 
                }, 500);
            }

            const { valid, userId } = await this.validateSession(sessionId);
            
            if (!valid || !userId) {
                return c.json({ success: false, error: 'Invalid session' }, 401);
            }

            const { name, description, is_private, member_ids } = await c.req.json();
            
            // Validate required fields
            if (!name?.trim()) {
                return c.json({ 
                    success: false, 
                    error: 'Channel name is required' 
                }, 400);
            }

            try {
                const channelId = crypto.randomUUID();

                // Create the channel
                await this.executeQuery({
                    sql: `
                        INSERT INTO channel (id, name, description, is_private)
                        VALUES (?, ?, ?, ?)
                    `,
                    params: [channelId, name, description || null, is_private ? 1 : 0]
                });

                // Add the creator as a member
                await this.executeQuery({
                    sql: `
                        INSERT INTO channel_user (id, channel_id, user_id)
                        VALUES (?, ?, ?)
                    `,
                    params: [crypto.randomUUID(), channelId, userId]
                });

                // Add other members if provided
                if (member_ids && Array.isArray(member_ids) && member_ids.length > 0) {
                    const memberValues = member_ids
                        .filter(memberId => memberId !== userId) // Skip creator as they're already added
                        .map(memberId => `(?, ?, ?)`).join(',');
                    
                    const memberParams = member_ids
                        .filter(memberId => memberId !== userId)
                        .flatMap(memberId => [
                            crypto.randomUUID(),
                            channelId,
                            memberId
                        ]);

                    if (memberParams.length > 0) {
                        await this.executeQuery({
                            sql: `
                                INSERT INTO channel_user (id, channel_id, user_id)
                                VALUES ${memberValues}
                            `,
                            params: memberParams
                        });
                    }
                }

                // Fetch the created channel with member count and member IDs
                const [channel] = await this.executeQuery({
                    sql: `
                        SELECT 
                            c.*,
                            COUNT(DISTINCT cu2.user_id) as member_count,
                            GROUP_CONCAT(cu2.user_id) as member_ids
                        FROM channel c
                        LEFT JOIN channel_user cu2 ON c.id = cu2.channel_id
                        WHERE c.id = ?
                        GROUP BY c.id
                    `,
                    params: [channelId],
                    isRaw: false
                }) as Record<string, SqlStorageValue>[];

                // Format the response
                const formattedChannel = {
                    ...channel,
                    member_ids: channel.member_ids ? (channel.member_ids as string).split(',') : []
                };

                // Notify all members about the new channel
                for (const memberId of formattedChannel.member_ids) {
                    const connection = this.connections.get(memberId as string);
                    if (connection && connection.readyState === 1) {
                        try {
                            connection.send(JSON.stringify({
                                type: 'NEW_CHANNEL',
                                channel: formattedChannel
                            }));
                        } catch (error) {
                            console.error('[Channel Creation] Failed to notify user:', {
                                userId: memberId,
                                error
                            });
                            this.connections.delete(memberId as string);
                        }
                    }
                }

                return c.json({ 
                    success: true, 
                    channel: formattedChannel
                });

            } catch (error) {
                console.error('Channel creation error:', error);
                return c.json({ 
                    success: false, 
                    error: 'Failed to create channel' 
                }, 500);
            }
        });

        // Invite users to channel
        this.app.post('/channels/:channelId/invite', async (c) => {
            const sessionId = c.req.header('X-Session-Id');
            const channelId = c.req.param('channelId');
            const { userIds } = await c.req.json();
            
            const { valid, userId } = await this.validateSession(sessionId);
            if (!valid || !userId) {
                return c.json({ success: false, error: 'Invalid session' }, 401);
            }

            // Verify the inviter is a member of the channel
            const [membership] = await this.executeQuery({
                sql: `SELECT 1 FROM channel_user WHERE channel_id = ? AND user_id = ?`,
                params: [channelId, userId]
            }) as Record<string, SqlStorageValue>[];

            if (!membership) {
                return c.json({ success: false, error: 'Not a member of this channel' }, 403);
            }

            try {
                // Add new members
                const memberValues = userIds.map(() => `(?, ?, ?)`).join(',');
                const memberParams = userIds.flatMap(userId => [
                    crypto.randomUUID(),
                    channelId,
                    userId
                ]);

                await this.executeQuery({
                    sql: `
                        INSERT OR IGNORE INTO channel_user (id, channel_id, user_id)
                        VALUES ${memberValues}
                    `,
                    params: memberParams
                });

                // Fetch updated channel info
                const [channel] = await this.executeQuery({
                    sql: `
                        SELECT 
                            c.*,
                            COUNT(DISTINCT cu2.user_id) as member_count,
                            GROUP_CONCAT(cu2.user_id) as member_ids
                        FROM channel c
                        LEFT JOIN channel_user cu2 ON c.id = cu2.channel_id
                        WHERE c.id = ?
                        GROUP BY c.id
                    `,
                    params: [channelId],
                    isRaw: false
                }) as Record<string, SqlStorageValue>[];

                const formattedChannel = {
                    ...channel,
                    member_ids: channel.member_ids ? (channel.member_ids as string).split(',') : []
                };

                // Notify all members about the channel update
                for (const memberId of formattedChannel.member_ids) {
                    const connection = this.connections.get(memberId as string);
                    if (connection && connection.readyState === 1) {
                        try {
                            connection.send(JSON.stringify({
                                type: 'CHANNEL_UPDATED',
                                channel: formattedChannel
                            }));
                        } catch (error) {
                            console.error('[Channel Invite] Failed to notify user:', {
                                userId: memberId,
                                error
                            });
                            this.connections.delete(memberId as string);
                        }
                    }
                }

                return c.json({ 
                    success: true, 
                    channel: formattedChannel
                });

            } catch (error) {
                console.error('Channel invite error:', error);
                return c.json({ 
                    success: false, 
                    error: 'Failed to invite users to channel' 
                }, 500);
            }
        });

        // Leave channel
        this.app.post('/channels/:channelId/leave', async (c) => {
            const sessionId = c.req.header('X-Session-Id');
            const channelId = c.req.param('channelId');
            
            const { valid, userId } = await this.validateSession(sessionId);
            if (!valid || !userId) {
                return c.json({ success: false, error: 'Invalid session' }, 401);
            }

            try {
                // Remove user from channel
                await this.executeQuery({
                    sql: `
                        DELETE FROM channel_user 
                        WHERE channel_id = ? AND user_id = ?
                    `,
                    params: [channelId, userId]
                });

                // Check if channel is now empty
                const [memberCount] = await this.executeQuery({
                    sql: `
                        SELECT COUNT(*) as count 
                        FROM channel_user 
                        WHERE channel_id = ?
                    `,
                    params: [channelId]
                }) as Record<string, SqlStorageValue>[];

                // If channel is empty, delete it
                if (memberCount.count === 0) {
                    await this.executeQuery({
                        sql: `DELETE FROM channel WHERE id = ?`,
                        params: [channelId]
                    });

                    return c.json({ 
                        success: true, 
                        deleted: true 
                    });
                }

                // Fetch updated channel info
                const [channel] = await this.executeQuery({
                    sql: `
                        SELECT 
                            c.*,
                            COUNT(DISTINCT cu2.user_id) as member_count,
                            GROUP_CONCAT(cu2.user_id) as member_ids
                        FROM channel c
                        LEFT JOIN channel_user cu2 ON c.id = cu2.channel_id
                        WHERE c.id = ?
                        GROUP BY c.id
                    `,
                    params: [channelId],
                    isRaw: false
                }) as Record<string, SqlStorageValue>[];

                const formattedChannel = {
                    ...channel,
                    member_ids: channel.member_ids ? (channel.member_ids as string).split(',') : []
                };

                // Notify remaining members about the update
                for (const memberId of formattedChannel.member_ids) {
                    const connection = this.connections.get(memberId as string);
                    if (connection && connection.readyState === 1) {
                        try {
                            connection.send(JSON.stringify({
                                type: 'CHANNEL_UPDATED',
                                channel: formattedChannel
                            }));
                        } catch (error) {
                            console.error('[Channel Leave] Failed to notify user:', {
                                userId: memberId,
                                error
                            });
                            this.connections.delete(memberId as string);
                        }
                    }
                }

                // Notify the leaving user
                const leavingUserConnection = this.connections.get(userId);
                if (leavingUserConnection && leavingUserConnection.readyState === 1) {
                    try {
                        leavingUserConnection.send(JSON.stringify({
                            type: 'CHANNEL_LEFT',
                            channelId
                        }));
                    } catch (error) {
                        console.error('[Channel Leave] Failed to notify leaving user:', {
                            userId,
                            error
                        });
                        this.connections.delete(userId);
                    }
                }

                return c.json({ 
                    success: true, 
                    deleted: false,
                    channel: formattedChannel
                });

            } catch (error) {
                console.error('Channel leave error:', error);
                return c.json({ 
                    success: false, 
                    error: 'Failed to leave channel' 
                }, 500);
            }
        });
    }

    public async clientConnected(sessionId?: string) {
        const webSocketPair = new WebSocketPair()
        const [client, server] = Object.values(webSocketPair)
        
        if (!sessionId) {
            server.close(1008, 'Session ID is required')
            return new Response('Session ID is required', { status: 400 })
        }

        const [session] = await this.executeQuery({
            sql: `
                SELECT s.*, u.id as user_id
                FROM session s
                JOIN user u ON s.user_id = u.id
                WHERE s.id = ? AND s.expires_at > unixepoch()
                LIMIT 1
            `,
            params: [sessionId],
            isRaw: false
        }) as Record<string, SqlStorageValue>[];

        if (!session) {
            server.close(1008, 'Invalid or expired session')
            return new Response('Invalid session', { status: 401 })
        }

        const userId = session.user_id as string;

        // Store the server-side socket with the user ID as the key
        this.connections.set(userId, server)

        // Notify other clients about the new connection
        await this.broadcastUserPresence(userId, true);

        // Accept and configure the WebSocket
        server.accept()

        server.addEventListener('message', async (msg) => {
            await this.webSocketMessage(server, msg.data)
        })

        server.addEventListener('close', async () => {
            this.connections.delete(userId)
            await this.broadcastUserPresence(userId, false);
        })

        server.addEventListener('error', async (err) => {
            console.error(`WebSocket error for user ${userId}:`, err)
            this.connections.delete(userId)
            await this.broadcastUserPresence(userId, false);
        })

        return new Response(null, { status: 101, webSocket: client })
    }

    private async broadcastUserPresence(userId: string, isOnline: boolean) {
        const notification = JSON.stringify({
            type: isOnline ? 'USER_CONNECTED' : 'USER_DISCONNECTED',
            userId
        });

        // Get user details
        const [user] = await this.executeQuery({
            sql: `SELECT id, email, first_name, last_name, avatar FROM user WHERE id = ?`,
            params: [userId]
        }) as Record<string, SqlStorageValue>[];

        // Broadcast to all connected clients except the user who triggered the event
        for (const [connectedUserId, socket] of this.connections.entries()) {
            if (connectedUserId !== userId && socket.readyState === 1) {
                try {
                    socket.send(notification);
                } catch (error) {
                    console.error('[Presence] Failed to send to user:', {
                        userId: connectedUserId,
                        error
                    });
                    this.connections.delete(connectedUserId);
                }
            }
        }
    }

    async webSocketMessage(ws: WebSocket, message: any) {
        const { sql, params, action } = JSON.parse(message)

        
    }

    async webSocketClose(
        ws: WebSocket,
        code: number,
        reason: string,
        wasClean: boolean
    ) {
        // If the client closes the connection, the runtime will invoke the webSocketClose() handler.
        ws.close(code, 'StarbaseDB is closing WebSocket connection')

        // Remove the WebSocket connection from the map
        const tags = this.ctx.getTags(ws)
        if (tags.length) {
            const wsSessionId = tags[0]
            this.connections.delete(wsSessionId)
        }
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url)

        if (url.pathname === '/ws') {
            if (request.headers.get('upgrade') === 'websocket') {
                const sessionId = url.searchParams.get('sessionId') ?? ''
                return this.clientConnected(sessionId)
            }
            return new Response('Expected WebSocket', { status: 400 })
        }

        return this.app.fetch(request);
    }

    private async executeRawQuery<
        T extends Record<string, SqlStorageValue> = Record<string, SqlStorageValue>,
    >(opts: { sql: string; params?: unknown[] }) {
        const { sql, params } = opts

        try {
            let cursor

            if (params && params.length) {
                cursor = this.sql.exec<T>(sql, ...params)
            } else {
                cursor = this.sql.exec<T>(sql)
            }

            return cursor
        } catch (error) {
            console.error('SQL Execution Error:', error)
            throw error
        }
    }

    public async executeQuery<T extends Record<string, SqlStorageValue>>(opts: {
        sql: string
        params?: unknown[]
        isRaw?: boolean
    }): Promise<T[] | { columns: string[]; rows: SqlStorageValue[][]; meta: { rows_read: number; rows_written: number } }> {
        const cursor = await this.executeRawQuery<T>(opts)

        if (opts.isRaw) {
            return {
                columns: cursor.columnNames,
                rows: Array.from(cursor.raw()),
                meta: {
                    rows_read: cursor.rowsRead,
                    rows_written: cursor.rowsWritten,
                },
            }
        }

        return cursor.toArray()
    }

    public async notifyChannelUpdate(channelId: string, message: any) {
        const users = await this.executeQuery({
            sql: `SELECT user_id FROM channel_user WHERE channel_id = ?`,
            params: [channelId]
        }) as { user_id: string }[];

        const notification = JSON.stringify({
            type: 'NEW_MESSAGE',
            channelId,
            message
        });

        console.log('[Notify] About to notify users:', {
            channelId,
            totalUsers: users.length,
            userIds: users.map(u => u.user_id),
            activeConnections: Array.from(this.connections.keys())
        });

        for (const { user_id } of users) {
            const userSocket = this.connections.get(user_id);
            console.log('[Notify] Checking socket for user:', {
                userId: user_id,
                hasSocket: !!userSocket,
                socketState: userSocket?.readyState,
                isOpen: userSocket?.readyState === 1 // WebSocket.OPEN is 1
            });
            
            if (userSocket && userSocket.readyState === 1) { // WebSocket.OPEN is 1
                console.log('[Notify] Sending notification to user:', user_id);
                try {
                    userSocket.send(notification);
                } catch (error) {
                    console.error('[Notify] Failed to send to user:', {
                        userId: user_id,
                        error
                    });
                    this.connections.delete(user_id);
                }
            } else if (userSocket) {
                console.log('[Notify] Removing stale connection for user:', user_id);
                this.connections.delete(user_id);
            }
        }
    }

    private async hashPassword(password: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    private async validateSession(sessionId: string | null): Promise<{ valid: boolean; userId?: string }> {
        if (!sessionId) {
            return { valid: false };
        }

        const [session] = await this.executeQuery({
            sql: `
                SELECT user_id
                FROM session
                WHERE id = ? AND expires_at > unixepoch()
                LIMIT 1
            `,
            params: [sessionId],
            isRaw: false
        }) as Record<string, SqlStorageValue>[];

        if (!session) {
            return { valid: false };
        }

        return { 
            valid: true, 
            userId: session.user_id as string 
        };
    }

    public async notify(channelId: string, message: any) {
        await this.notifyChannelUpdate(channelId, message);
    }

    public async checkChannelAccess(sessionId: string, channelId: string): Promise<boolean> {
        const { valid, userId } = await this.validateSession(sessionId);
        if (!valid || !userId) {
            return false;
        }
        
        const access = await this.executeQuery({
            sql: `
                SELECT 1
                FROM channel_user
                WHERE channel_id = ? AND user_id = ?
                LIMIT 1
            `,
            params: [channelId, userId]
        }) as Record<string, SqlStorageValue>[];
        
        return access.length > 0;
    }
} 