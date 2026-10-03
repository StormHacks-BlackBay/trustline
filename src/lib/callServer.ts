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

/** "+16045550123" to "+1 604-555-0123" for North American numbers; other formats unchanged. */
export function formatPhone(e164: string): string {
  const match = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return match ? `+1 ${match[1]}-${match[2]}-${match[3]}` : e164;
}
