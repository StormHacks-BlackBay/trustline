import { DEMO_USERS, PARTNERS } from "../../data/partners";
import { LANGUAGES, type DemoUser, type LanguageCode } from "../../lib/types";

interface CallerSettingsProps {
  user: DemoUser;
  language: LanguageCode;
  onUserChange: (id: string) => void;
  onLanguageChange: (code: string) => void;
}

export function CallerSettings({
  user,
  language,
  onUserChange,
  onLanguageChange,
}: CallerSettingsProps) {
  return (
    <div className="caller-settings">
      <label className="field">
        <span className="field__label">Demo user</span>
        <select value={user.id} onChange={(e) => onUserChange(e.target.value)}>
          {DEMO_USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({PARTNERS.find((p) => p.id === u.partnerId)?.name})
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field__label">Warning language</span>
        <select value={language} onChange={(e) => onLanguageChange(e.target.value)}>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeLabel === l.label ? l.label : `${l.nativeLabel} (${l.label})`}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
