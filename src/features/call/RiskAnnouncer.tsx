import { useEffect, useRef, useState } from "react";
import { textDirection } from "../../lib/flagText";
import { RISK_LEVELS, type LanguageCode, type RiskLevel } from "../../lib/types";

interface RiskAnnouncerProps {
  risk: RiskLevel;
  reason: string;
  language: LanguageCode;
}

/** Announces a warning to screen readers only when the risk rises, not on every transcript line. */
export function RiskAnnouncer({ risk, reason, language }: RiskAnnouncerProps) {
  const [message, setMessage] = useState("");
  const announced = useRef<RiskLevel>("low");

  useEffect(() => {
    if (RISK_LEVELS.indexOf(risk) <= RISK_LEVELS.indexOf(announced.current)) return;
    announced.current = risk;
    const id = window.setTimeout(() => setMessage(reason), 50);
    return () => window.clearTimeout(id);
  }, [risk, reason]);

  return (
    <div
      className="visually-hidden"
      aria-live="assertive"
      aria-atomic="true"
      lang={language}
      dir={textDirection(language)}
    >
      {message}
    </div>
  );
}
