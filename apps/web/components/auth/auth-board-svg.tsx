/** Decorative animated board preview for the auth left panel. */
export function AuthBoardSvg() {
  return (
    <svg
      className="tf-auth-board"
      viewBox="0 0 360 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="8"
        y="8"
        width="344"
        height="204"
        rx="18"
        fill="#fff"
        fillOpacity="0.06"
        stroke="#fff"
        strokeOpacity="0.18"
      />
      {[0, 1, 2].map((col) => (
        <g key={col} transform={`translate(${28 + col * 110}, 28)`}>
          <rect
            width="96"
            height="164"
            rx="12"
            fill="#fff"
            fillOpacity="0.05"
            stroke="#fff"
            strokeOpacity="0.12"
          />
          <rect
            x="12"
            y="14"
            width="40"
            height="8"
            rx="4"
            fill="#fff"
            fillOpacity="0.35"
          />
          {[0, 1, 2].map((row) => (
            <rect
              key={row}
              className={`tf-auth-card-float tf-auth-card-float-${col}-${row}`}
              x="10"
              y={36 + row * 40}
              width="76"
              height="28"
              rx="8"
              fill="#fff"
              fillOpacity="0.12"
              stroke="#fff"
              strokeOpacity="0.2"
            />
          ))}
        </g>
      ))}
      <circle className="tf-auth-orbit" cx="300" cy="48" r="5" fill="#6ea8ff" />
      <circle
        className="tf-auth-orbit-2"
        cx="52"
        cy="176"
        r="4"
        fill="#fff"
        fillOpacity="0.55"
      />
    </svg>
  );
}
