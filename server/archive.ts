import { randomUUID } from "node:crypto";
import type { CallSummary } from "../src/lib/callSummary";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Finished calls, kept in memory so the after-call page can show what was said. Summaries expire
 * after a day and the oldest are dropped past `max`, so nothing builds up. A restart clears them.
 */
export class CallArchive {
  private readonly records = new Map<string, CallSummary>();

  constructor(
    private readonly ttlMs = DAY_MS,
    private readonly max = 200,
    private readonly now: () => number = Date.now,
  ) {}

  save(summary: Omit<CallSummary, "id">): CallSummary {
    this.prune();
    const record: CallSummary = { id: randomUUID(), ...summary };
    this.records.set(record.id, record);
    while (this.records.size > this.max) {
      const oldest = this.records.keys().next().value;
      if (oldest === undefined) break;
      this.records.delete(oldest);
    }
    return record;
  }

  get(id: string): CallSummary | null {
    this.prune();
    return this.records.get(id) ?? null;
  }

  private prune(): void {
    const cutoff = this.now() - this.ttlMs;
    for (const [id, record] of this.records) {
      if (Date.parse(record.endedAt) < cutoff) this.records.delete(id);
    }
  }
}
