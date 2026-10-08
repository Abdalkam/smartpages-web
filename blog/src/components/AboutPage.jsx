import "./AboutPage.css";

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-who">
        <div className="container">
          <span className="section-eyebrow">Who We Are</span>
          <h2 className="section-title">Impact driven by <span className="text-accent">three pillars</span></h2>
          <p className="section-desc">We are a research and innovation initiative leveraging entrepreneurship to transform health outcomes and communities across Africa.</p>
          
          <div className="cards-grid">
            <div className="info-card vision">
              <div className="card-icon-wrap"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></div>
              <h3>Our Vision</h3>
              <p>Evidence-based African communities where health systems are resilient, digital, and accessible to all.</p>
            </div>
            <div className="info-card mission">
              <div className="card-icon-wrap"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></div>
              <h3>Our Mission</h3>
              <p>To advance research, innovation, and entrepreneurship that transforms health systems and empowers communities.</p>
            </div>
            <div className="info-card pillars">
              <div className="card-icon-wrap"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg></div>
              <h3>Core Pillars</h3>
              <ul><li>Research and Evidence Generation</li><li>Digital Health Innovation</li><li>Sustainable Entrepreneurship</li></ul>
            </div>
          </div>
        </div>
      </section>

      <section className="about-impact">
        <div className="container">
          <span className="impact-label">Our Impact Cycle</span>
          <h2 className="impact-title">How We Create Change</h2>
          <p className="impact-desc">A continuous transformation model turning community challenges into measurable impact.</p>
          <div className="impact-grid">
            <div className="impact-step"><div className="impact-circle circle-red-outline"><span>1</span></div><h4>Challenges</h4><p>Health inequities, data gaps, and resource limitations.</p></div>
            <div className="impact-connector"><svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M0 10 H40 L50 2 L60 10 H100" /></svg></div>
            <div className="impact-step"><div className="impact-circle circle-orange-outline"><span>2</span></div><h4>Our Approach</h4><p>Research, digital tools, and capacity building.</p></div>
            <div className="impact-connector"><svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M0 10 H40 L50 2 L60 10 H100" /></svg></div>
            <div className="impact-step"><div className="impact-circle circle-green-outline"><span>3</span></div><h4>Impact</h4><p>Resilient systems, healthier populations.</p></div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container">
          <h2>Ready to Transform Africa With Us?</h2>
          <p>Join our network of researchers, innovators, and community leaders.</p>
        </div>
      </section>
    </div>
  );
}