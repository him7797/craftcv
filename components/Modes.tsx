export default function Modes() {
  return (
    <section className="section" id="modes">
      <div className="section-tag">[ FOUR MODES ]</div>
      <h2 className="section-h">
        Write, tailor, preview, score. <em>Repeat until 90+.</em>
      </h2>
      <p className="section-sub">
        Every mode does one thing well. Switch tabs, no context loss. Your{' '}
        <b>master resume</b> stays canonical; per-role versions branch off without
        diverging.
      </p>

      <div className="modes-grid">

        {/* EDITOR */}
        <div className="mode-card">
          <div className="mode-card-h">
            <span className="mode-num">[ 01 / EDITOR ]</span>
            <span className="mode-tag">PRIMARY</span>
          </div>
          <div className="mode-title">Write bullets. <br />AI rewrites them.</div>
          <p className="mode-desc">
            Type a rough bullet — local Ollama rewrites it with metric scaffolding, action
            verbs, and impact framing. Accept, edit, or skip. No cloud round-trip.
          </p>
          <div className="mode-mini">
            <div className="mini-edit-line">
              Led search infra work reducing latency by <b>34%</b> at Google...
            </div>
            <div className="mini-ai">
              <span className="mini-ai-text">▸ AI SUGGESTION READY</span>
              <span className="mini-ai-btn">ACCEPT</span>
            </div>
            <div className="mini-edit-line" style={{ marginTop: 10 }}>
              Rebuilt pipeline serving <b>8.5B</b> queries/day, p99 420ms→<b>278ms</b>
            </div>
          </div>
        </div>

        {/* TAILOR */}
        <div className="mode-card">
          <div className="mode-card-h">
            <span className="mode-num">[ 02 / TAILOR ]</span>
            <span className="mode-tag">JD MATCH</span>
          </div>
          <div className="mode-title">Paste a JD. <br />Get a match score.</div>
          <p className="mode-desc">
            See exactly which keywords are present, which are missing, and where the
            JD&apos;s language doesn&apos;t match your resume&apos;s. Mirror the language
            to close gaps.
          </p>
          <div className="mode-mini mini-tailor">
            <div className="mini-jd">
              <div className="mini-jd-h">JD · CANVA / FULL STACK</div>
              Looking for full stack engineer with TypeScript, React, Node.js, AWS
              infrastructure (ECS, Lambda, S3), GraphQL...
            </div>
            <div className="mini-match">
              <div className="mini-match-score">74<small>/100</small></div>
              <div className="mini-match-pills">
                {['TYPESCRIPT','REACT','NODE','ECS'].map(k => (
                  <span key={k} className="mini-pill ok">{k}</span>
                ))}
                {['GRAPHQL','CI/CD'].map(k => (
                  <span key={k} className="mini-pill miss">{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="mode-card">
          <div className="mode-card-h">
            <span className="mode-num">[ 03 / PREVIEW ]</span>
            <span className="mode-tag">PDF-READY</span>
          </div>
          <div className="mode-title">See it as a PDF. <br />Before you send it.</div>
          <p className="mode-desc">
            Single-column, ATS-clean rendering. Switch between master and tailored versions
            instantly. Cmd+P to export, no design tweaks needed.
          </p>
          <div className="mode-mini mini-preview">
            <div className="mini-doc">
              <div className="mini-doc-name">HIMANSHU</div>
              <div className="mini-doc-meta">SOFTWARE ENGINEER · BLR</div>
              <div className="mini-doc-line m" />
              <div className="mini-doc-line s" />
              <div className="mini-doc-line h" />
              <div className="mini-doc-line m" />
              <div className="mini-doc-line" />
              <div className="mini-doc-line s" />
              <div className="mini-doc-line m" />
              <div className="mini-doc-tags">
                <span className="mini-doc-tag">TS</span>
                <span className="mini-doc-tag">REACT</span>
                <span className="mini-doc-tag">AWS</span>
              </div>
            </div>
            <div className="mini-doc" style={{ marginLeft: 14, transform: 'rotate(2deg)' }}>
              <div className="mini-doc-name">— CANVA VER</div>
              <div className="mini-doc-meta">TAILORED VARIANT</div>
              <div className="mini-doc-line m" />
              <div className="mini-doc-line" />
              <div className="mini-doc-line s" />
              <div className="mini-doc-line h" />
              <div className="mini-doc-line" />
              <div className="mini-doc-line m" />
              <div className="mini-doc-line s" />
            </div>
          </div>
        </div>

        {/* SCORE */}
        <div className="mode-card">
          <div className="mode-card-h">
            <span className="mode-num">[ 04 / SCORE ]</span>
            <span className="mode-tag">FEEDBACK</span>
          </div>
          <div className="mode-title">Score it. <br />Fix the gaps.</div>
          <p className="mode-desc">
            Out-of-100 score across Impact, Language, Tailoring, Format, Length.
            Prioritized action items tell you what to fix first to push the number up.
          </p>
          <div className="mode-mini mini-score-wrap">
            <div className="mini-score-box">
              <div className="mini-score-num">78<small>/100</small></div>
              <div className="mini-score-label">GOOD</div>
            </div>
            <div className="mini-score-bars">
              {[
                { label: 'IMPACT', val: 85, green: false },
                { label: 'LANGUAGE', val: 91, green: false },
                { label: 'TAILORING', val: 62, green: false },
                { label: 'FORMAT', val: 100, green: true },
              ].map(({ label, val, green }) => (
                <div key={label}>
                  <div className="mini-bar-row">
                    <span>{label}</span><span>{val}</span>
                  </div>
                  <div className={`mini-bar${green ? ' green' : ''}`}>
                    <i style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
