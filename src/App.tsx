import { AppShell } from "./components/AppShell";
import { AfterCallPage } from "./features/afterCall/AfterCallPage";
import { CallScreen } from "./features/call/CallScreen";
import { HomePage } from "./features/home/HomePage";
import { MessageCheck } from "./features/message/MessageCheck";
import { PartnerDashboard } from "./features/partner/PartnerDashboard";
import { RecoveryGuide } from "./features/recovery/RecoveryGuide";
import { usePath } from "./lib/router";

const AFTER_CALL = "/after-call/";

/** Each page's path prefix, title and screen. Any other path shows the home page. */
const PAGES = [
  { prefix: "/live", title: "Live call view", render: () => <CallScreen /> },
  { prefix: "/check", title: "Message check", render: () => <MessageCheck /> },
  { prefix: "/recover", title: "Recovery steps", render: () => <RecoveryGuide /> },
  { prefix: "/partner", title: "Partner portal", render: () => <PartnerDashboard /> },
];

export function App() {
  const path = usePath();
  if (path.startsWith(AFTER_CALL)) {
    const id = decodeURIComponent(path.slice(AFTER_CALL.length));
    return (
      <AppShell path={path} title="Call summary">
        <AfterCallPage key={id} id={id} />
      </AppShell>
    );
  }
  const page = PAGES.find((p) => path.startsWith(p.prefix));
  return (
    <AppShell path={path} title={page?.title ?? "TrustLine"}>
      {page ? page.render() : <HomePage />}
    </AppShell>
  );
}
