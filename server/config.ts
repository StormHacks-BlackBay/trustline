import { DEMO_USERS } from "../src/data/partners";

export interface ServerConfig {
  port: number;
  /** Public https origin Twilio reaches, used for the stream URL and signature checks. */
  publicUrl: string;
  /** Validates X-Twilio-Signature when set. Required in production. */
  twilioAuthToken: string | null;
  /** Origin allowed to subscribe to call events. */
  appOrigin: string;
  /** Caller phone number (E.164) to demo user id. */
  phoneLinks: Record<string, string>;
  defaultUserId: string;
  /** Calls are cut off after this long, so a forgotten call cannot keep spending credit. */
  maxCallMs: number;
}

function parsePhoneLinks(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).filter((e): e is [string, string] => typeof e[1] === "string"),
      );
    }
  } catch {
    console.warn("PHONE_LINKS is not valid JSON; ignoring it");
  }
  return {};
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  // A blank line such as `PUBLIC_URL=` in .env means "not set", not "set to nothing".
  const read = (name: string) => env[name]?.trim() || undefined;
  const port = Number(read("PORT") ?? 8787);
  return {
    port,
    publicUrl: (read("PUBLIC_URL") ?? `http://localhost:${port}`).replace(/\/$/, ""),
    twilioAuthToken: read("TWILIO_AUTH_TOKEN") ?? null,
    appOrigin: (read("APP_ORIGIN") ?? "*").replace(/\/$/, ""),
    phoneLinks: parsePhoneLinks(read("PHONE_LINKS")),
    defaultUserId: read("DEFAULT_USER_ID") ?? DEMO_USERS[0]?.id ?? "harpreet",
    maxCallMs: Number(read("MAX_CALL_MINUTES") ?? 10) * 60_000,
  };
}

export function userForCaller(config: ServerConfig, from: string | null): string {
  return (from && config.phoneLinks[from]) || config.defaultUserId;
}
