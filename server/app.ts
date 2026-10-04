import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import twilio from "twilio";
import { WebSocketServer } from "ws";
import { CallSession, type SessionDeps } from "./callSession";
import { userForCaller, type ServerConfig } from "./config";
import { handleEvents } from "./events";
import { parseForm, readBody, send } from "./http";
import type { CallArchive } from "./archive";
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
  const streamUrl = mediaStreamUrl(config);
  console.log(`Incoming call for user ${userForCaller(config, from)}`);
  send(res, 200, connectStreamTwiml(streamUrl, from), "text/xml");
}

/** The exact wss:// address given to Twilio in the TwiML, which Twilio also signs. */
export const mediaStreamUrl = (config: ServerConfig) =>
  `${config.publicUrl.replace(/^http/, "ws")}/twilio/media`;

/**
 * Twilio signs the media stream's WebSocket handshake like a webhook, using the wss:// URL from
 * the TwiML and no parameters. Without this check, anyone who found the server could stream audio
 * and spend transcription, scoring and speech credit.
 */
function mediaHandshakeIsTrusted(req: IncomingMessage, config: ServerConfig): boolean {
  if (!config.twilioAuthToken) return true;
  const signature = req.headers["x-twilio-signature"];
  if (typeof signature !== "string") return false;
  const query = (req.url ?? "").includes("?")
    ? (req.url ?? "").slice((req.url ?? "").indexOf("?"))
    : "";
  return twilio.validateRequest(
    config.twilioAuthToken,
    signature,
    `${mediaStreamUrl(config)}${query}`,
    {},
  );
}

/** One saved call for the after-call page. The id is the only key, so it must stay unguessable. */
function handleSummary(
  res: ServerResponse,
  id: string,
  archive: CallArchive | undefined,
  config: ServerConfig,
) {
  const summary = archive?.get(id) ?? null;
  res.writeHead(summary ? 200 : 404, {
    "content-type": "application/json",
    "cache-control": "no-store",
    "access-control-allow-origin": config.appOrigin,
  });
  res.end(JSON.stringify(summary ?? { error: "not_found" }));
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
    const summaryMatch = path?.match(/^\/calls\/([\w-]{1,64})$/);
    if (req.method === "GET" && summaryMatch?.[1]) {
      return handleSummary(res, summaryMatch[1], deps.archive, config);
    }
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
    if (!mediaHandshakeIsTrusted(req, config)) {
      console.warn("Rejected a media stream without a valid Twilio signature");
      socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => createSession(ws, deps));
  });
  server.on("close", () => wss.close());

  return server;
}
