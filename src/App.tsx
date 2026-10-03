import { AppShell } from "./components/AppShell";
import { CallScreen } from "./features/call/CallScreen";
import { PartnerDashboard } from "./features/partner/PartnerDashboard";
import { usePath } from "./lib/router";

export function App() {
  const path = usePath();
  const partner = path.startsWith("/partner");
  return (
    <AppShell path={path} title={partner ? "Partner dashboard" : "Call check"}>
      {partner ? <PartnerDashboard /> : <CallScreen />}
    </AppShell>
  );
}
