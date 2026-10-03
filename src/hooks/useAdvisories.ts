import { useEffect, useState } from "react";
import { store } from "../lib/store";
import type { Advisory } from "../lib/types";

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Recent advisories from every partner, newest first, kept live. */
export function useAdvisories() {
  const [advisories, setAdvisories] = useState<Advisory[]>([]);

  useEffect(() => {
    let cancelled = false;
    store
      .listAdvisories()
      .then((list) => {
        const cutoff = Date.now() - MAX_AGE_MS;
        if (!cancelled) setAdvisories(list.filter((a) => new Date(a.createdAt).getTime() > cutoff));
      })
      .catch(() => undefined);
    const unsubscribe = store.subscribeAdvisories((advisory) =>
      setAdvisories((prev) =>
        prev.some((a) => a.id === advisory.id) ? prev : [advisory, ...prev],
      ),
    );
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return advisories;
}
