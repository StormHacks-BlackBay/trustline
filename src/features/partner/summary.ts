import { FLAG_LABELS } from "../../lib/flagText";
import { largestAmount } from "../../lib/money";
import { LANGUAGES, type FlagId, type Incident, type LanguageCode } from "../../lib/types";

export interface Count<K> {
  key: K;
  label: string;
  count: number;
}

export interface IncidentSummary {
  total: number;
  likelyScams: number;
  /** The organization callers pretended to be most often, if any was named. */
  topClaimedOrg: string | null;
  /** Sum of the largest amount each warned-about report asked for, in dollars. */
  moneyAtRisk: number;
  /** Warning signs across all reports, most common first. */
  tactics: Count<FlagId>[];
  /** The languages members chose for their warnings, most common first. */
  languages: Count<LanguageCode>[];
}

/** The largest sum of money the caller or sender asked for, from the redacted excerpt. */
export function amountAsked(incident: Incident): number | null {
  return largestAmount(incident.redactedExcerpt);
}

function countBy<K extends string>(keys: K[], label: (key: K) => string): Count<K>[] {
  const counts = new Map<K, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: label(key), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function summarize(incidents: Incident[]): IncidentSummary {
  const orgs = countBy(
    incidents.flatMap((i) => (i.claimedOrg ? [i.claimedOrg] : [])),
    (org) => org,
  );
  return {
    total: incidents.length,
    likelyScams: incidents.filter((i) => i.risk === "high").length,
    topClaimedOrg: orgs[0]?.key ?? null,
    moneyAtRisk: incidents
      .filter((i) => i.risk !== "low")
      .reduce((sum, i) => sum + (amountAsked(i) ?? 0), 0),
    tactics: countBy(
      incidents.flatMap((i) => i.flags),
      (flag) => FLAG_LABELS[flag],
    ),
    languages: countBy(
      incidents.map((i) => i.language),
      (code) => LANGUAGES.find((l) => l.code === code)?.label ?? code,
    ),
  };
}
