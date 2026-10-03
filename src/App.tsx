import { CallScreen } from "./features/call/CallScreen";
import { PartnerDashboard } from "./features/partner/PartnerDashboard";
import { usePath } from "./lib/router";

export function App() {
  const path = usePath();
  return <main>{path.startsWith("/partner") ? <PartnerDashboard /> : <CallScreen />}</main>;
}
