import { readStored, writeStored } from "../storage";
import type { Advisory, Incident } from "../types";
import type { DataStore, NewAdvisory, NewIncident } from "./types";

const INCIDENTS_KEY = "trustline.local.incidents";
const ADVISORIES_KEY = "trustline.local.advisories";

type Message = { type: "incident"; incident: Incident } | { type: "advisory"; advisory: Advisory };

function readList<T>(key: string): T[] {
  try {
    const parsed: unknown = JSON.parse(readStored(key) ?? "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/**
 * Demo store for running without Supabase. Data lives in this browser and is shared between tabs
 * with BroadcastChannel, so the user screen and partner dashboard can run side by side.
 */
export function createLocalStore(): DataStore {
  const channel =
    typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel("trustline");
  const listeners = new Set<(message: Message) => void>();
  channel?.addEventListener("message", (event: MessageEvent<Message>) => {
    listeners.forEach((listener) => listener(event.data));
  });

  const emit = (message: Message) => {
    listeners.forEach((listener) => listener(message));
    channel?.postMessage(message);
  };

  const subscribe = (listener: (message: Message) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    kind: "local",

    async shareIncident(input: NewIncident) {
      const incident: Incident = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      writeStored(
        INCIDENTS_KEY,
        JSON.stringify([incident, ...readList<Incident>(INCIDENTS_KEY)].slice(0, 50)),
      );
      emit({ type: "incident", incident });
      return incident;
    },

    async listIncidents(partnerId: string) {
      return readList<Incident>(INCIDENTS_KEY).filter((i) => i.partnerId === partnerId);
    },

    subscribeIncidents(partnerId, onIncident) {
      const unsubscribe = subscribe((message) => {
        if (message.type === "incident" && message.incident.partnerId === partnerId) {
          onIncident(message.incident);
        }
      });
      return () => void unsubscribe();
    },

    async publishAdvisory(input: NewAdvisory) {
      const advisory: Advisory = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      writeStored(
        ADVISORIES_KEY,
        JSON.stringify([advisory, ...readList<Advisory>(ADVISORIES_KEY)].slice(0, 20)),
      );
      emit({ type: "advisory", advisory });
      return advisory;
    },

    async listAdvisories() {
      return readList<Advisory>(ADVISORIES_KEY);
    },

    subscribeAdvisories(onAdvisory) {
      const unsubscribe = subscribe((message) => {
        if (message.type === "advisory") onAdvisory(message.advisory);
      });
      return () => void unsubscribe();
    },
  };
}
