import twilio from "twilio";

/** Sends one text message. Resolves when Twilio accepted it. */
export type SmsSender = (to: string, body: string) => Promise<void>;

/** Texts from the TrustLine number through Twilio's Messages API. */
export function twilioSms(accountSid: string, authToken: string, from: string): SmsSender {
  const client = twilio(accountSid, authToken);
  return async (to, body) => {
    await client.messages.create({ to, from, body });
  };
}
