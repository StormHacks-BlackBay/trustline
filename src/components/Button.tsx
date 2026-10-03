import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
}

export function Button({ variant = "primary", fullWidth, className, ...props }: ButtonProps) {
  const classes = ["button", `button--${variant}`, fullWidth ? "button--full" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return <button type="button" className={classes} {...props} />;
}
