/** Standalone branded spinner — ring orbits; mark stays centered. */

export function BrandLoader({
  label = 'Loading TaskFlow…',
  size = 'md',
}: Readonly<{ label?: string; size?: 'md' | 'lg' }>) {
  return (
    <output
      className={`tf-brand-loader${size === 'lg' ? ' tf-brand-loader-lg' : ''}`}
      aria-live="polite"
    >
      <div className="tf-brand-loader-orb">
        <svg
          className="tf-brand-loader-svg"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id="tfSpinGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent, #3b82f6)" />
              <stop
                offset="100%"
                stopColor="var(--ink-950, #0f172a)"
                stopOpacity="0.15"
              />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx="64"
            cy="64"
            r="54"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="5"
          />
          {/* Spinning arc */}
          <g className="tf-brand-loader-spin">
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="url(#tfSpinGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="90 250"
            />
            <circle cx="64" cy="10" r="5" fill="var(--accent, #3b82f6)" />
          </g>
          {/* Soft orbit dots */}
          <g className="tf-brand-loader-spin-rev">
            <circle cx="64" cy="118" r="3.5" fill="currentColor" fillOpacity="0.35" />
          </g>
          {/* Brand tile */}
          <rect
            x="40"
            y="40"
            width="48"
            height="48"
            rx="14"
            fill="var(--ink-950, #0f172a)"
          />
          <text
            x="64"
            y="70"
            textAnchor="middle"
            className="tf-brand-loader-mark"
            fontSize="22"
            fontWeight="700"
            fill="var(--paper-50, #f8fafc)"
          >
            Tf
          </text>
        </svg>
      </div>
      {label ? <p className="tf-brand-loader-label">{label}</p> : null}
    </output>
  );
}

/** Full-viewport brand splash (boot / hard refresh / route gating). */
export function BrandSplash({
  label = 'Starting TaskFlow…',
}: Readonly<{ label?: string }>) {
  return (
    <output className="tf-brand-splash" aria-live="polite" aria-busy="true">
      <BrandLoader label={label} size="lg" />
    </output>
  );
}
