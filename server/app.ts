import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import twilio from "twilio";
import { WebSocketServer } from "ws";
import { CallSession, type SessionDeps } from "./callSession";
import { userForCaller, type ServerConfig } from "./config";
import { handleEvents } from "./events";
import { parseForm, readBody, send } from "./http";
import { connectStreamTwiml, rejectTwiml } from "./twiml";

async function handleVoice(req: IncomingMessage, res: ServerResponse, config: ServerConfig) {
  const params = parseForm(await readBody(req));

  if (config.twilioAuthToken) {
    const signature = req.headers["x-twilio-signature"];
    const url = `${config.publicUrl}${req.url ?? ""}`;
    const valid =
      typeof signature === "string" &&
      twilio.validateRequest(config.twilioAuthToken, signature, url, params);
    if (!valid) return send(res, 403, rejectTwiml(), "text/xml");
  }

  const from = params.From ?? null;
  const streamUrl = `${config.publicUrl.replace(/^http/, "ws")}/twilio/media`;
  console.log(`Incoming call for user ${userForCaller(config, from)}`);
  send(res, 200, connectStreamTwiml(streamUrl, from), "text/xml");
}

type Socket = ConstructorParameters<typeof CallSession>[0];

/** HTTP routes plus the Twilio media WebSocket. */
export function createCallServer<D extends SessionDeps>(
  deps: D,
  createSession: (ws: Socket, deps: D) => unknown = (ws, d) => new CallSession(ws, d),
): Server {
  const { config } = deps;
  const server = createServer((req, res) => {
    const path = (req.url ?? "/").split("?")[0];
    if (req.method === "GET" && path === "/health") return send(res, 200, "ok", "text/plain");
    if (req.method === "GET" && path === "/events") return handleEvents(req, res, deps);
    if (req.method === "POST" && path === "/twilio/voice") {
      handleVoice(req, res, config).catch((error: unknown) => {
        console.error("Voice webhook failed", error);
        send(res, 500, rejectTwiml(), "text/xml");
      });
      return;
    }
    send(res, 404, "not found", "text/plain");
  });

  const wss = new WebSocketServer({ noServer: true });
  server.on("upgrade", (req, socket, head) => {
    if ((req.url ?? "").split("?")[0] !== "/twilio/media") {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => createSession(ws, deps));
  });
  server.on("close", () => wss.close());

  return server;
}
