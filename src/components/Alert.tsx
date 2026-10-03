import { useEffect, useRef, type ReactNode } from "react";
import "./Alert.css";

type Tone = "error" | "success" | "info";

interface AlertProps {
  tone: Tone;
  /** Move keyboard focus here on mount, for confirmations that replace the control just used. */
  takeFocus?: boolean;
  children: ReactNode;
}

/** Errors interrupt (role="alert"); confirmations and notes are announced politely. */
export function Alert({ tone, takeFocus = false, children }: AlertProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (takeFocus) ref.current?.focus();
  }, [takeFocus]);

  return (
    <div
      ref={ref}
      className={`alert alert--${tone}`}
      role={tone === "error" ? "alert" : "status"}
      tabIndex={takeFocus ? -1 : undefined}
    >
      {children}
    </div>
  );
}
