import type { Advisory, Incident } from "../types";

export type NewIncident = Omit<Incident, "id" | "createdAt">;
export type NewAdvisory = Omit<Advisory, "id" | "createdAt">;

/** Shared data between users and partner organizations. */
export interface DataStore {
  readonly kind: "supabase" | "local";
  shareIncident(incident: NewIncident): Promise<Incident>;
  listIncidents(partnerId: string): Promise<Incident[]>;
  subscribeIncidents(partnerId: string, onIncident: (incident: Incident) => void): () => void;
  publishAdvisory(advisory: NewAdvisory): Promise<Advisory>;
  listAdvisories(): Promise<Advisory[]>;
  subscribeAdvisories(onAdvisory: (advisory: Advisory) => void): () => void;
}
