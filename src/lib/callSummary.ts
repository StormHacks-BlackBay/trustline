import { z } from "zod";
import { LanguageCodeSchema } from "./schemas";
import { RISK_LEVELS } from "./types";

/**
 * What the call server keeps about a finished call that TrustLine was merged into, for the
 * after-call page linked from the text message. Kept in memory for a day, then discarded.
 */
export const CallSummarySchema = z.object({
  /** Random and unguessable: it is the only thing protecting the link. */
  id: z.string(),
  userId: z.string(),
  language: LanguageCodeSchema,
  startedAt: z.string(),
  endedAt: z.string(),
  /** What the other side said, one entry per committed phrase. */
  segments: z.array(z.string()),
  /** The warning TrustLine gave during the call, if it gave one. */
  warning: z
    .object({ risk: z.enum(RISK_LEVELS), text: z.string(), spoken: z.boolean() })
    .nullable(),
});

export type CallSummary = z.infer<typeof CallSummarySchema>;

/** Path of the after-call page for a summary, served by the web app. */
export const afterCallPath = (id: string) => `/after-call/${encodeURIComponent(id)}`;
