import { FLAG_LABELS } from "../../lib/flagText";
import { formatDollars } from "../../lib/money";
import { LANGUAGES, type Advisory, type Incident, type Partner } from "../../lib/types";
import { amountAsked } from "./summary";

/** The Canadian Anti-Fraud Centre's online reporting system. */
export const CAFC_REPORT_URL = "https://reportcyberandfraud.canada.ca/";

/**
 * The text a partner sends its own members (by text message, email or newsletter) to pass on an
 * advisory. Partners reach members through channels they already run; TrustLine writes the alert.
 */
export function memberAlert(advisory: Advisory, sender: Partner): string {
  const advice =
    sender.kind === "financial"
      ? "We will never ask you to pay with gift cards or crypto, or to share a code. If unsure, call the number on the back of your card."
      : "If you get a call like this, hang up and call the organization's official number yourself.";
  return `${sender.name} scam alert: ${advisory.title}. ${advisory.body} ${advice}`;
}

/**
 * A summary of one report for the Canadian Anti-Fraud Centre, so the partner can file it without
 * retyping. Uses only what was shared: the redacted excerpt and the warning signs.
 */
export function cafcSummary(incident: Incident, reporter: Partner): string {
  const language = LANGUAGES.find((l) => l.code === incident.language)?.label ?? incident.language;
  const amount = amountAsked(incident);
  return [
    `Reported by: ${reporter.name}, on behalf of a member (identity withheld)`,
    `Date reported: ${new Date(incident.createdAt).toLocaleString("en-CA")}`,
    `Caller claimed to be: ${incident.claimedOrg ?? "Not stated"}`,
    `Tactics: ${incident.flags.map((f) => FLAG_LABELS[f]).join(", ") || "None identified"}`,
    `Amount demanded: ${amount === null ? "Not stated" : formatDollars(amount)}`,
    `Member's language: ${language}`,
    "",
    "What the caller said (personal details removed):",
    incident.redactedExcerpt,
  ].join("\n");
}

const csvCell = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

/**
 * Anonymized reports for the Anti-Fraud Centre, funders or researchers. Leaves out the excerpt,
 * so no free text that might still identify someone leaves the dashboard.
 */
export function incidentsCsv(incidents: Incident[]): string {
  const header = [
    "reported_at",
    "risk",
    "claimed_org",
    "tactics",
    "amount_demanded_cad",
    "member_language",
  ];
  const rows = incidents.map((i) => [
    i.createdAt,
    i.risk,
    i.claimedOrg ?? "",
    i.flags.join(" "),
    String(amountAsked(i) ?? ""),
    i.language,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}
