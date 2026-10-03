import { useSyncExternalStore } from "react";
import { metricsVersion, subscribeMetrics, summary, type MetricName } from "../../lib/metrics";
import { store } from "../../lib/store";

const format = (ms: number | null) =>
  ms === null ? "–" : ms < 10 ? `${ms.toFixed(1)} ms` : `${Math.round(ms)} ms`;

function Row({ label, name }: { label: string; name: MetricName }) {
  const s = summary(name);
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>{s.count}</td>
      <td>{format(s.median)}</td>
      <td>{format(s.p90)}</td>
    </tr>
  );
}

/** Measured latency since the page loaded, for testing and the project write-up. */
export function Diagnostics() {
  useSyncExternalStore(subscribeMetrics, metricsVersion);
  return (
    <details className="diagnostics">
      <summary>Diagnostics</summary>
      <table>
        <caption className="muted small">
          Time from the caller finishing a phrase to the result
        </caption>
        <thead>
          <tr>
            <th scope="col">Stage</th>
            <th scope="col">Samples</th>
            <th scope="col">Median</th>
            <th scope="col">p90</th>
          </tr>
        </thead>
        <tbody>
          <Row label="Rules warning" name="rules" />
          <Row label="LLM explanation" name="llm" />
        </tbody>
      </table>
      <p className="muted small">
        Data store: {store.kind === "local" ? "local demo (this browser)" : "Supabase"}
      </p>
    </details>
  );
}
