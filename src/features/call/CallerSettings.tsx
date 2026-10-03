import { Field, Select } from "../../components/Field";
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
  const partner = PARTNERS.find((p) => p.id === user.partnerId)?.name;
  return (
    <div className="caller-settings">
      <Field label="Demo user" hint={`${user.name} is a member of ${partner}.`}>
        {(props) => (
          <Select {...props} value={user.id} onChange={(e) => onUserChange(e.target.value)}>
            {DEMO_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Warning language">
        {(props) => (
          <Select {...props} value={language} onChange={(e) => onLanguageChange(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeLabel === l.label ? l.label : `${l.nativeLabel} (${l.label})`}
              </option>
            ))}
          </Select>
        )}
      </Field>
    </div>
  );
}
