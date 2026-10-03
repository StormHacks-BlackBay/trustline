import { useEffect, useState } from "react";
import { store } from "../../lib/store";
import type { Incident } from "../../lib/types";

/** Loads a partner's incidents and keeps the list live as new ones are shared. */
export function usePartnerIncidents(partnerId: string) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [latestId, setLatestId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const add = (incident: Incident) =>
      setIncidents((prev) => (prev.some((i) => i.id === incident.id) ? prev : [incident, ...prev]));

    store
      .listIncidents(partnerId)
      .then((list) => {
        if (!cancelled) {
          setIncidents(list);
          setError(false);
        }
      })
      .catch(() => !cancelled && setError(true));

    const unsubscribe = store.subscribeIncidents(partnerId, (incident) => {
      add(incident);
      setLatestId(incident.id);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [partnerId]);

  return { incidents, latestId, error };
}
