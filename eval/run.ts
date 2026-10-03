import { mkdirSync, writeFileSync } from "node:fs";
import { POST as score } from "../api/score";
import { fuse } from "../src/lib/fusion";
import { runRules } from "../src/lib/rules";
import { RiskAssessmentSchema } from "../src/lib/schemas";
import type { RiskLevel } from "../src/lib/types";
import { CASES, type EvalCase } from "./cases";

try {
  process.loadEnvFile(".env");
} catch {
  // No .env file: the LLM layer is skipped.
}
const useLlm = Boolean(process.env.GEMINI_API_KEY);

interface Row {
  id: string;
  label: EvalCase["label"];
  rules: RiskLevel;
  combined: RiskLevel | null;
  llmMs: number | null;
}

const RANK: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };

async function llmFor(transcript: string) {
  const started = performance.now();
  const response = await score(
    new Request("http://local/api/score", {
      method: "POST",
      body: JSON.stringify({ transcript, language: "en" }),
    }),
  );
  const ms = performance.now() - started;
  if (!response.ok) throw new Error(`score returned ${response.status}`);
  return { assessment: RiskAssessmentSchema.parse(await response.json()), ms };
}

function metrics(rows: Row[], pick: (r: Row) => RiskLevel | null, threshold: RiskLevel) {
  let tp = 0,
    fp = 0,
    fn = 0,
    tn = 0;
  for (const row of rows) {
    const risk = pick(row);
    if (risk === null) continue;
    const warned = RANK[risk] >= RANK[threshold];
    if (row.label === "scam") {
      if (warned) tp++;
      else fn++;
    } else if (warned) fp++;
    else tn++;
  }
  const precision = tp + fp === 0 ? 1 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 1 : tp / (tp + fn);
  return { tp, fp, fn, tn, precision, recall };
}

const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
const percentile = (values: number[], p: number) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] ?? 0;
};

const rows: Row[] = [];
for (const c of CASES) {
  const rules = runRules(c.transcript);
  let combined: RiskLevel | null = null;
  let llmMs: number | null = null;
  if (useLlm) {
    const { assessment, ms } = await llmFor(c.transcript);
    combined = fuse({
      transcript: c.transcript,
      rules,
      llm: { assessment, coversWholeCall: true },
    }).risk;
    llmMs = ms;
  }
  rows.push({ id: c.id, label: c.label, rules: rules.risk, combined, llmMs });
}

// Rules latency: average over many runs of the whole set.
const iterations = 200;
const started = performance.now();
for (let i = 0; i < iterations; i++) for (const c of CASES) runRules(c.transcript);
const rulesMs = (performance.now() - started) / (iterations * CASES.length);

const lines: string[] = [];
lines.push(
  `TrustLine evaluation: ${CASES.length} transcripts (${CASES.filter((c) => c.label === "scam").length} scam, ${CASES.filter((c) => c.label === "legitimate").length} legitimate)`,
);
lines.push("");
lines.push(
  ["case".padEnd(22), "label".padEnd(11), "rules".padEnd(7), "rules+llm".padEnd(10), "llm ms"].join(
    "",
  ),
);
for (const r of rows) {
  lines.push(
    [
      r.id.padEnd(22),
      r.label.padEnd(11),
      r.rules.padEnd(7),
      (r.combined ?? "-").padEnd(10),
      r.llmMs === null ? "-" : r.llmMs.toFixed(0),
    ].join(""),
  );
}
lines.push("");
for (const [name, pick] of [
  ["Rules only", (r: Row) => r.rules],
  ["Rules + LLM", (r: Row) => r.combined],
] as const) {
  if (name === "Rules + LLM" && !useLlm) {
    lines.push("Rules + LLM: skipped (set GEMINI_API_KEY in .env to include it)");
    continue;
  }
  for (const threshold of ["medium", "high"] as const) {
    const m = metrics(rows, pick, threshold);
    lines.push(
      `${name}, warn at ${threshold}+: precision ${pct(m.precision)}, recall ${pct(m.recall)}, false positives ${m.fp}/${m.fp + m.tn} legitimate calls`,
    );
  }
}
lines.push("");
lines.push(
  `Rules layer latency: ${rulesMs.toFixed(3)} ms per transcript (mean of ${iterations * CASES.length} runs)`,
);
const llmTimes = rows.flatMap((r) => (r.llmMs === null ? [] : [r.llmMs]));
if (llmTimes.length > 0) {
  lines.push(
    `LLM scoring latency: median ${percentile(llmTimes, 50).toFixed(0)} ms, p90 ${percentile(llmTimes, 90).toFixed(0)} ms`,
  );
}

const report = lines.join("\n");
console.log(report);
mkdirSync("eval/results", { recursive: true });
writeFileSync(`eval/results/${new Date().toISOString().replace(/[:.]/g, "-")}.txt`, `${report}\n`);
