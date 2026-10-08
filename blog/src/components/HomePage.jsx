import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage(props) {
  const navigate = useNavigate();
  const post = (props.posts || [])[0] || null;

  function handleClick(id) {
    navigate("/article/" + id);
  }

  function isVideo(url) {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i.test(url);
  }

  function renderMedia(url, alt, className) {
    if (!url)
      return (
        <div className={className + " empty"}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      );
    if (isVideo(url))
      return (
        <video
          src={url}
          muted
          loop
          playsInline
          autoPlay
          className={className + "-media"}
        />
      );
    return <img src={url} alt={alt || ""} className={className + "-media"} />;
  }

  function getContentParagraphs(content, max) {
    if (!content) return [];
    return content
      .split("\n")
      .filter(function (x) {
        return x.trim();
      })
      .slice(0, max);
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container">
          <span className="hero-badge">Insights &amp; Research</span>
          <h1 className="home-title">
            Ideas that shape
            <br />
            <span className="home-title-accent">healthier communities.</span>
          </h1>
          <p className="home-subtitle">
            Insights, research, and stories from the frontlines of public health,
            data systems, and community resilience.
          </p>
          <a href="/articles" className="home-cta">
            Browse all articles
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </section>

      {post && (
        <section className="home-featured">
          <div className="container">
            <span className="home-label">Latest Blog</span>
            <div
              className="featured-card"
              onClick={function () {
                handleClick(post.id);
              }}
            >
              {/* ── Top: image + body grid ── */}
              <div className="featured-grid">
                <div className="featured-image">
                  {renderMedia(post.image_url, post.title, "featured-image")}
                </div>
                <div className="featured-body">
                  <div className="featured-meta">
                    {post.category && (
                      <span className="featured-cat">{post.category}</span>
                    )}
                    <span className="featured-date">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2>{post.title}</h2>
                  <div className="featured-excerpt-row">
                    {post.excerpt && (
                      <p className="featured-excerpt">{post.excerpt}</p>
                    )}
                    {Array.isArray(post.form_schema) &&
                      post.form_schema.length > 0 && (
                        <span className="featured-form-pill">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="9" y1="9" x2="15" y2="9" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                          </svg>
                          Form
                        </span>
                      )}
                  </div>
                  <div className="featured-divider" />
                  {getContentParagraphs(post.content, 3).map(function (
                    para,
                    i
                  ) {
                    return (
                      <p key={i} className="featured-paragraph">
                        {para}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* ── Bottom bar: author left + read right ── */}
              <div className="featured-footer">
                <div className="featured-author-wrap">
                  {post.author_image_url ? (
                    <img
                      src={post.author_image_url}
                      alt={post.author || "Author"}
                      className="featured-avatar-img"
                    />
                  ) : (
                    <div className="featured-avatar">
                      {(post.author || "A").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="featured-author-info">
                    <span className="featured-author-name">
                      {post.author || "Admin"}
                    </span>
                    <span className="featured-author-role">Author</span>
                  </div>
                </div>
                <span className="featured-read">
                  Read article
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="home-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">7,021+</span>
              <span className="stat-label">Professionals Trained</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">7+</span>
              <span className="stat-label">Research Projects</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">Active Studies</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">11</span>
              <span className="stat-label">Facilities Equipped</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-flow">
        <div className="container">
          <span className="flow-label">What drives us</span>
          <div className="flow-grid">
            <div className="flow-step">
              <div className="flow-circle circle-red">
                <span>1</span>
              </div>
              <h3 className="flow-title">Research</h3>
              <p className="flow-text">
                Evidence generation that informs policy and practice across health
                systems.
              </p>
            </div>
            <div className="flow-connector">
              <svg
                width="100%"
                height="20"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M0 10 H40 L50 2 L60 10 H100" />
              </svg>
            </div>
            <div className="flow-step">
              <div className="flow-circle circle-amber">
                <span>2</span>
              </div>
              <h3 className="flow-title">Innovation</h3>
              <p className="flow-text">
                Digital tools and systems that close critical gaps in community
                health.
              </p>
            </div>
            <div className="flow-connector">
              <svg
                width="100%"
                height="20"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M0 10 H40 L50 2 L60 10 H100" />
              </svg>
            </div>
            <div className="flow-step">
              <div className="flow-circle circle-green">
                <span>3</span>
              </div>
              <h3 className="flow-title">Entrepreneurship</h3>
              <p className="flow-text">
                Sustainable ventures that strengthen and empower resilient
                communities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}