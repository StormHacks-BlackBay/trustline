import type { CallEvent } from "../src/lib/callEvents";

type Listener = (event: CallEvent) => void;

/**
 * Routes call events to the app sessions of the user on the call. Events for an active call are
 * kept so an app opened mid-call catches up on the transcript.
 */
export class EventHub {
  private listeners = new Map<string, Set<Listener>>();
  private active = new Map<string, CallEvent[]>();

  publish(userId: string, event: CallEvent): void {
    if (event.type === "call_started") this.active.set(userId, []);
    // Partials are replaced constantly; only durable events are replayed.
    if (event.type !== "partial") this.active.get(userId)?.push(event);
    if (event.type === "call_ended") this.active.delete(userId);
    this.listeners.get(userId)?.forEach((listener) => listener(event));
  }

  subscribe(userId: string, listener: Listener): () => void {
    const set = this.listeners.get(userId) ?? new Set();
    set.add(listener);
    this.listeners.set(userId, set);
    this.active.get(userId)?.forEach(listener);
    return () => {
      set.delete(listener);
      if (set.size === 0) this.listeners.delete(userId);
    };
  }

  subscriberCount(userId: string): number {
    return this.listeners.get(userId)?.size ?? 0;
  }
}
