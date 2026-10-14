import { Link, useLocation } from "react-router-dom";
import "./AppNavbar.css";

export type AppNavLink = { label: string; to: string };

const DEFAULT_LINKS: AppNavLink[] = [
  { label: "Home", to: "/" },
  { label: "Blog", to: "/articles" },
  { label: "E-Learning", to: "/e-learning" },
  { label: "About", to: "/about" },
];

export default function AppNavbar({
  brandName = "Medstat initiative",
  tagline = "Building resilient healthy communities",
  logo = "/loadlogo.png",
  links = DEFAULT_LINKS,
  active,
  version,
  showCta = true,
  ctaLabel = "Subscribe",
  onCta,
}: {
  brandName?: string;
  tagline?: string;
  logo?: string;
  links?: AppNavLink[];
  active?: string;
  version?: string;
  showCta?: boolean;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  const location = useLocation();
  const current = active ?? location.pathname;

  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <Link to="/" className="app-navbar-brand">
          <img src={logo} alt={brandName} className="app-navbar-logo" />
          <span className="app-navbar-brand-text">
            <span className="app-navbar-brand-name">{brandName}</span>
            {tagline && (
              <span className="app-navbar-brand-tagline">{tagline}</span>
            )}
          </span>
        </Link>

        <div className="app-navbar-right">
          <nav className="app-navbar-links">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className={
                  "app-navbar-link" + (current === l.to ? " active" : "")
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {version && (
            <span className="app-navbar-version">v{version}</span>
          )}

          {showCta && (
            <button className="app-navbar-cta" onClick={onCta}>
              {ctaLabel}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}