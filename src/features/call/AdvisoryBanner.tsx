import { useState } from "react";
import { Button } from "../../components/Button";
import { PARTNERS } from "../../data/partners";
import { readStored, writeStored } from "../../lib/storage";
import { timeAgo } from "../../lib/time";
import { useAdvisories } from "./useAdvisories";
import "./AdvisoryBanner.css";

const DISMISSED_KEY = "trustline.dismissedAdvisories";

function readDismissed(): string[] {
  try {
    const parsed: unknown = JSON.parse(readStored(DISMISSED_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** The newest community advisory, from any partner organization. */
export function AdvisoryBanner() {
  const advisories = useAdvisories();
  const [dismissed, setDismissed] = useState(readDismissed);
  const advisory = advisories.find((a) => !dismissed.includes(a.id));

  if (!advisory) return null;
  const publisher = PARTNERS.find((p) => p.id === advisory.publisherId)?.name ?? "A partner";

  const dismiss = () => {
    const next = [...dismissed, advisory.id].slice(-50);
    setDismissed(next);
    writeStored(DISMISSED_KEY, JSON.stringify(next));
  };

  return (
    <aside className="advisory" aria-labelledby="advisory-title" role="status">
      <p className="advisory__source small">
        Community alert from {publisher} · {timeAgo(advisory.createdAt)}
      </p>
      <h2 id="advisory-title" className="advisory__title">
        {advisory.title}
      </h2>
      <p>{advisory.body}</p>
      <Button variant="secondary" onClick={dismiss}>
        Dismiss
      </Button>
    </aside>
  );
}
