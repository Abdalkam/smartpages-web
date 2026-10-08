import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "./lib/supabase";
import HomePage from "./components/HomePage";
import ArticlesPage from "./components/ArticlesPage";
import ArticlePage from "./components/ArticlePage";
import AboutPage from "./components/AboutPage";
import SubscribePage from "./components/SubscribePage";
import "./App.css";

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function isValidUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function Navbar(p) {
  var location = useLocation();
  var logo = p.siteLogo
    ? <img src={p.siteLogo} alt={p.siteName} className="brand-logo" />
    : <div className="brand-logo-fallback">M</div>;

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand">
          {logo}
          <div className="brand-text">
            <span className="brand-name">{p.siteName}</span>
            <span className="brand-tagline">{p.siteTagline}</span>
          </div>
        </Link>
        <div className="nav-right">
          <nav className="nav-links">
            <Link to="/" className={location.pathname === "/" ? "nav-link-active" : ""}>Home</Link>
            <Link to="/articles" className={location.pathname.startsWith("/article") || location.pathname === "/articles" ? "nav-link-active" : ""}>Blog</Link>
            {/* E-Learning — full page navigation into the SmartPages app (mounted at /app) */}
            <a href="/app/">E-Learning</a>
            <Link to="/about" className={location.pathname === "/about" ? "nav-link-active" : ""}>About</Link>
          </nav>
          <Link to="/subscribe" className="subscribe-btn">Subscribe</Link>
        </div>
      </div>
    </header>
  );
}

function Footer(p) {
  var yr = new Date().getFullYear();
  var logo = p.siteLogo
    ? <img src={p.siteLogo} alt={p.siteName} className="brand-logo" />
    : <div className="brand-logo-fallback">M</div>;

  return (
    <footer className="blog-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-col">
            <Link to="/" className="brand">
              {logo}
              <div className="brand-text">
                <span className="brand-name">{p.siteName}</span>
                <span className="brand-tagline">{p.siteTagline}</span>
              </div>
            </Link>
            <p className="footer-description">
              Insights, research, and stories from the frontlines of public health, data systems, and community resilience.
            </p>
          </div>

          <div className="footer-nav-col">
            <span className="footer-col-title">Navigation</span>
            <Link to="/">Home</Link>
            <Link to="/articles">Blog</Link>
            <a href="/app/">E-Learning</a>
            <Link to="/about">About</Link>
          </div>

          <div className="footer-contact-col">
            <span className="footer-col-title">Contact</span>
            {p.siteLocation && <span>{p.siteLocation}</span>}
            {p.siteEmail && <a href={`mailto:${p.siteEmail}`}>{p.siteEmail}</a>}
            {p.sitePhone && <a href={`tel:${p.sitePhone}`}>{p.sitePhone}</a>}
            {p.siteWebsite && <a href={p.siteWebsite} target="_blank" rel="noopener noreferrer">{p.siteWebsite}</a>}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {yr} {p.siteName}. All rights reserved.</span>
          <span className="footer-tagline">Ideas worth reading. Stories worth sharing.</span>
        </div>
      </div>
    </footer>
  );
}

function ArticlePageRoute(p) {
  var params = useParams();
  var navigate = useNavigate();
  var post = p.posts.find(function (x) { return String(x.id) === params.id; });
  if (!post) {
    return (
      <div style={{ textAlign: "center", padding: "120px 0" }}>
        <h2 style={{ color: "#64748b", marginBottom: "16px" }}>Article not found</h2>
        <button onClick={function () { navigate("/articles"); }} style={{ color: "#2A4490", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>Back to blog</button>
      </div>
    );
  }
  return (
    <ArticlePage
      post={post}
      siteLogo={p.siteLogo}
      siteName={p.siteName}
      siteTagline={p.siteTagline}
      sitePhone={p.sitePhone}
      siteEmail={p.siteEmail}
      formatDate={p.formatDate}
      onFormSubmit={p.onFormSubmit}
      onBack={function () { navigate("/articles"); }}
    />
  );
}

function App() {
  var postsState = useState([]);
  var posts = postsState[0];
  var setPosts = postsState[1];

  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var logoState = useState("");
  var siteLogo = logoState[0];
  var setSiteLogo = logoState[1];

  var nameState = useState("Medstat Initiative");
  var siteName = nameState[0];
  var setSiteName = nameState[1];

  var taglineState = useState("Building resilient healthy communities");
  var siteTagline = taglineState[0];
  var setSiteTagline = taglineState[1];

  var phoneState = useState("");
  var sitePhone = phoneState[0];
  var setSitePhone = phoneState[1];

  var emailState = useState("");
  var siteEmail = emailState[0];
  var setSiteEmail = emailState[1];

  var locationState = useState("");
  var siteLocation = locationState[0];
  var setSiteLocation = locationState[1];

  var websiteState = useState("");
  var siteWebsite = websiteState[0];
  var setSiteWebsite = websiteState[1];

  var tenantIdRef = useRef(null);

  useEffect(function () {
    fetchPosts();
    fetchSiteSettings();
  }, []);

  async function fetchSiteSettings() {
    var logo = null, name = null, tag = null, phone = null, email = null, loc = null, web = null, tid = null;

    // Try site_settings
    try {
      var r1 = await supabase.from("site_settings").select("*").eq("id", "main").maybeSingle();
      if (!r1.error && r1.data) {
        var d = r1.data;
        logo = d.logo_url || null;
        name = d.site_name || null;
        tag = d.tagline || null;
        phone = d.phone || null;
        email = d.email || null;
        loc = d.location || null;
        web = d.website || null;
      }
    } catch (e) {
      console.log("site_settings fetch skipped", e);
    }

    // Try supadmin_settings — fills in anything site_settings didn't provide
    try {
      var r2 = await supabase.from("supadmin_settings").select("*").limit(1).maybeSingle();
      if (!r2.error && r2.data) {
        var d2 = r2.data;
        if (!logo && d2.logo_url) logo = d2.logo_url;
        if (!name && d2.business_name) name = d2.business_name;
        if (!tag && d2.tagline) tag = d2.tagline;
        if (!phone && d2.phone) phone = d2.phone;
        if (!email && d2.email) email = d2.email;
        if (!loc && d2.location) loc = d2.location;
        if (!web && d2.website) web = d2.website;
        if (d2.tenant_id && isValidUUID(d2.tenant_id)) tid = d2.tenant_id;
      }
    } catch (e) {
      console.log("supadmin_settings fetch skipped", e);
    }

    // Apply whatever we found
    if (logo) setSiteLogo(logo);
    if (name) setSiteName(name);
    if (tag) setSiteTagline(tag);
    if (phone) setSitePhone(phone);
    if (email) setSiteEmail(email);
    if (loc) setSiteLocation(loc);
    if (web) setSiteWebsite(web);
    if (tid) tenantIdRef.current = tid;
  }

  async function fetchPosts() {
    setLoading(true);
    var res = await supabase.from("blog_posts").select("*").eq("published", true).order("created_at", { ascending: false });
    if (res.error) {
      console.error("Failed to fetch posts:", res.error);
    } else {
      setPosts(res.data || []);
    }
    setLoading(false);
  }

  async function handleFormSubmit(postId, answers) {
    var userId = null;
    var userEmail = null;
    var userRole = null;

    try {
      var authResult = await supabase.auth.getUser();
      var user = authResult && authResult.data && authResult.data.user ? authResult.data.user : null;
      if (user) {
        userId = user.id;
        userEmail = user.email || null;
        userRole = (user.app_metadata && user.app_metadata.role) || null;
      }
    } catch (e) {
      console.log("Auth check skipped, submitting as anonymous");
    }

    var row = {
      post_id: String(postId),
      form_id: null,
      tenant_id: isValidUUID(tenantIdRef.current) ? tenantIdRef.current : null,
      user_id: userId,
      username: userEmail || "Anonymous",
      role: userRole,
      answers: answers,
    };

    var result = await supabase
      .from("form_submissions")
      .insert(row)
      .select();

    if (result.error) {
      console.error("FORM SUBMIT — Supabase error:", result.error.code, result.error.message, result.error.details);
      throw new Error(result.error.message || "Failed to save submission.");
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div className="blog-loading">
          <div className="blog-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar siteLogo={siteLogo} siteName={siteName} siteTagline={siteTagline} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage posts={posts} />} />
            <Route path="/articles" element={<ArticlesPage posts={posts} formatDate={formatDate} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/subscribe" element={<SubscribePage />} />
            <Route path="/article/:id" element={<ArticlePageRoute posts={posts} siteLogo={siteLogo} siteName={siteName} siteTagline={siteTagline} sitePhone={sitePhone} siteEmail={siteEmail} formatDate={formatDate} onFormSubmit={handleFormSubmit} />} />
          </Routes>
        </main>
        <Footer siteLogo={siteLogo} siteName={siteName} siteTagline={siteTagline} siteEmail={siteEmail} sitePhone={sitePhone} siteLocation={siteLocation} siteWebsite={siteWebsite} />
      </div>
    </BrowserRouter>
  );
}

export default App;