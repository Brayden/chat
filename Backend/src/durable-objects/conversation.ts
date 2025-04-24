import { Hono } from "hono";
import { cors } from "hono/cors";
import { DurableObject } from "cloudflare:workers";
import { Browsable } from "@outerbase/browsable-durable-object";
import { Env } from "../types/env";

@Browsable()
export class ConversationDurableObject extends DurableObject<Env> {
    private app: Hono = new Hono();
    public sql: SqlStorage;

    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        this.sql = ctx.storage.sql;
        this.setup()
    }

    private async setup() {
        await this.executeQuery({
            sql: `
                CREATE TABLE IF NOT EXISTS message (
                    id TEXT PRIMARY KEY,
                    channel_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    content TEXT NOT NULL,
                    assets TEXT DEFAULT '[]',
                    created_at INTEGER DEFAULT (unixepoch())
                );
            `
        });

        this.setupRoutes();
    }

    private setupRoutes() {
        this.app.use('*', cors());

        this.app.get('/channel/messages', async (c) => {
            const channelId = c.req.header('X-Channel-Id');
            const limit = parseInt(c.req.query('limit') || '50');
            const before = c.req.query('before');
            
            const messages = await this.executeQuery({
                sql: `
                    SELECT m.*
                    FROM message m
                    WHERE m.channel_id = ?
                    ${before ? 'AND m.created_at < (SELECT created_at FROM message WHERE id = ?)' : ''}
                    ORDER BY m.created_at DESC
                    LIMIT ?
                `,
                params: before ? [channelId, before, limit] : [channelId, limit]
            });

            return c.json({ 
                success: true, 
                messages,
                hasMore: (messages as any[]).length === limit 
            });
        });

        this.app.post('/channel/messages', async (c) => {
            const channelId = c.req.header('X-Channel-Id');
            const sessionId = c.req.header('X-Session-Id');
            
            // Validate session and get userId from Authorization DO
            let id = this.env.AUTHORIZATION_DURABLE_OBJECT.idFromName('default');
            let authDO = this.env.AUTHORIZATION_DURABLE_OBJECT.get(id);
            const { valid, userId } = await (authDO as any).validateSession(sessionId);
    
            if (!valid || !userId) {
                return c.json({ success: false, error: 'Invalid session' }, 401);
            }

            const { content, assets } = await c.req.json();
            
            if (!content?.trim()) {
                return c.json({ success: false, error: 'Message content is required' }, 400);
            }

            const messageId = crypto.randomUUID()
            const assetsJson = JSON.stringify(assets);

            const result = await this.executeQuery({
                sql: `
                    INSERT INTO message (id, channel_id, user_id, content, assets)
                    VALUES (?, ?, ?, ?, ?)
                `,
                params: [messageId, channelId, userId, content, assetsJson]
            });
            
            const [message] = await this.executeQuery({
                sql: `
                    SELECT 
                        m.*
                    FROM message m
                    WHERE m.id = ?
                `,
                params: [messageId]
            }) as Record<string, SqlStorageValue>[];

            // Notify Authorization DO about the new message
            await (authDO as any).notify(channelId, message);
            
            return c.json({ 
                success: true, 
                message 
            });
        });

        this.app.post('/channel/upload', async (c) => {
            const channelId = c.req.header('X-Channel-Id');
            const sessionId = c.req.header('X-Session-Id');
            
            // Validate session and get userId from Authorization DO
            let id = this.env.AUTHORIZATION_DURABLE_OBJECT.idFromName('default');
            let authDO = this.env.AUTHORIZATION_DURABLE_OBJECT.get(id);
            const { valid, userId } = await (authDO as any).validateSession(sessionId);

            if (!valid || !userId) {
                return c.json({ success: false, error: 'Invalid session' }, 401);
            }

            // Get the file from the request
            const formData = await c.req.formData();
            const file = formData.get('file') as File;
            
            if (!file) {
                return c.json({ success: false, error: 'No file provided' }, 400);
            }

            // Generate a unique filename
            const fileExtension = file.name.split('.').pop();
            const uniqueFilename = `${channelId}/${crypto.randomUUID()}.${fileExtension}`;

            // Upload to R2
            try {
                await this.env.MESSAGE_ASSETS.put(uniqueFilename, file, {
                    httpMetadata: {
                        contentType: file.type,
                    }
                });

                // Generate the public URL
                const assetUrl = `https://pub-b8600d78cd7444e0b66bf753906f5370.r2.dev/${uniqueFilename}`;

                return c.json({ 
                    success: true, 
                    url: assetUrl
                });
            } catch (error) {
                console.error('File upload error:', error);
                return c.json({ 
                    success: false, 
                    error: 'Failed to upload file' 
                }, 500);
            }
        });
    }

    async fetch(request: Request): Promise<Response> {
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
} 