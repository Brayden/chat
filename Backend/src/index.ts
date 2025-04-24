import { Hono } from "hono";
import { cors } from "hono/cors";
import { studio } from "@outerbase/browsable-durable-object";
import { Env } from "./types/env";
import { AuthorizationDurableObject } from "./durable-objects/authorization";
import { ConversationDurableObject } from "./durable-objects/conversation";

export { AuthorizationDurableObject, ConversationDurableObject };

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const app = new Hono();
        const url = new URL(request.url);

        // Apply CORS to all routes except WebSocket paths
        app.use('*', async (c, next) => {
            const path = new URL(c.req.url).pathname;
            
            // Skip CORS for WebSocket routes
            if (path === '/ws') {
                return next();
            }
            
            // Apply CORS for other routes
            return cors()(c, next);
        });
        
        app.all('*', async (c) => {
            if (url.pathname.startsWith('/channel/')) {
                // This block has logic for any endpoint accessing our `/channel/` routes
                // to verify the correct users have the correct privileges to do the actions
                // they are attempting to complete.

                const sessionId = request.headers.get('X-Session-Id');
                const channelId = request.headers.get('X-Channel-Id');
                if (!sessionId) {
                    return new Response('Unauthorized', { status: 401 });
                }

                // Check that the user has access to channel in question using AUTHORIZATION_DURABLE_OBJECT
                const authId = env.AUTHORIZATION_DURABLE_OBJECT.idFromName('default');
                const authStub = env.AUTHORIZATION_DURABLE_OBJECT.get(authId);
                const hasAccess = await (authStub as any).checkChannelAccess(sessionId, channelId);
                if (!hasAccess) {
                    return new Response('Access denied', { status: 403 });
                }

                // If authorized, forward to CONVERSATION_DURABLE_OBJECT
                const id = env.CONVERSATION_DURABLE_OBJECT.idFromName(`channel-${channelId}`);
                const stub = env.CONVERSATION_DURABLE_OBJECT.get(id);
                return stub.fetch(request);
            } else {
                // If the user is accessing an endpoint that does NOT have anything to do
                // with a channel, such as `/login` or `/register` then we will simply pass
                // the request to our AUTHORIZATION_DURABLE_OBJECT to continue handling.
                let id = env.AUTHORIZATION_DURABLE_OBJECT.idFromName('default');
                let stub = env.AUTHORIZATION_DURABLE_OBJECT.get(id);
                return stub.fetch(request);
            }
        });

        return app.fetch(request, env, ctx);
    }
} satisfies ExportedHandler<Env>;


// Removing this code for now, but does give the benefit of having
// observability into each of the Durable Objects with a visual database
// user interface.
// ----------------------------------------
// if (url.pathname === '/studio') {
//     return await studio(request, env.AUTHORIZATION_DURABLE_OBJECT, {
//         basicAuth: {
//             username: 'admin',
//             password: 'password',
//         },
//     });
// }

// if (url.pathname === '/studio-chat') {
//     return await studio(request, env.CONVERSATION_DURABLE_OBJECT, {
//         basicAuth: {
//             username: 'admin',
//             password: 'password',
//         },
//     });
// }
