import { createClient } from "@supabase/supabase-js";
import type { Advisory, FlagId, Incident, LanguageCode, RiskLevel } from "../types";
import type { DataStore, NewAdvisory, NewIncident } from "./types";

interface IncidentRow {
  id: string;
  partner_id: string;
  risk: RiskLevel;
  flags: FlagId[];
  claimed_org: string | null;
  redacted_excerpt: string;
  language: LanguageCode;
  created_at: string;
}

interface AdvisoryRow {
  id: string;
  publisher_id: string;
  title: string;
  body: string;
  claimed_org: string | null;
  created_at: string;
}

const toIncident = (r: IncidentRow): Incident => ({
  id: r.id,
  partnerId: r.partner_id,
  risk: r.risk,
  flags: r.flags,
  claimedOrg: r.claimed_org,
  redactedExcerpt: r.redacted_excerpt,
  language: r.language,
  createdAt: r.created_at,
});

const toAdvisory = (r: AdvisoryRow): Advisory => ({
  id: r.id,
  publisherId: r.publisher_id,
  title: r.title,
  body: r.body,
  claimedOrg: r.claimed_org,
  createdAt: r.created_at,
});

export function createSupabaseStore(url: string, anonKey: string): DataStore {
  const client = createClient(url, anonKey);

  return {
    kind: "supabase",

    async shareIncident(input: NewIncident) {
      const { data, error } = await client
        .from("incidents")
        .insert({
          partner_id: input.partnerId,
          risk: input.risk,
          flags: input.flags,
          claimed_org: input.claimedOrg,
          redacted_excerpt: input.redactedExcerpt,
          language: input.language,
        })
        .select()
        .single<IncidentRow>();
      if (error) throw error;
      return toIncident(data);
    },

    async listIncidents(partnerId: string) {
      const { data, error } = await client
        .from("incidents")
        .select()
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false })
        .limit(50)
        .returns<IncidentRow[]>();
      if (error) throw error;
      return data.map(toIncident);
    },

    subscribeIncidents(partnerId, onIncident) {
      const channel = client
        .channel(`incidents-${partnerId}`)
        .on<IncidentRow>(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "incidents",
            filter: `partner_id=eq.${partnerId}`,
          },
          (payload) => onIncident(toIncident(payload.new as IncidentRow)),
        )
        .subscribe();
      return () => void client.removeChannel(channel);
    },

    async publishAdvisory(input: NewAdvisory) {
      const { data, error } = await client
        .from("advisories")
        .insert({
          publisher_id: input.publisherId,
          title: input.title,
          body: input.body,
          claimed_org: input.claimedOrg,
        })
        .select()
        .single<AdvisoryRow>();
      if (error) throw error;
      return toAdvisory(data);
    },

    async listAdvisories() {
      const { data, error } = await client
        .from("advisories")
        .select()
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<AdvisoryRow[]>();
      if (error) throw error;
      return data.map(toAdvisory);
    },

    subscribeAdvisories(onAdvisory) {
      const channel = client
        .channel("advisories")
        .on<AdvisoryRow>(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "advisories" },
          (payload) => onAdvisory(toAdvisory(payload.new as AdvisoryRow)),
        )
        .subscribe();
      return () => void client.removeChannel(channel);
    },
  };
}
