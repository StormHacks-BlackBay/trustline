import type { Incident } from "../../lib/types";

export interface IncidentSummary {
  total: number;
  likelyScams: number;
  /** The organization callers pretended to be most often, if any was named. */
  topClaimedOrg: string | null;
}

export function summarize(incidents: Incident[]): IncidentSummary {
  const counts = new Map<string, number>();
  for (const incident of incidents) {
    if (incident.claimedOrg)
      counts.set(incident.claimedOrg, (counts.get(incident.claimedOrg) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return {
    total: incidents.length,
    likelyScams: incidents.filter((i) => i.risk === "high").length,
    topClaimedOrg: top?.[0] ?? null,
  };
}
