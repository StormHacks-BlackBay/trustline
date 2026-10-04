import { FLAG_PRIORITY } from "./flagText";
import type { FlagId, Incident } from "./types";

const TACTICS: Record<FlagId, string> = {
  gift_card_payment: "asks for payment in gift cards",
  crypto_payment: "asks for payment in cryptocurrency",
  wire_transfer: "asks people to move money",
  upfront_fee: "charges fees for jobs, LMIAs or work permits",
  one_time_code: "asks for verification codes or PINs",
  personal_info: "asks for personal details such as a SIN",
  remote_access: "asks to control phones or computers",
  suspicious_link: 'sends links to pay or "verify" an account',
  secrecy: "tells people to keep the call secret",
  urgency: "pressures people to act right away",
  arrest_threat: "threatens arrest",
  deportation_threat: "threatens deportation",
};

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

export const ADVISORY_TITLE_MAX = 120;
export const ADVISORY_BODY_MAX = 1000;

/** A starting draft the partner can edit before publishing. */
export function draftAdvisory(incident: Incident): { title: string; body: string } {
  const org = incident.claimedOrg;
  const tactics = FLAG_PRIORITY.filter((f) => incident.flags.includes(f))
    .slice(0, 4)
    .map((f) => TACTICS[f]);

  const title = org ? `Scam calls pretending to be ${org}` : "Scam calls reported in our community";
  const who = org ? `someone claiming to be from ${org}` : "someone claiming to be an official";
  const caller = tactics.length > 0 ? ` The caller ${joinList(tactics)}.` : "";
  const never = org ? ` This is not how ${org} contacts people.` : "";
  const body = `People in our community are getting calls from ${who}.${caller}${never} Hang up and contact the organization using its official number. Never use a number the caller gives you.`;

  return { title: title.slice(0, ADVISORY_TITLE_MAX), body: body.slice(0, ADVISORY_BODY_MAX) };
}
