import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import "./Field.css";

interface FieldProps {
  label: string;
  hint?: ReactNode;
  children: (props: { id: string; "aria-describedby"?: string }) => ReactNode;
}

/** Label, control and optional hint, wired together for assistive technology. */
export function Field({ label, hint, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children({ id, "aria-describedby": hint ? hintId : undefined })}
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
    </div>
  );
}

export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className="field__control" {...props} />
);

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input className="field__control" {...props} />
);

export const TextArea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className="field__control" {...props} />
);
