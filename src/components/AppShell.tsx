import { useEffect, type ReactNode } from "react";
import { Link } from "./Link";
import { Logo } from "./Logo";
import "./AppShell.css";

const NAV = [
  { href: "/", label: "Call check" },
  { href: "/check", label: "Message check" },
  { href: "/partner", label: "Partner dashboard" },
];

interface AppShellProps {
  path: string;
  title: string;
  children: ReactNode;
}

export function AppShell({ path, title, children }: AppShellProps) {
  useEffect(() => {
    document.title = `${title} · TrustLine`;
  }, [title]);

  // The call check is the home page and also shows for any path no other page claims.
  const current = (href: string) =>
    href === "/"
      ? !NAV.some((item) => item.href !== "/" && path.startsWith(item.href))
      : path.startsWith(href);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="shell__header">
        <div className="container shell__bar">
          <Link href="/" className="shell__brand" aria-label="TrustLine home">
            <Logo />
          </Link>
          <nav aria-label="Main">
            <ul className="shell__nav">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} aria-current={current(item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" className="shell__main" tabIndex={-1}>
        <div className="container">{children}</div>
      </main>
      <footer className="shell__footer">
        <div className="container small muted">
          TrustLine is a StormHacks 2026 project. Partners and contacts shown are demo data.
        </div>
      </footer>
    </div>
  );
}
