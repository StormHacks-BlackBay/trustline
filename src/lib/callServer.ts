const url = import.meta.env.VITE_CALL_SERVER_URL?.replace(/\/$/, "") || null;
const number = import.meta.env.VITE_TRUSTLINE_NUMBER || null;

/** The phone-call server and the TrustLine number users merge into calls, when configured. */
export const callServer = { url, number, enabled: Boolean(url && number) };

/** A contact card so TrustLine is one tap away under Add Call. */
export function trustLineVCard(phone: string): string {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:TrustLine",
    "ORG:TrustLine",
    `TEL;TYPE=CELL:${phone}`,
    "END:VCARD",
  ].join("\r\n");
}
