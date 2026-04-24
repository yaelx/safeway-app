const CarsSpinner = () => (
  <svg
    width="240"
    height="100"
    viewBox="0 0 240 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>
      {`
        .road {
          fill: #555;
        }

        .lane {
          stroke: white;
          stroke-width: 4;
          stroke-dasharray: 12 10;
          animation: laneMove 0.6s linear infinite;
        }
        @keyframes laneMove {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -22; }
        }

        .car {
          animation: drive 2.5s linear infinite;
        }

        .car2 {
          animation-delay: -1.25s;
          animation-duration: 2.2s;
        }

        @keyframes drive {
          from {
            transform: translateX(-60px);
          }
          to {
            transform: translateX(260px);
          }
        }
      `}
    </style>

    {/* Road */}
    <rect x="0" y="35" width="240" height="30" rx="6" className="road" />

    {/* Lane markers */}
    <line x1="0" y1="50" x2="240" y2="50" className="lane" />

    {/* Pine Tree */}
    <g>
      {/* Trunk */}
      <rect x="40" y="22" width="3" height="14" fill="#6b4f2a" />

      {/* Tree 1 */}
      <rect x="40" y="26" width="3" height="10" fill="#6b4f2a" />
      <polygon points="41.5,10 36,18 47,18" fill="#2ecc71" />
      <polygon points="41.5,14 34,24 49,24" fill="#27ae60" />
      <polygon points="41.5,18 32,30 51,30" fill="#229954" />
    </g>

    {/* Tree 2 */}
    <g>
      <rect x="180" y="22" width="3" height="14" fill="#6b4f2a" />

      <polygon points="181.5,10 176,18 187,18" fill="#2ecc71" />
      <polygon points="181.5,14 174,24 189,24" fill="#27ae60" />
      <polygon points="181.5,18 172,30 191,30" fill="#229954" />
    </g>

    {/* Car 1 */}
    <g className="car">
      {/* Body */}
      <rect x="0" y="40" width="30" height="14" rx="4" fill="#3498db" />

      {/* Roof */}
      <rect x="6" y="34" width="18" height="10" rx="3" fill="#2980b9" />

      {/* Windows */}
      <rect x="8" y="36" width="6" height="6" rx="1" fill="white" />
      <rect x="16" y="36" width="6" height="6" rx="1" fill="white" />

      {/* Wheels */}
      <circle cx="8" cy="56" r="3" fill="#222" />
      <circle cx="22" cy="56" r="3" fill="#222" />

      <circle cx="30" cy="47" r="2" fill="#fff" opacity="0.6" />
    </g>

    {/* Car 2 */}
    <g className="car car2">
      <rect x="0" y="40" width="30" height="14" rx="4" fill="#e74c3c" />
      <rect x="6" y="34" width="18" height="10" rx="3" fill="#c0392b" />

      {/* Windows */}
      <rect x="8" y="36" width="6" height="6" rx="1" fill="white" />
      <rect x="16" y="36" width="6" height="6" rx="1" fill="white" />

      <circle cx="8" cy="56" r="3" fill="#222" />
      <circle cx="22" cy="56" r="3" fill="#222" />
      <circle cx="30" cy="47" r="2" fill="#fff" opacity="0.6" />
    </g>
  </svg>
);

export default CarsSpinner;
