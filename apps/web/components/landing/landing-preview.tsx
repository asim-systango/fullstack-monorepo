export function LandingPreview() {
  return (
    <div className="landing-preview" aria-hidden="true">
      <div className="landing-preview-frame">
        <div className="landing-preview-bar">
          <span className="landing-preview-dot" />
          <span className="landing-preview-dot" />
          <span className="landing-preview-dot" />
        </div>
        <div className="landing-preview-body">
          <aside className="landing-preview-side">
            <p>Library</p>
            <span data-active="">Overview</span>
            <span>Browse Books</span>
            <span>My Loans</span>
            <span>My Reservations</span>
            <span>My Fines</span>
          </aside>
          <div className="landing-preview-main">
            <div className="landing-preview-metrics">
              <div className="landing-preview-card">
                <small>Active loans</small>
                <strong>—</strong>
              </div>
              <div className="landing-preview-card">
                <small>Reservations</small>
                <strong>—</strong>
              </div>
              <div className="landing-preview-card">
                <small>Outstanding fines</small>
                <strong>—</strong>
              </div>
            </div>
            <div className="landing-preview-rows">
              <h3>Due soon</h3>
              <div className="landing-preview-row">
                <strong>Active loan</strong>
                <span>Due date</span>
              </div>
              <div className="landing-preview-row">
                <strong>Second loan</strong>
                <span>Due date</span>
              </div>
              <div className="landing-preview-row">
                <strong>Reservation</strong>
                <span>Queue position</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
