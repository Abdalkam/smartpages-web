import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ArticlePage.css";

function isVideo(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i.test(url);
}

function ArticlePage(props) {
  var navigate = useNavigate();
  var post = props.post;
  var fmtDate = props.formatDate;
  var onFormSubmit = props.onFormSubmit;
  var hasForm = Array.isArray(post.form_schema) && post.form_schema.length > 0;
  var paragraphs = (post.content || "").split("\n").filter(function (x) { return x.trim(); });

  var [formValues, setFormValues] = useState({});
  var [formSubmitting, setFormSubmitting] = useState(false);
  var [formSubmitted, setFormSubmitted] = useState(false);
  var [formError, setFormError] = useState("");

  var formHeader = post.form_header || "Submit a Response";
  var formSubheader = post.form_subheader || "We'd love to hear from you — fill out the form below.";
  var formIconUrl = post.form_icon_url || null;

  function handleFormChange(label, value) {
    setFormValues(function (prev) { var next = Object.assign({}, prev); next[label] = value; return next; });
  }

  function handleToggle(label, currentVal) {
    setFormValues(function (prev) { var next = Object.assign({}, prev); next[label] = !currentVal; return next; });
  }

  function handleCheckboxChange(label, option, currentChecked) {
    var existing = currentChecked || [];
    var updated = existing.includes(option) ? existing.filter(function (o) { return o !== option; }) : existing.concat([option]);
    setFormValues(function (prev) { var next = Object.assign({}, prev); next[label] = updated; return next; });
  }

  async function handleFormSubmit(e) {
    e.preventDefault(); setFormSubmitting(true); setFormError("");
    try { if (onFormSubmit) await onFormSubmit(post.id, formValues); setFormSubmitted(true); }
    catch (err) { setFormError(err instanceof Error ? err.message : "Submission failed."); }
    finally { setFormSubmitting(false); }
  }

  function renderField(field, index) {
    var value = formValues[field.label];
    var opts = field.options || [];
    var layout = field.layout || "horizontal";
    var groupCls = layout === "vertical" ? "article-form-group-vertical" : "article-form-group";
    var label = <label className="article-form-label">{field.label}</label>;
    var control;

    switch (field.type) {
      case "textarea":
        control = <textarea className="article-form-textarea" placeholder={field.label} rows={3} value={value || ""} onChange={function (e) { handleFormChange(field.label, e.target.value); }} />;
        break;
      case "select":
        control = <select className="article-form-select" value={value || ""} onChange={function (e) { handleFormChange(field.label, e.target.value); }}><option value="" disabled>Select...</option>{opts.map(function (opt, oi) { return <option key={oi} value={opt}>{opt}</option>; })}</select>;
        break;
      case "radio":
        control = <div className="article-form-radio-group">{opts.map(function (opt, oi) { return <label key={oi} className="article-form-radio-item"><input type="radio" name={"radio-" + field.label} value={opt} checked={value === opt} onChange={function () { handleFormChange(field.label, opt); }} /><span className="article-form-radio-dot" /><span>{opt}</span></label>; })}</div>;
        break;
      case "checkbox": case "multiselect":
        control = <div className="article-form-checkbox-group">{opts.map(function (opt, oi) { var checked = (value || []).includes(opt); return <label key={oi} className="article-form-checkbox-item"><input type="checkbox" value={opt} checked={checked} onChange={function () { handleCheckboxChange(field.label, opt, value); }} /><span className="article-form-check-box" /><span>{opt}</span></label>; })}</div>;
        break;
      case "toggle":
        var isOn = !!value;
        control = <div className="article-form-toggle" onClick={function () { handleToggle(field.label, value); }}><div className={"article-form-toggle-knob" + (isOn ? " toggle-on" : "")} /></div>;
        break;
      case "date":
        control = <input className="article-form-input" type="date" value={value || ""} onChange={function (e) { handleFormChange(field.label, e.target.value); }} />;
        break;
      case "number":
        control = <input className="article-form-input" type="number" step="any" placeholder={field.label} value={value || ""} onChange={function (e) { handleFormChange(field.label, e.target.value); }} />;
        break;
      case "integer":
        control = <input className="article-form-input" type="number" step="1" placeholder={field.label} value={value || ""} onChange={function (e) { handleFormChange(field.label, e.target.value); }} />;
        break;
      default:
        control = <input className="article-form-input" type={field.type || "text"} placeholder={field.label} value={value || ""} onChange={function (e) { handleFormChange(field.label, e.target.value); }} />;
    }

    return <div key={index} className={groupCls}>{label}<div className="article-form-control">{control}</div></div>;
  }

  function renderFormRows() {
    var schema = post.form_schema; var rows = []; var i = 0;
    while (i < schema.length) {
      var w = schema[i].width || "full";
      if (w === "quarter") { var q = []; while (i < schema.length && (schema[i].width || "full") === "quarter" && q.length < 4) { q.push(schema[i]); i++; } rows.push({ fields: q, layout: "quarter" }); }
      else if (w === "half") { var h = []; while (i < schema.length && (schema[i].width || "full") === "half" && h.length < 2) { h.push(schema[i]); i++; } rows.push({ fields: h, layout: "half" }); }
      else { rows.push({ fields: [schema[i]], layout: "full" }); i++; }
    }
    return rows.map(function (row, ri) {
      var cls = row.layout === "quarter" ? "article-form-row-quarter" : row.layout === "half" ? "article-form-row-half" : "article-form-row-full";
      return <div key={ri} className={cls}>{row.fields.map(function (f) { return renderField(f, schema.indexOf(f)); })}</div>;
    });
  }

  return (
    <div className="article-main">
      <article className="article-page">
        {post.image_url && <div className="article-hero">{isVideo(post.image_url) ? <video src={post.image_url} controls className="article-hero-media" /> : <img src={post.image_url} alt={post.title} className="article-hero-media" />}</div>}
        <div className="article-inner">
          <button className="back-btn" onClick={function () { navigate("/articles"); }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Back to articles</button>
          <div className="article-meta">
            {post.category && <span className="article-cat">{post.category}</span>}
            {isVideo(post.image_url || "") && <span className="article-vid-pill">Video</span>}
            {hasForm && <span className="article-form-pill"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="7" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg> Form</span>}
            <span className="article-meta-text">By {post.author_image_url ? <img src={post.author_image_url} alt="" className="article-author-img" /> : null}{post.author || "Admin"}</span>
            <span className="meta-dot">·</span>
            <span className="article-meta-text">{fmtDate(post.created_at)}</span>
          </div>
          <h1 className="article-title">{post.title}</h1>
          {post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}
          <div className="article-body">{paragraphs.map(function (p, i) { return <p key={i}>{p}</p>; })}</div>
          {hasForm && (
            <div className="article-form-section">
              <div className="article-form-header">
                <div className="article-form-icon-circle">{formIconUrl ? <img src={formIconUrl} alt="" className="article-form-icon-img" /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>}</div>
                <div><h3 className="article-form-heading">{formHeader}</h3>{formSubheader && <p className="article-form-sub">{formSubheader}</p>}</div>
              </div>
              {formSubmitted ? (
                <div className="article-form-success"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>Thank you — your response has been submitted.</span></div>
              ) : (
                <form className="article-form" onSubmit={handleFormSubmit}>
                  {renderFormRows()}
                  <button type="submit" className="article-form-submit" disabled={formSubmitting}>{formSubmitting ? "Submitting..." : "Submit Response"}</button>
                  {formError && <p className="article-form-error">{formError}</p>}
                </form>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

export default ArticlePage;