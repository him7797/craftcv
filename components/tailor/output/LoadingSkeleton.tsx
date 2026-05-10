export default function LoadingSkeleton() {
  return (
    <div className="tailor-skeleton-overlay">
      {/* Match score skeleton */}
      <div className="tailor-out-block">
        <div className="tailor-out-h">MATCH SCORE</div>
        <div className="tailor-score-row">
          <div
            className="tailor-skeleton-bar"
            style={{ width: 130, height: 64 }}
            aria-hidden
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="tailor-subscore">
                <div
                  className="tailor-skeleton-bar"
                  style={{ width: 180, height: 12, marginBottom: 4 }}
                  aria-hidden
                />
                <div
                  className="tailor-skeleton-bar"
                  style={{ width: '100%', height: 4 }}
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyword pills skeleton */}
      <div className="tailor-out-block">
        <div className="tailor-out-h">KEYWORD ANALYSIS</div>
        <div className="tailor-pill-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`p-${i}`}
              className="tailor-skeleton-bar"
              style={{ width: 88, height: 26 }}
              aria-hidden
            />
          ))}
        </div>
        <div style={{ height: 24 }} />
        <div className="tailor-pill-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`m-${i}`}
              className="tailor-skeleton-bar"
              style={{ width: 100, height: 26 }}
              aria-hidden
            />
          ))}
        </div>
      </div>

      {/* Language suggestions skeleton */}
      <div className="tailor-out-block">
        <div className="tailor-out-h">LANGUAGE SUGGESTIONS</div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              border: '1px solid var(--b)',
              padding: '18px 22px',
              marginBottom: 16,
            }}
          >
            <div
              className="tailor-skeleton-bar"
              style={{ width: '70%', height: 14, marginBottom: 12 }}
              aria-hidden
            />
            <div
              className="tailor-skeleton-bar"
              style={{ width: '60%', height: 14 }}
              aria-hidden
            />
          </div>
        ))}
      </div>
    </div>
  )
}
