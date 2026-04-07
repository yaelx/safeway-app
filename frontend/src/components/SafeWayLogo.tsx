import { SvgIcon, SvgIconProps } from "@mui/material";

export const SafeWayLogo = (props: SvgIconProps) => {
  return (
    <SvgIcon
      {...props}
      viewBox="0 0 400 210"
      sx={{ width: 180, height: 90, ...props.sx }}
    >
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#2b6cb0", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#1a365d", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>

      {/* 1. Fortified Shelter Background */}
      <path
        d="M140 100 V40 H160 V55 H185 V40 H215 V55 H240 V40 H260 V100 H140Z"
        fill="url(#blueGradient)"
      />

      {/* 2. Safety Arrow */}
      <path
        d="M175 110 Q200 110 200 80 L185 85 L205 60 L225 85 L210 80 Q210 120 175 120 Z"
        fill="#ff8c00"
      />

      {/* 3. 'S' Letter */}
      <text
        x="55"
        y="160"
        style={{
          fontFamily: "Arial, sans-serif",
          fontWeight: "900",
          fontSize: "48px",
          fill: "url(#blueGradient)",
        }}
      >
        S
      </text>

      {/* 4. ENHANCED STAR OF DAVID: Positioned centrally */}
      <path
        d="M112 125 L128 155 H96 Z M112 162 L96 132 H128 Z"
        fill="none"
        stroke="url(#blueGradient)"
        strokeWidth="5" /* Thickened to match font weight */
      />

      {/* 5. 'FEWAY' Letter - Nudged left to x="138" to close the gap */}
      <text
        x="138"
        y="160"
        style={{
          fontFamily: "Arial, sans-serif",
          fontWeight: "900",
          fontSize: "48px",
          letterSpacing: "2px",
          fill: "url(#blueGradient)",
        }}
      >
        FEWAY
      </text>

      {/* 6. ISRAEL Subtext */}
      <text
        x="150"
        y="195"
        style={{
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          fontSize: "22px",
          fill: "url(#blueGradient)",
          letterSpacing: "5px",
        }}
      >
        ISRAEL
      </text>
      <rect x="120" y="186" width="25" height="3" fill="#2b6cb0" />
      <rect x="255" y="186" width="25" height="3" fill="#1a365d" />
    </SvgIcon>
  );
};
