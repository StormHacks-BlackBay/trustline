import { z } from "zod";

// Messages Twilio sends on a bidirectional <Connect><Stream>.
// https://www.twilio.com/docs/voice/media-streams/websocket-messages
export const TwilioMessageSchema = z.discriminatedUnion("event", [
  z.object({ event: z.literal("connected") }),
  z.object({
    event: z.literal("start"),
    streamSid: z.string(),
    start: z.object({
      callSid: z.string(),
      customParameters: z.record(z.string(), z.string()).optional(),
    }),
  }),
  z.object({
    event: z.literal("media"),
    streamSid: z.string(),
    media: z.object({ payload: z.string(), track: z.string().optional() }),
  }),
  z.object({
    event: z.literal("mark"),
    streamSid: z.string(),
    mark: z.object({ name: z.string() }),
  }),
  z.object({ event: z.literal("stop"), streamSid: z.string() }),
  z.object({ event: z.literal("dtmf"), streamSid: z.string() }),
]);

export type TwilioMessage = z.infer<typeof TwilioMessageSchema>;

/** Audio sent back into the call: base64 mu-law, 8 kHz mono. */
export const mediaMessage = (streamSid: string, payload: string) =>
  JSON.stringify({ event: "media", streamSid, media: { payload } });

export const markMessage = (streamSid: string, name: string) =>
  JSON.stringify({ event: "mark", streamSid, mark: { name } });
