import type { AnchorHTMLAttributes } from "react";
import "./Button.css";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

/** A link styled as a button, for actions that navigate: phone calls, downloads, websites. */
export function ButtonLink({
  variant = "primary",
  fullWidth,
  className,
  ...props
}: ButtonLinkProps) {
  const classes = ["button", `button--${variant}`, fullWidth ? "button--full" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return <a className={classes} {...props} />;
}
