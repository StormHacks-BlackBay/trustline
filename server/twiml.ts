const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

/**
 * TwiML for the TrustLine number. It announces itself once (so everyone on the call knows TrustLine
 * joined) and opens a bidirectional media stream: audio in for transcription, audio out for warnings.
 */
export function connectStreamTwiml(streamUrl: string, from: string | null): string {
  const parameter = from ? `<Parameter name="from" value="${escapeXml(from)}"/>` : "";
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<Response>`,
    `<Say>TrustLine is listening.</Say>`,
    `<Connect><Stream url="${escapeXml(streamUrl)}">${parameter}</Stream></Connect>`,
    `</Response>`,
  ].join("");
}

export function rejectTwiml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Reject/></Response>`;
}
