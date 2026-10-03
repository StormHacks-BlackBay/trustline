import type { ReactNode } from "react";
import "./Chip.css";

type Tone = "neutral" | "accent" | "solid";

export function Chip({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`chip chip--${tone}`}>{children}</span>;
}

/** A labelled list of chips, such as the warning signs found in a call. */
export function ChipList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="chip-list" aria-label={label}>
      {items.map((item) => (
        <li key={item}>
          <Chip>{item}</Chip>
        </li>
      ))}
    </ul>
  );
}
