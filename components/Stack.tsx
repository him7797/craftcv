const cards = [
  { label: '[ LOCAL ]',    name: 'Ollama',       note: 'qwen2.5:14b for rewrites · qwen2.5:7b for scoring · runs on M2 silently', bold: true },
  { label: '[ PROD ]',     name: 'Groq',         note: 'Llama 3.3 70B · 14,400 req/day free · 500+ tok/sec', bold: true },
  { label: '[ FALLBACK ]', name: 'Gemini Flash', note: '1M tokens/day · 1,500 req/day · OpenAI-compatible', bold: false },
  { label: '[ APP ]',      name: 'Next.js + TS', note: 'Server Components · Tailwind · Vercel deploy · Print CSS', bold: false },
  { label: '[ DATA ]',     name: 'JSON Files',   note: 'master.json + per-version files · git-trackable · zero DB', bold: false },
  { label: '[ EXPORT ]',   name: 'Native Print', note: 'Cmd+P → PDF · pixel-perfect · no headless Chrome', bold: false },
]

export default function Stack() {
  return (
    <section className="section" id="stack">
      <div className="section-tag">[ THE STACK ]</div>
      <h2 className="section-h">Free to run. <em>Forever.</em></h2>
      <p className="section-sub">
        Local AI for development. Free-tier cloud APIs for production. The kind of
        architecture that <b>doesn&apos;t get more expensive</b> the more you use it.
      </p>

      <div className="stack-grid">
        <div className="stack-list">
          {cards.map(({ label, name, note, bold }) => (
            <div key={label} className="stack-item">
              <span className="stack-label">{label}</span>
              <span className="stack-name">
                {bold ? <b>{name}</b> : name}
              </span>
              <span className="stack-note">{note}</span>
            </div>
          ))}
        </div>

        <div className="stack-callout">
          <div className="stack-callout-tag">[ THE TRICK ]</div>
          <h3>One env var.<br />Zero code changes.</h3>
          <p>
            Switch between local Ollama and prod Groq with a single flag. The{' '}
            <code style={{ fontFamily: 'var(--font-mono)', background: '#0D0D0D', color: '#FFD600', padding: '1px 5px', fontSize: 12 }}>
              lib/llm.ts
            </code>{' '}
            abstraction layer handles everything else.
          </p>
          <div className="stack-code">
            <span className="c"># .env.local (development)</span><br />
            LLM_PROVIDER=<span className="v">ollama</span><br />
            OLLAMA_MODEL=<span className="v">qwen2.5:14b</span><br />
            <br />
            <span className="c"># .env.production</span><br />
            LLM_PROVIDER=<span className="v">groq</span><br />
            GROQ_MODEL=<span className="v">llama-3.3-70b</span>
          </div>
        </div>
      </div>
    </section>
  )
}
