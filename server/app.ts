import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import twilio from "twilio";
import { userForCaller, type ServerConfig } from "./config";
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

/** HTTP routes for the call server. WebSocket and event routes are attached in later layers. */
export function createCallServer(config: ServerConfig): Server {
  return createServer((req, res) => {
    const path = (req.url ?? "/").split("?")[0];
    if (req.method === "GET" && path === "/health") return send(res, 200, "ok", "text/plain");
    if (req.method === "POST" && path === "/twilio/voice") {
      handleVoice(req, res, config).catch((error: unknown) => {
        console.error("Voice webhook failed", error);
        send(res, 500, rejectTwiml(), "text/xml");
      });
      return;
    }
    send(res, 404, "not found", "text/plain");
  });
}
