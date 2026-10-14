import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { loginUser, addUser } from "../database/userDB";
import { loginTenant } from "../api/authApi";
import {
  pullAllTenantData,
  enableSyncHooks,
  startPeriodicPull,
  stopPeriodicPull,
  pullSettings,
} from "../database/sync";
import { supabase } from "../auth/supabase";
import LoadingButton from "../components/LoadingButton";
import PhoneEntry from "./PhoneEntry";
import VerifyCode from "./VerifyCode";
import RegisterAdmin from "./RegisterAdmin";
import { getVersion } from "@tauri-apps/api/app";

const MEDICAL_BLUE = "#007AFF";
const iosFont =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";

type AppScreen =
  | "main"
  | "login"
  | "admin_sms"
  | "admin_otp"
  | "admin_register";

/* ── Nav routes — full page navigation to the blog (app is mounted at /app/) ── */
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/articles" },
  { label: "E-Learning", href: "/app/" },
  { label: "About", href: "/about" },
];

/* ── Medstat-style app bar + shell — branding comes only from Supabase ── */
function StartupShell({
  children,
  brandName,
  tagline,
  logo,
  version,
  showSubscribe,
}: {
  children: React.ReactNode;
  brandName?: string;
  tagline?: string;
  logo?: string;
  version?: string;
  showSubscribe?: boolean;
}) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF",
        fontFamily: iosFont,
      }}
    >
      <style>{`
        .msb-bar {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          flex-shrink: 0;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        }
        .msb-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .msb-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          min-width: 0;
        }
        .msb-logo {
          width: 44px;
          height: 44px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .msb-logo-fallback {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #1e3a8a;
          color: #ffffff;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .msb-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
          min-width: 0;
        }
        .msb-name {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .msb-tagline {
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .msb-right {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-shrink: 0;
        }
        .msb-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .msb-link {
          position: relative;
          font-size: 15px;
          color: #374151;
          text-decoration: none;
          padding: 6px 2px;
          transition: color 0.15s ease;
        }
        .msb-link:hover {
          color: #1d4ed8;
        }
        .msb-link.active {
          color: #1d4ed8;
          font-weight: 500;
        }
        .msb-link.active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -2px;
          height: 2px;
          border-radius: 2px;
          background: #1d4ed8;
        }
        .msb-version {
          font-size: 12px;
          color: #9ca3af;
        }
        .msb-cta {
          display: inline-flex;
          align-items: center;
          height: 44px;
          padding: 0 26px;
          border: none;
          border-radius: 8px;
          background: #1e3a8a;
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .msb-cta:hover {
          background: #1e40af;
        }
        @media (max-width: 900px) {
          .msb-links {
            display: none;
          }
        }
      `}</style>

      <header className="msb-bar">
        <div className="msb-inner">
          <a href="/" className="msb-brand">
            {logo ? (
              <img
                src={logo}
                alt={brandName || ""}
                className="msb-logo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : brandName ? (
              <div className="msb-logo-fallback">
                {brandName.charAt(0).toUpperCase()}
              </div>
            ) : null}

            {(brandName || tagline) && (
              <span className="msb-brand-text">
                {brandName && (
                  <span className="msb-name">{brandName}</span>
                )}
                {tagline && (
                  <span className="msb-tagline">{tagline}</span>
                )}
              </span>
            )}
          </a>

          <div className="msb-right">
            <nav className="msb-links">
              {NAV_LINKS.map((l) => {
                /* The app itself IS e-learning — always active here */
                const isActive = l.label === "E-Learning";

                return (
                  <a
                    key={l.label}
                    href={l.href}
                    className={"msb-link" + (isActive ? " active" : "")}
                  >
                    {l.label}
                  </a>
                );
              })}
            </nav>

            {version && (
              <span className="msb-version">v{version}</span>
            )}

            {showSubscribe && (
              <a href="/subscribe" className="msb-cta">
                Subscribe
              </a>
            )}
          </div>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const AuthLayout = ({
  children,
  background,
  logo,
  showBack,
  onBack,
  watermark,
}: {
  children: React.ReactNode;
  background?: string;
  logo?: string;
  showBack?: boolean;
  onBack?: () => void;
  watermark?: boolean;
}) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundImage: watermark
        ? "none"
        : background
        ? `url(${background})`
        : "linear-gradient(135deg, #F2F2F7 0%, #E5E5EA 100%)",
      backgroundSize: watermark ? "auto" : "cover",
      backgroundPosition: "center",
      backgroundColor: watermark ? "#FFFFFF" : "#F2F2F7",
      fontFamily: iosFont,
      overflow: "hidden",
      position: "relative",
      padding: 24,
      boxSizing: "border-box",
    }}
  >
    <style>{`
      @keyframes fadeUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes scrollBg {
        0% {
          background-position: 0px 0px;
        }
        100% {
          background-position: 120px 120px;
        }
      }
    `}</style>

    {watermark && (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: logo
            ? `url(${logo})`
            : "url(/loadlogo.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "120px 120px",
          opacity: 0.08,
          animation: "scrollBg 30s linear infinite",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    )}

    {!watermark && background && (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    )}

    {showBack && onBack && (
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          zIndex: 10,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    )}

    <div
      style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: 400,
        background: "#FFFFFF",
        borderRadius: 28,
        padding: "40px 32px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
        border: "1px solid rgba(0,0,0,0.05)",
        animation: "fadeUp 0.6s ease-out",
        boxSizing: "border-box",
      }}
    >
      {logo && (
        <img
          src={logo}
          alt="Logo"
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            objectFit: "cover",
            display: "block",
            margin: "0 auto 24px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}
        />
      )}

      {children}
    </div>
  </div>
);

export default function Startup() {
  const location = useLocation();

  const [redirectRoute, setRedirectRoute] =
    useState<string | null>(null);

  const [screen, setScreen] =
    useState<AppScreen>("main");

  /* ── All empty until fetched from Supabase ── */
  const [siteLogo, setSiteLogo] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteTagline, setSiteTagline] = useState("");

  const [branding, setBranding] = useState<{
    businessName: string;
    logo: string;
    phone: string;
    loginBackground: string;
  } | null>(null);

  const [appVersion, setAppVersion] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tenantId, setTenantId] = useState<string | null>(
    null
  );
  const [lookupError, setLookupError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  const [tempToken, setTempToken] =
    useState<string | null>(null);

  const [requiresUnlock, setRequiresUnlock] = useState(false);

  /* ── Fetch from Supabase only: site_settings first, supadmin_settings fallback ── */
  async function fetchSiteSettings() {
    var logo: string | null = null;
    var name: string | null = null;
    var tag: string | null = null;

    // Try site_settings
    try {
      const r1 = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "main")
        .maybeSingle();

      if (!r1.error && r1.data) {
        const d: any = r1.data;
        logo = d.logo_url || null;
        name = d.site_name || null;
        tag = d.tagline || null;
      }
    } catch {
      // Skipped.
    }

    // Try supadmin_settings — fills in anything site_settings didn't provide
    try {
      const r2 = await supabase
        .from("supadmin_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!r2.error && r2.data) {
        const d2: any = r2.data;
        if (!logo && d2.logo_url) logo = d2.logo_url;
        if (!name && d2.business_name) name = d2.business_name;
        if (!tag && d2.tagline) tag = d2.tagline;
      }
    } catch {
      // Skipped.
    }

    // Apply only what Supabase returned
    if (logo) setSiteLogo(logo);
    if (name) setSiteName(name);
    if (tag) setSiteTagline(tag);
  }

  useEffect(() => {
    getVersion()
      .then((v) => setAppVersion(v))
      .catch(() => {});

    fetchSiteSettings();

    const storedUser =
      localStorage.getItem("currentUser");

    if (storedUser && location.pathname === "/") {
      try {
        const userObj = JSON.parse(storedUser);

        if (userObj?.id) {
          setRequiresUnlock(true);
          setUsername(userObj.username || "");
          setTenantId(userObj.tenantId || null);

          const savedBranding =
            localStorage.getItem(
              "institutionBranding"
            );

          if (savedBranding) {
            setBranding(JSON.parse(savedBranding));
          }

          if (userObj.tenantId) {
            try {
              supabase
                .from("business_settings")
                .select(
                  "business_name, logo, phone, login_background"
                )
                .eq("tenant_id", userObj.tenantId)
                .maybeSingle()
                .then(({ data }) => {
                  if (data) {
                    const b = {
                      businessName:
                        data.business_name || "",
                      logo: data.logo || "",
                      phone: data.phone || "",
                      loginBackground:
                        data.login_background || "",
                    };

                    setBranding(b);

                    localStorage.setItem(
                      "institutionBranding",
                      JSON.stringify(b)
                    );
                  }
                });
            } catch {
              // Offline — cached branding shown.
            }
          }
        }
      } catch {
        localStorage.removeItem("currentUser");
      }
    }

    return () => {
      stopPeriodicPull();
    };
  }, [location.pathname]);

  function handleStartAdminRegister() {
    setScreen("admin_sms");
  }

  function handleSmsSent(phone: string) {
    setPhoneNumber(phone);
    setScreen("admin_otp");
  }

  function handleOtpVerified(token: string) {
    setTempToken(token);
    setScreen("admin_register");
  }

  async function handleAdminCreated(user: any) {
    if (user) {
      enableSyncHooks();
      startPeriodicPull(60000);

      try {
        await pullAllTenantData(user.tenantId);
      } catch {
        // Sync on next pull.
      }

      if (user.role === "admin") {
        setRedirectRoute("/admin");
      } else {
        setRedirectRoute("/user");
      }
    } else {
      setScreen("main");
    }
  }

  async function handleTrainerLookup() {
    setLookupError("");

    if (!businessName.trim()) {
      return setLookupError(
        "Institution name is required"
      );
    }

    setLookupLoading(true);

    const enteredName = businessName.trim();

    const savedInstName =
      localStorage.getItem("institutionName");

    const savedInstId =
      localStorage.getItem("institutionTenantId");

    const savedBranding =
      localStorage.getItem("institutionBranding");

    if (
      savedInstName &&
      savedInstId &&
      savedInstName === enteredName
    ) {
      setTenantId(savedInstId);

      if (savedBranding) {
        setBranding(JSON.parse(savedBranding));
      }

      setScreen("login");
      setLookupLoading(false);

      (async () => {
        try {
          const { data: settings } =
            await supabase
              .from("business_settings")
              .select("*")
              .eq("tenant_id", savedInstId)
              .maybeSingle();

          if (settings) {
            const b = {
              businessName:
                settings.business_name || "",
              logo: settings.logo || "",
              phone: settings.phone || "",
              loginBackground:
                settings.login_background || "",
            };

            setBranding(b);

            localStorage.setItem(
              "institutionBranding",
              JSON.stringify(b)
            );
          }
        } catch {
          // Background branding sync failed.
        }
      })();

      return;
    }

    try {
      const { data: tenants, error } =
        await supabase
          .from("tenants")
          .select("id, business_name")
          .eq("business_name", enteredName);

      if (error) throw error;

      if (!tenants || tenants.length === 0) {
        setLookupError(
          "Institution not found. Check the name or your connection."
        );
        setLookupLoading(false);
        return;
      }

      if (tenants.length > 1) {
        setLookupError(
          "Multiple institutions share this name. Please contact support."
        );
        setLookupLoading(false);
        return;
      }

      const tenant = tenants[0];

      localStorage.setItem(
        "institutionName",
        tenant.business_name || enteredName
      );

      localStorage.setItem(
        "institutionTenantId",
        tenant.id
      );

      try {
        const { data: settings } =
          await supabase
            .from("business_settings")
            .select("*")
            .eq("tenant_id", tenant.id)
            .maybeSingle();

        if (settings) {
          const b = {
            businessName:
              settings.business_name || "",
            logo: settings.logo || "",
            phone: settings.phone || "",
            loginBackground:
              settings.login_background || "",
          };

          setBranding(b);

          localStorage.setItem(
            "institutionBranding",
            JSON.stringify(b)
          );
        }
      } catch {
        // Branding fetch failed.
      }

      setTenantId(tenant.id);
      setScreen("login");
      setLookupLoading(false);
    } catch {
      setLookupError(
        "Institution not found. Check the name or your connection."
      );
      setLookupLoading(false);
    }
  }

  async function handleLogin() {
    setMessage("");

    if (!username.trim() || !password.trim()) {
      return setMessage(
        "Username and password are required"
      );
    }

    if (!tenantId) {
      return setMessage(
        "Session error. Please re-select your institution."
      );
    }

    setLoading(true);

    try {
      try {
        const result = await loginTenant({
          tenantId,
          username,
          password,
        });

        if (
          typeof result.user.username !== "string" ||
          result.user.username !== username.trim()
        ) {
          throw new Error(
            "Invalid username or password"
          );
        }

        const safeUser = {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email || "",
          phone: result.user.phone || "",
          profilePic:
            (result.user as any).profile_pic || "",
          role: result.user.role,
          tenantId: result.user.tenantId,
          assignedCourses:
            result.user.assigned_courses || [],
          createdAt:
            (result.user as any).created_at ||
            new Date().toISOString(),
          password,
          synced: true,
        };

        await addUser(safeUser);

        localStorage.setItem(
          "currentUser",
          JSON.stringify(safeUser)
        );

        localStorage.setItem(
          "authToken",
          result.authToken
        );

        window.dispatchEvent(
          new Event("authStateChanged")
        );

        enableSyncHooks();
        startPeriodicPull(60000);

        if (safeUser.tenantId) {
          pullAllTenantData(
            safeUser.tenantId
          ).catch(() => {});

          pullSettings().catch(() => {});
        }

        redirectUser(safeUser.role);
        return;
      } catch (backendError: any) {
        if (backendError?.noOfflineFallback) {
          throw backendError;
        }

        if (import.meta.env.DEV) {
          console.warn(
            "Backend login failed, trying offline DB.",
            backendError
          );
        }
      }

      const user = await loginUser(
        username.trim(),
        password,
        tenantId
      );

      if (
        !user ||
        typeof user.username !== "string" ||
        user.username !== username.trim()
      ) {
        throw new Error(
          "Invalid username or password."
        );
      }

      const safeUser = {
        id: user.id,
        username: user.username,
        email: user.email || "",
        phone: user.phone || "",
        profilePic: user.profilePic || "",
        role: user.role,
        tenantId: user.tenantId,
        assignedCourses: user.assignedCourses || [],
        createdAt: user.createdAt,
        synced: false,
      };

      localStorage.setItem(
        "currentUser",
        JSON.stringify(safeUser)
      );

      localStorage.setItem(
        "authToken",
        "offline-mode-pending-sync"
      );

      window.dispatchEvent(
        new Event("authStateChanged")
      );

      redirectUser(safeUser.role);
    } catch {
      setMessage("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  function redirectUser(role: string) {
    if (role === "admin") {
      setRedirectRoute("/admin");
    } else if (role === "trainer") {
      setRedirectRoute("/trainer");
    } else {
      setRedirectRoute("/user");
    }
  }

  if (redirectRoute) {
    return <Navigate to={redirectRoute} replace />;
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 54,
    padding: "0 16px",
    border: "none",
    outline: "none",
    background: "rgba(0,0,0,0.03)",
    fontSize: 17,
    color: "#1C1C1E",
    boxSizing: "border-box",
    borderRadius: 14,
    marginBottom: 12,
    transition: "background 0.2s",
  };

  /* ── Auth card: institution logo first, then fetched site logo ── */
  const cardLogo =
    branding?.logo || siteLogo || undefined;

  if (screen === "admin_sms") {
    return (
      <StartupShell
        brandName={siteName || undefined}
        tagline={siteTagline || undefined}
        logo={siteLogo || undefined}
        version={appVersion}
      >
        <PhoneEntry
          onSent={handleSmsSent}
          onBack={() => setScreen("main")}
        />
      </StartupShell>
    );
  }

  if (screen === "admin_otp") {
    return (
      <StartupShell
        brandName={siteName || undefined}
        tagline={siteTagline || undefined}
        logo={siteLogo || undefined}
        version={appVersion}
      >
        <VerifyCode
          phone={phoneNumber}
          onVerified={handleOtpVerified}
          onBack={() => setScreen("admin_sms")}
        />
      </StartupShell>
    );
  }

  if (screen === "admin_register") {
    return (
      <StartupShell
        brandName={siteName || undefined}
        tagline={siteTagline || undefined}
        logo={siteLogo || undefined}
        version={appVersion}
      >
        <RegisterAdmin
          phone={phoneNumber}
          tempToken={tempToken || ""}
          onComplete={handleAdminCreated}
          onBack={() => setScreen("admin_otp")}
        />
      </StartupShell>
    );
  }

  if (requiresUnlock) {
    return (
      <StartupShell
        brandName={siteName || undefined}
        tagline={siteTagline || undefined}
        logo={siteLogo || undefined}
        version={appVersion}
      >
        <AuthLayout
          background={branding?.loginBackground}
          logo={cardLogo}
          showBack
          onBack={() => {
            stopPeriodicPull();
            localStorage.removeItem("currentUser");
            localStorage.removeItem("authToken");
            setRequiresUnlock(false);
            setPassword("");
            setUsername("");
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: 24,
              color: "#1C1C1E",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Welcome back
          </h2>

          <p
            style={{
              textAlign: "center",
              fontSize: 15,
              color: "#8E8E93",
              marginBottom: 24,
            }}
          >
            Enter your password to continue.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            style={{ width: "100%" }}
          >
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setMessage("");
              }}
              style={inputStyle}
              autoFocus
              autoComplete="current-password"
            />

            {message && (
              <p
                style={{
                  textAlign: "center",
                  color: "#FF3B30",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                {message}
              </p>
            )}

            <LoadingButton
              type="submit"
              loading={loading}
              loadingLabel="Signing in…"
              disabled={!password}
              style={{
                height: 54,
                padding: 0,
              }}
            >
              Unlock
            </LoadingButton>
          </form>
        </AuthLayout>
      </StartupShell>
    );
  }

  if (screen === "login") {
    return (
      <StartupShell
        brandName={siteName || undefined}
        tagline={siteTagline || undefined}
        logo={siteLogo || undefined}
        version={appVersion}
      >
        <AuthLayout
          background={branding?.loginBackground}
          logo={cardLogo}
          showBack
          onBack={() => {
            stopPeriodicPull();
            setScreen("main");
            setTenantId(null);
            setMessage("");
          }}
        >
          <h1
            style={{
              textAlign: "center",
              fontSize: 24,
              color: "#1C1C1E",
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            Welcome Back
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            style={{ width: "100%" }}
          >
            <input
              name="username"
              placeholder="Username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              style={inputStyle}
              autoFocus
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={inputStyle}
              autoComplete="current-password"
            />

            {message && (
              <p
                style={{
                  textAlign: "center",
                  color: "#FF3B30",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                {message}
              </p>
            )}

            <LoadingButton
              type="submit"
              loading={loading}
              loadingLabel="Signing in…"
              style={{
                height: 54,
                padding: 0,
              }}
            >
              Login
            </LoadingButton>
          </form>
        </AuthLayout>
      </StartupShell>
    );
  }

  return (
    <StartupShell
      brandName={siteName || undefined}
      tagline={siteTagline || undefined}
      logo={siteLogo || undefined}
      version={appVersion}
      showSubscribe
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <AuthLayout watermark logo={cardLogo}>
          <h1
            style={{
              textAlign: "center",
              fontSize: 24,
              color: "#1C1C1E",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Welcome
          </h1>

          <p
            style={{
              textAlign: "center",
              fontSize: 15,
              color: "#8E8E93",
              marginBottom: 24,
            }}
          >
            Enter your institution to continue
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrainerLookup();
            }}
            style={{ width: "100%" }}
          >
            <input
              type="text"
              placeholder="Enter Institution Name"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                setLookupError("");
              }}
              style={inputStyle}
              autoFocus
              autoComplete="organization"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />

            {lookupError && (
              <p
                style={{
                  textAlign: "center",
                  color: "#FF3B30",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                {lookupError}
              </p>
            )}

            <LoadingButton
              type="submit"
              loading={lookupLoading}
              loadingLabel="Finding…"
              disabled={!businessName.trim()}
              style={{
                height: 54,
                padding: 0,
              }}
            >
              Continue
            </LoadingButton>
          </form>
        </AuthLayout>

        {/* Register New Institution — page lower-right corner */}
        <button
          onClick={handleStartAdminRegister}
          style={{
            position: "fixed",
            right: 28,
            bottom: 28,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: MEDICAL_BLUE,
            boxShadow:
              "0 6px 18px rgba(0,122,255,0.30)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            transition:
              "transform 0.15s ease, box-shadow 0.15s ease",
          }}
          title="Register New Institution"
          aria-label="Register New Institution"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "scale(1.06)";
            e.currentTarget.style.boxShadow =
              "0 8px 22px rgba(0,122,255,0.38)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 6px 18px rgba(0,122,255,0.30)";
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line
              x1="20"
              y1="8"
              x2="20"
              y2="14"
            />
            <line
              x1="23"
              y1="11"
              x2="17"
              y2="11"
            />
          </svg>
        </button>
      </div>
    </StartupShell>
  );
}