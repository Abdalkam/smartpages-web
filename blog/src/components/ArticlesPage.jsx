import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./ArticlesPage.css";

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function isVideo(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i.test(url);
}

function ArticlesPage() {
  var navigate = useNavigate();
  var [posts, setPosts] = useState([]);
  var [loading, setLoading] = useState(true);
  var [categoryFilter, setCategoryFilter] = useState("All");
  var [expandedId, setExpandedId] = useState(null);
  var [formState, setFormState] = useState({});

  useEffect(function () { fetchPosts(); }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      var { data, error } = await supabase.from("blog_posts").select("*").eq("published", true).order("created_at", { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (err) { console.error("Failed to fetch posts:", err); }
    finally { setLoading(false); }
  }

  var allCategories = Array.from(new Set(posts.map(function (p) { return p.category; }).filter(function (c) { return typeof c === "string" && c.length > 0; }))).sort();
  var filteredPosts = categoryFilter === "All" ? posts : posts.filter(function (p) { return p.category === categoryFilter; });

  function toggleExpand(id) { setExpandedId(function (prev) { return prev === id ? null : id; }); }
  function getContentParagraphs(content) { if (!content) return []; return content.split("\n").filter(function (x) { return x.trim(); }); }

  function renderImage(url, alt) {
    if (!url) return (<div className="card-img empty"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>);
    if (isVideo(url)) return (<div className="card-img"><video src={url} muted loop playsInline autoPlay /></div>);
    return (<div className="card-img"><img src={url} alt={alt || ""} /></div>);
  }

  function handleFormChange(postId, fieldLabel, value) {
    setFormState(function(prev) {
      return { ...prev, [postId]: { ...(prev[postId] || {}), [fieldLabel]: value } };
    });
  }

  function renderFormField(field, postId) {
    var currentFieldValue = (formState[postId] && formState[postId][field.label]) || "";
    var widthStyle = { width: "100%" };
    if (field.width === "half") widthStyle = { width: "calc(50% - 8px)" };
    if (field.width === "quarter") widthStyle = { width: "calc(25% - 12px)" };

    var alignClass = field.align || "left";
    var isStacked = alignClass === "stacked";
    var isDateOnly = field.type === "date_only";

    if (isDateOnly) {
      return (
        <div key={field.label} className="acard-field date-only-row" style={{ textAlign: alignClass === "right" ? "right" : "left" }}>
          {field.label}: {formatDate(new Date().toISOString())}
        </div>
      );
    }

    var hasValue = field.placeholder && field.placeholder !== field.label;

    return (
      <div key={field.label} className={"acard-field " + alignClass + (isStacked ? " stacked" : "")} style={widthStyle}>
        <label className="acard-field-label">{field.label}</label>
        
        {hasValue && (
          field.type === "textarea" ? (
            <textarea 
              className="acard-field-input" 
              placeholder={field.placeholder} 
              rows={3}
              value={currentFieldValue}
              onChange={function(e) { handleFormChange(postId, field.label, e.target.value); }}
              style={isStacked ? {width: "100%"} : {}}
            />
          ) : field.type === "select" ? (
            <select 
              className="acard-field-select" 
              value={currentFieldValue}
              onChange={function(e) { handleFormChange(postId, field.label, e.target.value); }}
              style={isStacked ? {width: "100%"} : {}}
            >
              <option value="">{field.placeholder}</option>
              {field.options && field.options.map(function(opt) { return <option key={opt} value={opt}>{opt}</option>; })}
            </select>
          ) : field.type === "checkbox" ? (
            <div className="acard-field-checkbox-group">
              {field.options && field.options.map(function(opt) { 
                var isChecked = currentFieldValue && currentFieldValue.includes(opt);
                return (
                  <label key={opt} className="acard-field-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={isChecked || false}
                      onChange={function(e) {
                        var newVal = currentFieldValue ? currentFieldValue.split(", ") : [];
                        if (e.target.checked) newVal.push(opt);
                        else newVal = newVal.filter(function(v) { return v !== opt; });
                        handleFormChange(postId, field.label, newVal.join(", "));
                      }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          ) : field.type === "radio" ? (
            <div className="acard-field-checkbox-group">
              {field.options && field.options.map(function(opt) { 
                return (
                  <label key={opt} className="acard-field-checkbox-label">
                    <input 
                      type="radio" 
                      name={postId + "-" + field.label}
                      checked={currentFieldValue === opt}
                      onChange={function() { handleFormChange(postId, field.label, opt); }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          ) : field.type === "toggle" ? (
            <button 
              type="button"
              className={"acard-field-toggle" + (currentFieldValue ? " active" : "")}
              onClick={function() { handleFormChange(postId, field.label, !currentFieldValue); }}
            />
          ) : field.type === "multiselect" ? (
            <div className="acard-field-checkbox-group">
              {field.options && field.options.map(function(opt) { 
                var isChecked = currentFieldValue && currentFieldValue.includes(opt);
                return (
                  <label key={opt} className="acard-field-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={isChecked || false}
                      onChange={function(e) {
                        var newVal = currentFieldValue ? currentFieldValue.split(", ") : [];
                        if (e.target.checked) newVal.push(opt);
                        else newVal = newVal.filter(function(v) { return v !== opt; });
                        handleFormChange(postId, field.label, newVal.join(", "));
                      }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          ) : (
            <input 
              className="acard-field-input" 
              type={field.type === "integer" ? "number" : field.type} 
              placeholder={field.placeholder}
              value={currentFieldValue}
              onChange={function(e) { handleFormChange(postId, field.label, e.target.value); }}
              style={isStacked ? {width: "100%"} : {}}
            />
          )
        )}
      </div>
    );
  }

  return (
    <div className="articles-page">
      <div className="articles-container">
        <div className="articles-header">
          <h1 className="articles-heading">Daily blog</h1>
          <p className="articles-subheading">Insights, stories, and ideas worth sharing</p>
        </div>

        {allCategories.length > 0 && (
          <div className="articles-filters">
            <button className={"fbtn" + (categoryFilter === "All" ? " active" : "")} onClick={function () { setCategoryFilter("All"); }}>All</button>
            {allCategories.map(function (cat) { return <button key={cat} className={"fbtn" + (categoryFilter === cat ? " active" : "")} onClick={function () { setCategoryFilter(cat); }}>{cat}</button>; })}
          </div>
        )}

        {loading && <div className="articles-empty">Loading articles...</div>}
        {!loading && filteredPosts.length === 0 && <div className="articles-empty">{posts.length === 0 ? "No articles yet." : "No articles in this category."}</div>}

        {!loading && (
          <div className="articles-grid">
            {filteredPosts.map(function (post) {
              var isExpanded = expandedId === post.id;
              var hasForm = Array.isArray(post.form_schema) && post.form_schema.length > 0;
              var hasVid = isVideo(post.image_url || "");
              var paras = getContentParagraphs(post.content);

              return (
                <div key={post.id} className={"acard" + (isExpanded ? " expanded" : "")}>
                  {post.image_url && <div className="acard-img-wrap">{renderImage(post.image_url, post.title)}</div>}
                  <div className="acard-body">
                    <div className="acard-meta">
                      {post.category && <span className="acard-cat">{post.category}</span>}
                      {hasVid && <span className="acard-vid"><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Video</span>}
                      {hasForm && <span className="acard-frm"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg> Form</span>}
                    </div>
                    <h2 className="acard-title">{post.title}</h2>
                    {!isExpanded && post.excerpt && <p className="acard-excerpt">{post.excerpt}</p>}
                    <div className="acard-author">
                      {post.author_image_url ? (
                        <img src={post.author_image_url} alt="" className="acard-avatar-img" />
                      ) : (
                        <div className="acard-avatar">{(post.author || "A").charAt(0).toUpperCase()}</div>
                      )}
                      <span className="acard-author-name">{post.author || "Admin"}</span>
                      <span className="acard-dot">·</span>
                      <span className="acard-date">{formatDate(post.created_at)}</span>
                    </div>
                    {!isExpanded && (
                      <button className="acard-readmore" onClick={function () { toggleExpand(post.id); }}>
                        Read more
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="acard-expanded">
                      {post.excerpt && <p className="acard-expanded-excerpt">{post.excerpt}</p>}
                      {paras.length > 0 && <div className="acard-content">{paras.map(function (para, i) { return <p key={i}>{para}</p>; })}</div>}
                      
                      {hasForm && (
                        <div className="acard-form-wrap">
                          <div className="acard-form-header">
                            {post.form_icon_url && <img src={post.form_icon_url} alt="" className="acard-form-icon" />}
                            <div className="acard-form-titles">
                              {post.form_header && <h3 className="acard-form-title">{post.form_header}</h3>}
                              {post.form_subheader && <p className="acard-form-subtitle">{post.form_subheader}</p>}
                            </div>
                          </div>
                          <div className="acard-form-fields">
                            {post.form_schema.map(function(field) {
                              return renderFormField(field, post.id);
                            })}
                          </div>
                          <button className="acard-form-submit">Submit Response</button>
                        </div>
                      )}

                      {!hasForm && null}

                      <div className="acard-expanded-footer">
                        <button className="acard-showless" onClick={function () { toggleExpand(post.id); }}>
                          Show less
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                        </button>
                        <button className="acard-full" onClick={function () { navigate("/article/" + post.id); }}>
                          Open full article
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticlesPage;