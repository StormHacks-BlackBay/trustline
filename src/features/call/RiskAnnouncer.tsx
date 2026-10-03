import { useEffect, useRef, useState } from "react";
import { RISK_LEVELS, type RiskLevel } from "../../lib/types";

const PREFIX: Record<RiskLevel, string> = {
  low: "",
  medium: "Could not confirm this call.",
  high: "Warning: likely scam.",
};

/** Announces a warning to screen readers only when the risk rises, not on every transcript line. */
export function RiskAnnouncer({ risk, reason }: { risk: RiskLevel; reason: string }) {
  const [message, setMessage] = useState("");
  const announced = useRef<RiskLevel>("low");

  useEffect(() => {
    if (RISK_LEVELS.indexOf(risk) <= RISK_LEVELS.indexOf(announced.current)) return;
    announced.current = risk;
    const id = window.setTimeout(() => setMessage(`${PREFIX[risk]} ${reason}`), 50);
    return () => window.clearTimeout(id);
  }, [risk, reason]);

  return (
    <div className="visually-hidden" aria-live="assertive" aria-atomic="true">
      {message}
    </div>
  );
}
