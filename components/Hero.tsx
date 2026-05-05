export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-tag">
        <span className="live-dot" style={{ animation: 'blink 2s infinite' }} />
        CRAFTCV / V0.1.0-BETA · LIVE
      </div>

      <h1>
        A RESUME BUILDER<br />
        <span className="slash">/</span>FOR ENGINEERS<br />
        <span className="slash">/</span><span className="hi">WHO SHIP.</span>
      </h1>

      <p className="lead">
        Local-first AI. <b>JD-tailored</b> bullets. Live scoring out of 100.
        Zero cloud lock-in. Built for one user — you.
      </p>

      <div className="hero-cta">
        <a href="#" className="btn btn-y btn-lg">Open App →</a>
        <a href="#" className="btn btn-w btn-lg">View Source</a>
      </div>

      <div className="hero-status">
        <span className="dot" style={{ animation: 'blink 2s infinite' }} />
        OLLAMA RUNNING · QWEN2.5:14B · MAC M2 · LOCAL
      </div>

      {/* Hero device — editor mockup */}
      <div className="hero-visual">
        <div className="device">
          <div className="device-bar">
            <div className="device-dots">
              <span /><span /><span />
            </div>
            <div className="device-bar-text">localhost:3000 / editor / experience</div>
            <div className="device-bar-right">PERSONAL BUILD · OLLAMA LOCAL</div>
          </div>

          <div className="mock">
            <div className="mock-nav">
              <div className="mock-nav-logo">
                <div className="mock-nav-logo-icon" />
                <span className="mock-nav-logo-text">CRAFTCV</span>
              </div>
              <div className="mock-nav-tabs">
                <span className="mock-tab active">EDITOR</span>
                <span className="mock-tab">PREVIEW</span>
                <span className="mock-tab">TAILOR</span>
                <span className="mock-tab">SCORE</span>
              </div>
              <div className="mock-nav-actions">
                <span className="mock-mini-btn">PREVIEW PDF</span>
                <span className="mock-mini-btn y">EXPORT PDF</span>
              </div>
            </div>

            <div className="mock-body">
              {/* Left sidebar */}
              <div className="mock-side">
                <div className="mock-side-h">SECTIONS</div>
                <div className="mock-side-item active">EXPERIENCE +</div>
                <div className="mock-side-item">SKILLS &amp; TECH</div>
                <div className="mock-side-item">EDUCATION</div>
                <div className="mock-side-item">PROJECTS</div>
                <div className="mock-side-item">HEADER</div>
                <div className="mock-versions">
                  <div className="mock-side-h">RESUME VERSIONS</div>
                  <div className="mock-side-item active">★ MASTER</div>
                  <div className="mock-side-item muted">Google — Staff SWE</div>
                  <div className="mock-side-item muted">Meta — IC5</div>
                  <div className="mock-side-item muted">Stripe — Backend</div>
                </div>
              </div>

              {/* Main editor */}
              <div className="mock-main">
                <div className="mock-h">Google</div>
                <div className="mock-sub">Senior Software Engineer · Mar 2021 – Present</div>
                <div className="mock-meta">
                  TEAM: <b>SEARCH INFRA</b> · GO, C++, KUBERNETES, BIGTABLE · MOUNTAIN VIEW
                </div>

                <div className="mock-bullet">
                  Redesigned indexing pipeline serving <b>8.5B</b> queries/day — reduced
                  tail latency by <b>34%</b> (p99: 420ms → 278ms) across{' '}
                  <b>14</b> global data centres <i>(↑18% throughput)</i>
                </div>

                <div className="mock-ai-card">
                  <div className="mock-ai-h">
                    <span className="left">▸ AI SUGGESTION · QWEN2.5:14B</span>
                    <span>RETRY ↻</span>
                  </div>
                  <div className="mock-ai-text">
                    Architected distributed cache layer handling <b>2.1M</b> req/sec peak —
                    cutting read costs by <i>$1.2M/yr</i> and eliminating cold-start
                    latency spikes during traffic surges
                  </div>
                  <div className="mock-ai-actions">
                    <span className="mock-ai-btn y">ACCEPT</span>
                    <span className="mock-ai-btn w">EDIT</span>
                    <span className="mock-ai-btn w">SKIP</span>
                  </div>
                </div>

                <div className="mock-bullet">
                  Led migration of <b>3 monoliths</b> to microservices on <b>GKE</b> —
                  deployed across <b>6 regions</b>, achieving 99.997% uptime SLA over 18 months
                </div>
              </div>

              {/* Right score panel */}
              <div className="mock-right">
                <div className="mock-right-h">RESUME SCORE</div>
                <div className="mock-score">78<small>/100</small></div>
                <div className="mock-score-label">Good — keep improving</div>
                {[
                  { label: 'IMPACT', val: 85 },
                  { label: 'LANGUAGE', val: 91 },
                  { label: 'TAILORING', val: 62 },
                  { label: 'FORMAT', val: 70 },
                ].map(({ label, val }) => (
                  <div key={label} className="mock-bar-row">
                    <div className="mock-bar-h">
                      <span>{label}</span><span>{val}</span>
                    </div>
                    <div className="mock-bar">
                      <i style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
