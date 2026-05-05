const items = [
  'LOCAL-FIRST AI', 'JD TAILORING', 'LIVE SCORING',
  'VERSION SWITCHER', 'ATS-CLEAN PDF', 'NO CLOUD LOCK-IN', 'BULLET REWRITES',
]

const Row = () => (
  <span>
    {items.map((item, i) => (
      <span key={i}>
        {item}<span className="x">✕</span>
      </span>
    ))}
  </span>
)

export default function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee-track">
        <Row />
        <Row />
      </div>
    </div>
  )
}
