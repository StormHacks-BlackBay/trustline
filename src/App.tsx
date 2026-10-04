import { AppShell } from "./components/AppShell";
import { CallScreen } from "./features/call/CallScreen";
import { MessageCheck } from "./features/message/MessageCheck";
import { PartnerDashboard } from "./features/partner/PartnerDashboard";
import { RecoveryGuide } from "./features/recovery/RecoveryGuide";
import { usePath } from "./lib/router";

/** Each page's path prefix, title and screen. Any other path shows the call check. */
const PAGES = [
  { prefix: "/check", title: "Message check", render: () => <MessageCheck /> },
  { prefix: "/recover", title: "Recovery steps", render: () => <RecoveryGuide /> },
  { prefix: "/partner", title: "Partner dashboard", render: () => <PartnerDashboard /> },
];

export function App() {
  const path = usePath();
  const page = PAGES.find((p) => path.startsWith(p.prefix));
  return (
    <AppShell path={path} title={page?.title ?? "Call check"}>
      {page ? page.render() : <CallScreen />}
    </AppShell>
  );
}
