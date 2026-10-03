import { z } from "zod";
import { RISK_LEVELS } from "./types";

/** Events the call server sends to the app about a call TrustLine has been merged into. */
export const CallEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("call_started"),
    callId: z.string(),
    at: z.string(),
  }),
  z.object({ type: z.literal("partial"), callId: z.string(), text: z.string() }),
  z.object({ type: z.literal("segment"), callId: z.string(), id: z.string(), text: z.string() }),
  z.object({
    type: z.literal("warning_spoken"),
    callId: z.string(),
    risk: z.enum(RISK_LEVELS),
    text: z.string(),
  }),
  z.object({ type: z.literal("call_ended"), callId: z.string() }),
]);

export type CallEvent = z.infer<typeof CallEventSchema>;
