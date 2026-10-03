export type MetricName = "rules" | "llm";

const samples: Record<MetricName, number[]> = { rules: [], llm: [] };
const listeners = new Set<() => void>();
let version = 0;

/** Records how long a stage took, in milliseconds, from the moment a segment was committed. */
export function recordLatency(name: MetricName, ms: number): void {
  if (!Number.isFinite(ms) || ms < 0) return;
  samples[name].push(ms);
  if (samples[name].length > 500) samples[name].shift();
  version++;
  listeners.forEach((l) => l());
}

export function subscribeMetrics(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const metricsVersion = () => version;

export function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] ?? null;
}

export function summary(name: MetricName) {
  const values = samples[name];
  return { count: values.length, median: percentile(values, 50), p90: percentile(values, 90) };
}
