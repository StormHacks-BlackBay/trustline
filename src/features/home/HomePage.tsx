import { ButtonLink } from "../../components/ButtonLink";
import { Card } from "../../components/Card";
import { Link } from "../../components/Link";
import { callServer, formatPhone, trustLineVCard } from "../../lib/callServer";
import "./HomePage.css";

const telHref = (e164: string) => `tel:${e164.replace(/[^\d+]/g, "")}`;

const NEXT_STEPS = [
  {
    href: "/check",
    title: "Got a suspicious text, email or job offer?",
    body: "Paste it before you reply or tap a link. TrustLine checks it the same way it checks calls.",
    action: "Check a message",
  },
  {
    href: "/recover",
    title: "Already paid or shared details?",
    body: "Act quickly. Get the steps in order: freeze gift cards, call your bank, and report it.",
    action: "See what to do now",
  },
  {
    href: "/partner",
    title: "For settlement agencies and credit unions",
    body: "See the scams your members report, warn your community, and share the data with the Canadian Anti-Fraud Centre.",
    action: "Open the partner portal",
  },
  {
    href: "/live",
    title: "See TrustLine in action",
    body: "Play a scripted scam call, or follow a call TrustLine has been added to as it happens.",
    action: "Open the live call view",
  },
];

/**
 * The public page for newcomers. The product is the phone number: save it once and add it to any
 * call you are unsure about. Everything else on the site is for later, when it is needed.
 */
export function HomePage() {
  const number = callServer.number;
  const vcard = number
    ? `data:text/vcard;charset=utf-8,${encodeURIComponent(trustLineVCard(number))}`
    : null;

  return (
    <div className="stack home">
      <header className="page-header home__hero">
        <h1>Not sure who's really calling?</h1>
        <p className="page-header__lead">
          Add TrustLine to the call. It listens, warns you out loud in your language if it hears a
          scam, and texts you what to do next. Works on any phone, with no app or account.
        </p>
        {number && vcard ? (
          <div className="home__number">
            <a className="home__phone" href={telHref(number)} dir="ltr">
              {formatPhone(number)}
            </a>
            <ButtonLink href={vcard} download="TrustLine.vcf">
              Save TrustLine to contacts
            </ButtonLink>
          </div>
        ) : (
          <p>Anyone can call TrustLine, no sign-up needed. The number will appear here soon.</p>
        )}
      </header>

      <Card className="stack" aria-labelledby="how-heading">
        <h2 id="how-heading">How it works</h2>
        <ol className="home__steps">
          <li>
            During a call you're unsure about, tap <strong>Add Call</strong> and choose TrustLine.
          </li>
          <li>
            Tap <strong>Merge Calls</strong>. TrustLine joins quietly and listens without
            interrupting.
          </li>
          <li>
            If it hears a scam, it warns you out loud and tells you the official number to call
            instead. The caller hears it too.
          </li>
          <li>
            After the call, you get a text with what was said, the warning, and what to do next,
            including reporting it to your community organization in one tap.
          </li>
        </ol>
        <p className="muted small">
          Warnings in English, Punjabi, Mandarin, Tagalog and Farsi. TrustLine never says a caller
          is verified: it only points you to official contacts.
        </p>
      </Card>

      <ul className="home__grid">
        {NEXT_STEPS.map((item) => (
          <li key={item.href}>
            <Card className="stack stack--tight home__card">
              <h2 className="home__card-title">{item.title}</h2>
              <p className="muted">{item.body}</p>
              <Link href={item.href} className="home__card-link">
                {item.action}
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
