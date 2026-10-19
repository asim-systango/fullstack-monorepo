/** Full-bleed branded rails + watermark for authenticated/app pages. */

export function BrandAtmosphere() {
  return (
    <div className="tf-atmosphere" aria-hidden>
      <svg
        className="tf-atmosphere-rail tf-atmosphere-rail-left"
        viewBox="0 0 180 720"
        fill="none"
      >
        <defs>
          <linearGradient id="tfRailL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect
          x="18"
          y="40"
          width="72"
          height="96"
          rx="16"
          stroke="url(#tfRailL)"
          strokeWidth="2"
        />
        <rect
          className="tf-atmosphere-float-a"
          x="34"
          y="58"
          width="40"
          height="14"
          rx="7"
          fill="currentColor"
          fillOpacity="0.18"
        />
        <rect
          className="tf-atmosphere-float-b"
          x="34"
          y="82"
          width="32"
          height="14"
          rx="7"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <circle
          cx="54"
          cy="220"
          r="28"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="2"
        />
        <path
          d="M40 320h60M40 340h44M40 360h52"
          stroke="currentColor"
          strokeOpacity="0.22"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <g className="tf-atmosphere-orbit">
          <circle cx="70" cy="480" r="6" fill="currentColor" fillOpacity="0.45" />
        </g>
        <path
          d="M28 560c40-30 80-30 120 0"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className="tf-atmosphere-rail tf-atmosphere-rail-right"
        viewBox="0 0 180 720"
        fill="none"
      >
        <rect
          x="70"
          y="80"
          width="88"
          height="120"
          rx="18"
          stroke="currentColor"
          strokeOpacity="0.22"
          strokeWidth="2"
        />
        <rect
          className="tf-atmosphere-float-c"
          x="86"
          y="108"
          width="56"
          height="16"
          rx="8"
          fill="currentColor"
          fillOpacity="0.14"
        />
        <rect
          className="tf-atmosphere-float-a"
          x="86"
          y="136"
          width="44"
          height="16"
          rx="8"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <path
          d="M90 280h70M100 304h50M110 328h40"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle
          cx="120"
          cy="430"
          r="36"
          stroke="currentColor"
          strokeOpacity="0.16"
          strokeWidth="2"
        />
        <circle
          className="tf-atmosphere-pulse"
          cx="120"
          cy="430"
          r="10"
          fill="currentColor"
          fillOpacity="0.28"
        />
        <path
          d="M48 560 132 620"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="3"
          strokeDasharray="6 10"
        />
      </svg>

      <div className="tf-atmosphere-mark">
        <span>Tf</span>
      </div>
    </div>
  );
}
