import type { IncomingMessage, ServerResponse } from "node:http";
import { DEMO_USERS } from "../src/data/partners";
import { LanguageCodeSchema } from "../src/lib/schemas";
import type { SessionDeps } from "./callSession";
import { send } from "./http";

const HEARTBEAT_MS = 25_000;

/**
 * Server-Sent Events stream of a user's merged calls. The app passes its warning language so
 * spoken warnings match what the user picked.
 */
export function handleEvents(req: IncomingMessage, res: ServerResponse, deps: SessionDeps): void {
  const url = new URL(req.url ?? "/", "http://localhost");
  const userId = url.searchParams.get("user");
  if (!userId || !DEMO_USERS.some((u) => u.id === userId)) {
    return send(res, 400, "unknown user", "text/plain");
  }
  const language = LanguageCodeSchema.safeParse(url.searchParams.get("lang"));
  if (language.success) deps.languages.set(userId, language.data);

  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-store",
    connection: "keep-alive",
    "access-control-allow-origin": deps.config.appOrigin,
  });
  res.write(": connected\n\n");

  const unsubscribe = deps.hub.subscribe(userId, (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
  const heartbeat = setInterval(() => res.write(": ping\n\n"), HEARTBEAT_MS);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
}
