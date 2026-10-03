import type { ReactNode } from "react";
import "./Alert.css";

type Tone = "error" | "success" | "info";

/** Errors interrupt (role="alert"); confirmations and notes are announced politely. */
export function Alert({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <div className={`alert alert--${tone}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
