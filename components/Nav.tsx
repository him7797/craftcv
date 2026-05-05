export default function Nav() {
  return (
    <nav className="nav">
      <div className="logo">
        <div className="logo-icon">
          <div className="logo-pixel">
            <span /><span /><span />
            <span /><span /><span />
            <span /><span /><span />
          </div>
        </div>
        <span className="logo-text">CRAFTCV</span>
        <span className="logo-badge">BETA</span>
      </div>

      <div className="nav-links">
        <a href="#modes">Modes</a>
        <a href="#features">Features</a>
        <a href="#stack">Stack</a>
        <a href="#">Docs</a>
        <a href="#" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
      </div>

      <div className="nav-right">
        <a href="#" className="btn btn-w">View Source</a>
        <a href="#" className="btn btn-y">Open App →</a>
      </div>
    </nav>
  )
}
