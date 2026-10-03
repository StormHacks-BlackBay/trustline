import type { RiskLevel } from "../lib/types";
import "./RiskBadge.css";

const LABELS: Record<RiskLevel, string> = {
  low: "No warning signs",
  medium: "Could not confirm",
  high: "Likely scam",
};

function RiskIcon({ risk }: { risk: RiskLevel }) {
  if (risk === "low") {
    return <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" />;
  }
  if (risk === "medium") {
    return (
      <>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="12" cy="17.2" r="1.2" fill="currentColor" />
      </>
    );
  }
  return (
    <>
      <path
        d="M12 3.5L21.5 20h-19z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 10v4.5" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="17.3" r="1.2" fill="currentColor" />
    </>
  );
}

/** Risk is always shown as icon + word + colour, so it never depends on colour alone. */
export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <span className={`risk-badge risk-badge--${risk}`}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <RiskIcon risk={risk} />
      </svg>
      {LABELS[risk]}
    </span>
  );
}
