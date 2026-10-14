import { Link, useLocation } from "react-router-dom";
import "./AppNavbar.css";

export type AppNavLink = { label: string; to: string };

const DEFAULT_LINKS: AppNavLink[] = [
  { label: "Home", to: "/" },
  { label: "Articles", to: "/articles" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function AppNavbar({
  brandName = "MedTrain",
  logo = "/loadlogo.png",
  links = DEFAULT_LINKS,
  active,
  version,
  showCta = true,
  ctaLabel = "Register Institution",
  onCta,
}: {
  brandName?: string;
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
          <img src={logo} alt={brandName} />
          <span>{brandName}</span>
        </Link>

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

        <div className="app-navbar-actions">
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