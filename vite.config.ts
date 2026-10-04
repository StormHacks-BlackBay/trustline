import type { IncomingMessage } from "node:http";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

type Handler = (request: Request) => Promise<Response>;

async function toRequest(req: IncomingMessage, signal: AbortSignal): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers.set(key, value);
  }
  return new Request(`http://localhost${req.url ?? "/"}`, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
    signal,
  });
}

/** Serves the Vercel functions in /api during `vite dev`, using the same Web Request handlers. */
function devApi(): Plugin {
  return {
    name: "trustline-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([a-z-]+)(?:\?.*)?$/);
        if (!match) return next();
        try {
          const mod = (await server.ssrLoadModule(`/api/${match[1]}.ts`)) as Record<
            string,
            Handler
          >;
          const handler = mod[req.method ?? "GET"];
          if (!handler) {
            res.statusCode = 405;
            return res.end();
          }
          // Like Vercel, abort the handler's request when the browser goes away, so a cancelled
          // scoring request also cancels its Gemini call.
          const disconnected = new AbortController();
          res.on("close", () => {
            if (!res.writableEnded) disconnected.abort();
          });
          const response = await handler(await toRequest(req, disconnected.signal));
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          server.config.logger.error(String(error));
          res.statusCode = 500;
          res.end();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Server-only keys (no VITE_ prefix) are exposed to the dev API handlers, never to the bundle.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return { plugins: [react(), devApi()] };
});
