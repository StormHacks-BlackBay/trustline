import "./Logo.css";

/** A check mark that runs on into a flat line: a verified line. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="8" />
      <path d="M7 16.5l4.5 4.5L19.5 11H26" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo__word">TrustLine</span>
    </span>
  );
}
