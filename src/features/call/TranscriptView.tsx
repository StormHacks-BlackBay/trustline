import { useEffect, useRef } from "react";
import type { Segment } from "../../lib/transcript";
import { highlight } from "./highlight";
import "./TranscriptView.css";

interface TranscriptViewProps {
  segments: Segment[];
  partial: string;
  evidence?: string[];
}

export function TranscriptView({ segments, partial, evidence = [] }: TranscriptViewProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [segments.length, partial]);

  const empty = segments.length === 0 && !partial;

  return (
    // aria-live is off: warnings are announced separately, the transcript itself would be too noisy.
    <div className="transcript" role="log" aria-label="Call transcript" aria-live="off">
      {empty && <p className="muted">The caller's words will appear here.</p>}
      {segments.map((s) => (
        <p key={s.id} className="transcript__line">
          {highlight(s.text, evidence).map((piece, i) =>
            piece.marked ? <mark key={i}>{piece.text}</mark> : <span key={i}>{piece.text}</span>,
          )}
        </p>
      ))}
      {partial && <p className="transcript__line transcript__line--partial">{partial}</p>}
      <div ref={endRef} />
    </div>
  );
}
