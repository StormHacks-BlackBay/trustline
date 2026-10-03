import type { IncomingMessage, ServerResponse } from "node:http";

export async function readBody(req: IncomingMessage, limit = 64 * 1024): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limit) throw new Error("Request body too large");
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function parseForm(body: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(body));
}

export function send(res: ServerResponse, status: number, body: string, contentType: string) {
  res.writeHead(status, { "content-type": contentType, "cache-control": "no-store" });
  res.end(body);
}
