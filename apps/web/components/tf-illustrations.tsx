/** Lightweight decorative SVGs for domain pages. */

const FLOAT_CLASS = ['a', 'b', 'c'] as const;

/** Animated Kanban preview for the home hero (matches board theme). */
export function HomeBoardArt() {
  return (
    <svg
      className="tf-illus tf-home-board-art"
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="8"
        y="10"
        width="304"
        height="160"
        rx="18"
        fill="#fff"
        fillOpacity="0.06"
        stroke="#fff"
        strokeOpacity="0.16"
      />
      {[0, 1, 2].map((col) => (
        <g key={col} transform={`translate(${24 + col * 96}, 28)`}>
          <rect
            width="84"
            height="128"
            rx="12"
            fill="#fff"
            fillOpacity="0.05"
            stroke="#fff"
            strokeOpacity="0.12"
          />
          <rect
            x="12"
            y="12"
            width="36"
            height="7"
            rx="3.5"
            fill="#fff"
            fillOpacity="0.35"
          />
          {[0, 1, 2].map((row) => (
            <rect
              key={row}
              className={`tf-illus-float-${FLOAT_CLASS[row]}`}
              x="10"
              y={32 + row * 30}
              width="64"
              height="22"
              rx="7"
              fill="#fff"
              fillOpacity={col === 1 && row === 0 ? 0.22 : 0.1}
              stroke="#fff"
              strokeOpacity="0.18"
            />
          ))}
        </g>
      ))}
      <circle className="tf-illus-pulse" cx="286" cy="36" r="7" fill="#6ea8ff" />
      <path
        className="tf-home-board-path"
        d="M48 150c40-28 80-28 120 0s80 28 120 0"
        stroke="#6ea8ff"
        strokeOpacity="0.45"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function ProjectsHeroArt() {
  return (
    <svg
      className="tf-illus"
      viewBox="0 0 280 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="12" y="24" width="110" height="112" rx="14" className="tf-illus-surface" />
      <rect x="28" y="42" width="54" height="10" rx="5" className="tf-illus-accent" />
      <rect
        x="28"
        y="64"
        width="78"
        height="18"
        rx="8"
        className="tf-illus-card tf-illus-float-a"
      />
      <rect
        x="28"
        y="90"
        width="70"
        height="18"
        rx="8"
        className="tf-illus-card tf-illus-float-b"
      />
      <rect
        x="158"
        y="18"
        width="110"
        height="124"
        rx="14"
        className="tf-illus-surface"
      />
      <circle cx="186" cy="48" r="14" className="tf-illus-accent-strong" />
      <rect x="210" y="40" width="40" height="10" rx="5" className="tf-illus-muted" />
      <rect
        x="174"
        y="78"
        width="78"
        height="14"
        rx="7"
        className="tf-illus-card tf-illus-float-c"
      />
      <rect
        x="174"
        y="100"
        width="64"
        height="14"
        rx="7"
        className="tf-illus-card tf-illus-float-a"
      />
      <path
        d="M132 78c8-18 18-18 26 0"
        className="tf-illus-stroke"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IssuesInboxArt() {
  return (
    <svg
      className="tf-illus"
      viewBox="0 0 280 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="48" y="28" width="184" height="108" rx="16" className="tf-illus-surface" />
      <path
        d="M64 52h152v18H64V52Zm0 30h120v14H64V82Zm0 26h96v14H64v-14Z"
        className="tf-illus-card"
      />
      <circle cx="214" cy="44" r="16" className="tf-illus-accent-strong tf-illus-pulse" />
      <path
        d="M207 44.5 212 49.5 223 38"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptySparkArt() {
  return (
    <svg
      className="tf-illus tf-illus-sm"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="80" cy="58" r="36" className="tf-illus-surface" />
      <path
        d="M80 34v16M80 66v16M54 58h16M90 58h16M62 40l11 11M97 75l11 11M97 40 86 51M62 75l11-11"
        className="tf-illus-stroke tf-illus-spin-slow"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
