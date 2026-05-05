const items = [
  { icon: '⚡', title: 'Local-first AI', desc: 'Ollama runs on your machine. Bullet rewrites and scoring happen offline. Your resume data never leaves localhost.' },
  { icon: '◎', title: 'JD Tailoring', desc: "Paste any JD, get a match score, see missing keywords, and language gaps. Mirror the JD's words intelligently — not stuff them." },
  { icon: '▦', title: 'Live Scoring', desc: 'Out of 100, across five dimensions. Re-scores as you type. Action items show what to fix first for max score gain.' },
  { icon: '⊞', title: 'Master + Versions', desc: 'One canonical resume. Branch off per-role versions without losing the truth. Switch in one click. Diff like git.' },
  { icon: '▤', title: 'ATS-clean PDF', desc: 'Single column. No photos. No skill bars. No icons. Print-ready. Recruiters and parsers both happy.' },
  { icon: '★', title: 'Bullet Rewrites', desc: 'Type a rough bullet, AI rewrites it with metric scaffolding, action verbs, and impact framing. Accept, edit, retry, skip.' },
]

export default function Features() {
  return (
    <section className="section features-bg" id="features">
      <div className="section-tag">[ FEATURE SET ]</div>
      <h2 className="section-h">Built like a tool. <em>Not a SaaS.</em></h2>
      <p className="section-sub">
        No accounts. No paywalls. No ads. No tracking. Just the things that actually
        move your resume from &quot;OK&quot; to &quot;interview&quot;.
      </p>

      <div className="features-grid">
        {items.map(({ icon, title, desc }) => (
          <div key={title} className="feat">
            <div className="feat-icon">{icon}</div>
            <div className="feat-h">{title}</div>
            <div className="feat-p">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
