import { useEffect, useMemo, useState } from "react";
import { Alert } from "../../components/Alert";
import { Card } from "../../components/Card";
import { Link } from "../../components/Link";
import { AFTER_CALL_PARTNER_ID, PARTNERS } from "../../data/partners";
import { callServer } from "../../lib/callServer";
import { CallSummarySchema, type CallSummary } from "../../lib/callSummary";
import { textDirection } from "../../lib/flagText";
import { timeAgo } from "../../lib/time";
import type { Segment } from "../../lib/transcript";
import { CallAnalysis } from "../call/CallAnalysis";
import "../call/CallScreen.css";

type Load = { state: "loading" } | { state: "missing" } | { state: "ready"; summary: CallSummary };

/** Loads one saved call from the call server. */
function useCallSummary(id: string): Load {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  useEffect(() => {
    if (!callServer.url || !id) return;
    const controller = new AbortController();
    fetch(`${callServer.url}/calls/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(async (response) => {
        const parsed = CallSummarySchema.safeParse(response.ok ? await response.json() : null);
        setLoad(parsed.success ? { state: "ready", summary: parsed.data } : { state: "missing" });
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoad({ state: "missing" });
      });
    return () => controller.abort();
  }, [id]);
  return callServer.url && id ? load : { state: "missing" };
}

function Summary({ summary }: { summary: CallSummary }) {
  const shareWith = PARTNERS.find((p) => p.id === AFTER_CALL_PARTNER_ID);
  const segments = useMemo<Segment[]>(
    () => summary.segments.map((text, i) => ({ id: `${summary.id}-${i}`, text, committedAt: 0 })),
    [summary],
  );
  if (!shareWith) return null;

  return (
    <CallAnalysis segments={segments} partial="" language={summary.language} shareWith={shareWith}>
      {({ main, side }) => (
        <div className="call-layout">
          <div className="call-layout__main stack">
            {summary.warning?.spoken && (
              <Alert tone="info">
                <span lang="en">TrustLine said on the call: </span>
                <span lang={summary.language} dir={textDirection(summary.language)}>
                  {summary.warning.text}
                </span>
              </Alert>
            )}
            {main}
          </div>
          <aside className="call-layout__side stack" aria-label="Call details">
            {side}
          </aside>
        </div>
      )}
    </CallAnalysis>
  );
}

/**
 * The page the after-call text links to: what the caller said, the warning, the official contact,
 * one-tap reporting to the Canadian Anti-Fraud Centre, and what to do if they already paid.
 */
export function AfterCallPage({ id }: { id: string }) {
  const load = useCallSummary(id);

  return (
    <div className="stack">
      <header className="page-header">
        <h1>Your call summary</h1>
        <p className="page-header__lead">
          {load.state === "ready"
            ? `TrustLine was on this call ${timeAgo(load.summary.endedAt)}. Here is what the caller said and what you can do now.`
            : "What TrustLine heard on your call and what you can do now."}
        </p>
      </header>
      {load.state === "loading" && (
        <p className="muted" role="status">
          Loading your call…
        </p>
      )}
      {load.state === "missing" && (
        <Card className="stack">
          <p>
            This summary is not available. Summaries are kept for one day, and the link only works
            while the TrustLine call server is running.
          </p>
          <p>
            <Link href="/recover">Already paid or shared details? See what to do now</Link>
          </p>
        </Card>
      )}
      {load.state === "ready" && <Summary summary={load.summary} />}
    </div>
  );
}
