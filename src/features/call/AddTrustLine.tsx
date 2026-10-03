import { Card } from "../../components/Card";
import { callServer, formatPhone, trustLineVCard } from "../../lib/callServer";

/** How to bring TrustLine into a suspicious call: add it as a third person, then merge. */
export function AddTrustLine({ connected }: { connected: boolean }) {
  if (!callServer.enabled || !callServer.number) return null;
  const vcard = `data:text/vcard;charset=utf-8,${encodeURIComponent(trustLineVCard(callServer.number))}`;

  return (
    <Card className="stack" aria-labelledby="add-trustline-heading">
      <h2 id="add-trustline-heading">Add TrustLine to a call</h2>
      <ol className="add-steps">
        <li>
          During a call you're unsure about, tap <strong>Add Call</strong>.
        </li>
        <li>
          Choose <strong>TrustLine</strong> ({formatPhone(callServer.number)}).
        </li>
        <li>
          Tap <strong>Merge Calls</strong>. TrustLine listens, warns out loud if it hears a scam,
          and shows the details here.
        </li>
      </ol>
      <a
        className="button button--secondary button--full add-contact"
        href={vcard}
        download="TrustLine.vcf"
      >
        Save TrustLine to contacts
      </a>
      <p className="muted small" role="status">
        {connected ? "Ready: merged calls will appear on this screen." : "Connecting to TrustLine…"}
      </p>
    </Card>
  );
}
