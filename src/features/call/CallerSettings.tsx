import { Field, Select } from "../../components/Field";
import { LANGUAGES, type LanguageCode } from "../../lib/types";

interface CallerSettingsProps {
  language: LanguageCode;
  onLanguageChange: (code: string) => void;
}

export function CallerSettings({ language, onLanguageChange }: CallerSettingsProps) {
  return (
    <div className="caller-settings">
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
