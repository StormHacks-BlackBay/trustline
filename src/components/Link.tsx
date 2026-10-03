import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { navigate } from "../lib/router";

/** Same-origin link that navigates without a page reload. */
export function Link({
  href,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.button !== 0
    )
      return;
    event.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={handleClick} {...props} />;
}
