"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const UAE_BORDER_PATH =
  "M 551.9 0.0 L 558.2 0.0 L 564.6 4.9 L 565.6 19.6 L 566.7 20.5 L 566.7 30.3 L 567.7 31.3 L 567.7 33.2 L 564.6 38.1 L 565.6 69.4 L 571.9 89.9 L 577.2 94.8 L 593.0 94.8 L 594.1 93.8 L 598.3 93.8 L 614.1 111.4 L 614.1 136.9 L 615.1 137.8 L 615.1 162.3 L 616.2 163.3 L 616.2 188.7 L 617.2 189.6 L 617.2 199.4 L 621.4 201.4 L 629.9 201.4 L 630.9 202.4 L 639.3 202.4 L 640.4 203.3 L 662.5 202.4 L 662.5 215.1 L 658.3 215.1 L 657.3 216.0 L 630.9 216.0 L 629.9 217.0 L 620.4 217.0 L 619.3 218.0 L 620.4 287.4 L 618.3 287.4 L 618.3 282.5 L 617.2 281.5 L 616.2 258.1 L 614.1 251.2 L 608.8 251.2 L 607.7 252.2 L 580.4 252.2 L 577.2 255.1 L 577.2 260.0 L 575.1 266.9 L 564.6 272.7 L 564.6 299.1 L 573.0 305.0 L 598.3 305.0 L 598.3 307.9 L 588.8 307.9 L 584.6 315.8 L 584.6 317.7 L 568.8 312.8 L 562.5 305.0 L 558.2 259.1 L 556.1 257.1 L 533.0 257.1 L 531.9 256.1 L 527.7 256.1 L 526.6 257.1 L 518.2 267.9 L 518.2 282.5 L 519.3 283.5 L 519.3 296.2 L 520.3 297.2 L 520.3 309.9 L 521.4 310.9 L 521.4 314.8 L 515.1 331.4 L 516.1 353.9 L 513.0 359.7 L 511.9 364.6 L 494.0 378.3 L 495.0 394.0 L 477.1 409.6 L 471.9 433.1 L 451.9 452.6 L 451.9 465.3 L 446.6 467.3 L 444.5 469.2 L 444.5 472.2 L 442.4 474.1 L 440.3 473.1 L 440.3 470.2 L 438.2 468.3 L 340.2 471.2 L 334.9 477.0 L 330.7 480.0 L 317.0 480.0 L 316.0 481.0 L 303.3 481.0 L 302.3 481.9 L 274.9 482.9 L 255.9 474.1 L 223.3 474.1 L 217.0 466.3 L 207.5 466.3 L 202.2 461.4 L 197.0 458.5 L 165.4 455.5 L 152.7 451.6 L 149.6 451.6 L 142.2 448.7 L 139.0 448.7 L 134.8 446.7 L 131.7 446.7 L 124.3 443.8 L 106.4 439.9 L 99.0 437.0 L 88.5 435.0 L 68.5 408.6 L 68.5 400.8 L 50.6 374.4 L 17.9 339.2 L 10.5 315.8 L 10.5 275.7 L 0.0 253.2 L 5.3 223.9 L 32.7 220.9 L 32.7 239.5 L 33.7 240.5 L 33.7 244.4 L 41.1 251.2 L 50.6 251.2 L 50.6 254.2 L 44.2 260.0 L 44.2 281.5 L 45.3 284.5 L 52.7 295.2 L 66.4 296.2 L 67.4 306.0 L 71.6 309.9 L 84.3 308.9 L 87.4 312.8 L 126.4 311.8 L 143.2 305.0 L 152.7 314.8 L 181.2 316.7 L 192.8 332.4 L 212.8 331.4 L 214.9 326.5 L 214.9 304.0 L 221.2 298.2 L 252.8 296.2 L 258.1 294.2 L 269.6 287.4 L 293.9 286.4 L 296.0 284.5 L 296.0 281.5 L 300.2 270.8 L 309.7 259.1 L 316.0 259.1 L 321.3 253.2 L 321.3 237.5 L 331.8 237.5 L 340.2 224.8 L 349.7 207.2 L 352.9 205.3 L 359.2 204.3 L 367.6 195.5 L 371.8 189.6 L 371.8 182.8 L 378.1 181.8 L 384.4 174.0 L 391.8 174.0 L 393.9 172.1 L 399.2 163.3 L 398.1 154.5 L 407.6 142.7 L 415.0 142.7 L 416.0 141.7 L 417.1 131.0 L 423.4 130.0 L 427.6 128.1 L 427.6 123.2 L 428.7 122.2 L 429.7 115.4 L 443.4 115.4 L 447.6 112.4 L 450.8 107.5 L 450.8 95.8 L 452.9 93.8 L 459.2 82.1 L 474.0 78.2 L 478.2 78.2 L 481.4 76.2 L 480.3 73.3 L 480.3 63.5 L 479.2 62.6 L 479.2 51.8 L 478.2 50.8 L 478.2 45.0 L 477.1 44.0 L 436.1 45.0 L 435.0 45.9 L 408.7 45.9 L 407.6 46.9 L 402.4 46.9 L 403.4 32.3 L 408.7 35.2 L 428.7 35.2 L 429.7 34.2 L 465.6 33.2 L 466.6 32.3 L 502.4 31.3 L 503.5 30.3 L 515.1 30.3 L 519.3 34.2 L 522.4 33.2 L 538.2 33.2 L 542.4 26.4 L 542.4 9.8 L 551.9 0.0 Z";

interface NetworkPoint {
  x: number;
  y: number;
}

const networkPoints: NetworkPoint[] = [
  { x: 200.28, y: 362.83 },
  { x: 214.65, y: 454.97 },
  { x: 411.9, y: 336.33 },
  { x: 389.96, y: 390.58 },
  { x: 452.65, y: 231.21 },
  { x: 593.62, y: 210.63 },
  { x: 347.46, y: 275.51 },
];

const dots = [
  { x: 104.44, y: 337.12, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 143.78, y: 368.39, s: 2.18, c: "rgba(68, 136, 255, 0.67)" },
  { x: 168.95, y: 312.89, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 197.81, y: 355.46, s: 2.18, c: "rgba(102, 153, 255, 0.67)" },
  { x: 229.25, y: 321.52, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 253.89, y: 396.96, s: 2.18, c: "rgba(68, 136, 255, 0.67)" },
  { x: 284.51, y: 341.25, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 315.53, y: 296.5, s: 2.18, c: "rgba(102, 153, 255, 0.67)" },
  { x: 340.18, y: 371.86, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 370.79, y: 316.23, s: 2.18, c: "rgba(68, 136, 255, 0.67)" },
  { x: 394.73, y: 228.06, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 419.91, y: 172.63, s: 2.18, c: "rgba(102, 153, 255, 0.67)" },
  { x: 445.37, y: 269.77, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 464.69, y: 203.66, s: 2.18, c: "rgba(68, 136, 255, 0.67)" },
  { x: 495.3, y: 147.94, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 519.95, y: 223.38, s: 2.18, c: "rgba(102, 153, 255, 0.67)" },
  { x: 540.09, y: 178.97, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 559.81, y: 123.75, s: 2.18, c: "rgba(68, 136, 255, 0.67)" },
  { x: 184.05, y: 279.61, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 259.45, y: 255.0, s: 2.18, c: "rgba(102, 153, 255, 0.67)" },
  { x: 345.33, y: 219.02, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 123.64, y: 412.77, s: 2.18, c: "rgba(68, 136, 255, 0.67)" },
  { x: 78.86, y: 381.7, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 222.46, y: 430.85, s: 2.18, c: "rgba(102, 153, 255, 0.67)" },
  { x: 309.16, y: 416.64, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 384.14, y: 381.15, s: 2.18, c: "rgba(68, 136, 255, 0.67)" },
  { x: 436.95, y: 335.51, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 489.75, y: 289.94, s: 2.18, c: "rgba(102, 153, 255, 0.67)" },
  { x: 569.88, y: 101.52, s: 3.27, c: "rgba(68, 136, 255, 0.53)" },
  { x: 604.19, y: 143.88, s: 2.18, c: "rgba(68, 136, 255, 0.67)" },
];

interface CityCallout {
  name: string;
  labelX: number;
  labelY: number;
  calloutX: number;
  calloutY: number;
  markerX: number;
  markerY: number;
}

const cities: CityCallout[] = [
  {
    name: "RAS AL KHAIMAH",
    labelX: 349.04,
    labelY: 24.83,
    calloutX: 499.47,
    calloutY: 41.39,
    markerX: 532.88,
    markerY: 74.44,
  },
  {
    name: "AJMAN",
    labelX: 375.27,
    labelY: 57.46,
    calloutX: 434.96,
    calloutY: 65.63,
    markerX: 486.41,
    markerY: 114.35,
  },
  {
    name: "UMM AL QUWAIN",
    labelX: 269.47,
    labelY: 83.51,
    calloutX: 397.8,
    calloutY: 92.11,
    markerX: 472.03,
    markerY: 137.79,
  },
  {
    name: "SHARJAH",
    labelX: 311.15,
    labelY: 120.49,
    calloutX: 391.57,
    calloutY: 129.42,
    markerX: 454.79,
    markerY: 172.24,
  },
  {
    name: "DUBAI",
    labelX: 276.98,
    labelY: 169.26,
    calloutX: 338.81,
    calloutY: 176.11,
    markerX: 404.25,
    markerY: 219.94,
  },
  {
    name: "ABU DHABI",
    labelX: 53.48,
    labelY: 284.68,
    calloutX: 159.94,
    calloutY: 290.79,
    markerX: 260.14,
    markerY: 331.14,
  },
  {
    name: "FUJAIRAH",
    labelX: 545.18,
    labelY: 254.4,
    calloutX: 623.42,
    calloutY: 263.52,
    markerX: 606.44,
    markerY: 203.61,
  },
  {
    name: "AL AIN",
    labelX: 518.36,
    labelY: 382.53,
    calloutX: 500.53,
    calloutY: 388.09,
    markerX: 411.9,
    markerY: 336.33,
  },
];

const postcodes = [
  { code: "3000", x: 591.66, y: 98.86 },
  { code: "2000", x: 507.01, y: 167.47 },
  { code: "4000", x: 424.83, y: 301.41 },
  { code: "5000", x: 266.63, y: 443.66 },
];

export default function UaeMapGraphic() {
  return (
    <Box
      sx={{
        position: "absolute",
        width: 663.57,
        height: 484.87,
        left: { md: "120px", lg: "160px", xl: "188px" },
        top: { md: "110px", lg: "140px", xl: "171px" },
        transform: "rotate(-2.16deg)",
        transformOrigin: "center center",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 1,
      }}
    >
      <svg
        width="663.57"
        height="484.87"
        viewBox="0 0 663.57 484.87"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Subtle clean neon stroke glow filter */}
          <filter id="border-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="2.5"
              floodColor="#26B3FF"
              floodOpacity="0.8"
            />
          </filter>
        </defs>

        {/* UAE Clear Country Border Stroke & Transparent Fill */}
        <path
          d={UAE_BORDER_PATH}
          fill="none"
          stroke="#5ADDFF"
          strokeWidth="1.85"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#border-glow)"
        />

        {/* Horizontal grid lines */}
        {[96.91, 144.81, 193.81, 241.72, 290.72, 338.63, 387.62, 435.53].map(
          (y, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={y}
              x2="663.57"
              y2={y}
              stroke="rgba(90, 221, 255, 0.20)"
              strokeWidth="1.09"
            />
          )
        )}

        {/* Vertical grid lines */}
        {[
          65.33, 130.66, 195.99, 261.32, 326.65, 391.98, 457.31, 522.64, 587.97,
        ].map((x, i) => (
          <line
            key={`v-${i}`}
            x1={x}
            y1="0"
            x2={x}
            y2="484.87"
            stroke="rgba(90, 221, 255, 0.20)"
            strokeWidth="1.09"
          />
        ))}

        {/* Dotted Network Routes */}
        <polyline
          points="200.28,362.83 260.14,331.14 347.46,275.51 404.25,219.94 452.65,231.21 411.9,336.33 389.96,390.58 266.63,443.66 214.65,454.97 200.28,362.83"
          fill="none"
          stroke="#5ADDFF"
          strokeWidth="1.09"
          strokeDasharray="4 4"
          opacity="0.70"
        />
        <polyline
          points="404.25,219.94 454.79,172.24 472.03,137.79 486.41,114.35 532.88,74.44 593.62,210.63 606.44,203.61 452.65,231.21"
          fill="none"
          stroke="#5ADDFF"
          strokeWidth="1.09"
          strokeDasharray="4 4"
          opacity="0.70"
        />

        {/* City Leader Lines (Dashed Lines from callout dot to marker) */}
        {cities.map((city) => (
          <g key={city.name}>
            <line
              x1={city.calloutX}
              y1={city.calloutY}
              x2={city.markerX}
              y2={city.markerY}
              stroke="rgba(90, 221, 255, 0.70)"
              strokeWidth="1.09"
              strokeDasharray="3 3"
            />
            {/* Small callout anchor dot */}
            <circle
              cx={city.calloutX}
              cy={city.calloutY}
              r="2.7"
              fill="#DDFBFF"
              filter="drop-shadow(0 0 4px rgba(38, 179, 255, 0.9))"
            />
            {/* Target map marker dot */}
            <circle
              cx={city.markerX}
              cy={city.markerY}
              r="3.27"
              fill="#DDFBFF"
              filter="drop-shadow(0 0 6px rgba(38, 179, 255, 0.9))"
            />
          </g>
        ))}

        {/* Network Points */}
        {networkPoints.map((pt, idx) => (
          <circle
            key={`np-${idx}`}
            cx={pt.x}
            cy={pt.y}
            r="3.27"
            fill="#DDFBFF"
            filter="drop-shadow(0 0 6px rgba(38, 179, 255, 0.9))"
          />
        ))}

        {/* Scattered Data Dots */}
        {dots.map((d, i) => (
          <circle
            key={`dot-${i}`}
            cx={d.x}
            cy={d.y}
            r={d.s / 2}
            fill={d.c}
          />
        ))}
      </svg>

      {/* City Labels */}
      {cities.map((city) => (
        <Typography
          key={`label-${city.name}`}
          sx={{
            position: "absolute",
            left: `${city.labelX}px`,
            top: `${city.labelY}px`,
            fontFamily: "var(--font-cairo), 'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "8.72px",
            lineHeight: "11px",
            letterSpacing: "1.09px",
            color: "#ABD1F0",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            textShadow: "0 0 8px rgba(10, 25, 60, 0.9), 0 0 3px rgba(0, 0, 0, 0.8)",
          }}
        >
          {city.name}
        </Typography>
      ))}

      {/* Postcode Badges */}
      {postcodes.map((pc) => (
        <Box
          key={pc.code}
          sx={{
            position: "absolute",
            left: `${pc.x}px`,
            top: `${pc.y}px`,
            width: "52.3px",
            height: "23.97px",
            backgroundColor: "rgba(13, 31, 92, 0.6)",
            border: "1.09px solid rgba(34, 85, 187, 0.67)",
            borderRadius: "3.27px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), 'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "12px",
              lineHeight: "15px",
              color: "#E1F2FF",
              letterSpacing: "0.5px",
            }}
          >
            {pc.code}
          </Typography>
        </Box>
      ))}

      {/* Location Pin Glow Underneath */}
      <Box
        sx={{
          position: "absolute",
          width: "65.38px",
          height: "21.79px",
          left: "319.54px",
          top: "255.81px",
          backgroundColor: "rgba(26, 106, 255, 0.13)",
          borderRadius: "50%",
          boxShadow: "0px 0px 22px 9px rgba(26, 128, 255, 0.8)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "37.05px",
          height: "12.35px",
          left: "334.23px",
          top: "270.5px",
          backgroundColor: "rgba(34, 85, 238, 0.33)",
          borderRadius: "50%",
          boxShadow: "0px 0px 13px 4.4px rgba(51, 153, 255, 0.9)",
        }}
      />

      {/* Pin Pulse Ring */}
      <Box
        sx={{
          position: "absolute",
          width: "45.76px",
          height: "14.16px",
          left: "329.92px",
          top: "271.42px",
          borderRadius: "50%",
          border: "1.53px solid #5ADDFF",
          filter: "drop-shadow(0px 0px 8.7px rgba(38, 179, 255, 0.8))",
          animation: "pinPulse 2.5s infinite ease-out",
          "@keyframes pinPulse": {
            "0%": {
              transform: "scale(0.85)",
              opacity: 0.8,
            },
            "50%": {
              transform: "scale(1.15)",
              opacity: 1,
            },
            "100%": {
              transform: "scale(0.85)",
              opacity: 0.8,
            },
          },
        }}
      />

      {/* Location Pin */}
      <Box
        sx={{
          position: "absolute",
          left: "333.12px",
          top: "212.02px",
          width: "34.87px",
          height: "56.39px",
          filter: "drop-shadow(0px 0px 8.7px rgba(38, 179, 255, 0.8))",
        }}
      >
        <svg
          width="34.87"
          height="56.39"
          viewBox="0 0 35 57"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pin outer teardrop */}
          <path
            d="M17.435 0C7.806 0 0 7.806 0 17.435C0 30.511 17.435 56.39 17.435 56.39C17.435 56.39 34.87 30.511 34.87 17.435C34.87 7.806 27.064 0 17.435 0Z"
            fill="#ADDCFF"
            stroke="#B7E2FF"
            strokeWidth="1.63"
          />
          {/* Pin center dark ring */}
          <circle
            cx="17.435"
            cy="17.435"
            r="8.17"
            fill="#133C7C"
            stroke="rgba(38, 179, 255, 0.8)"
            strokeWidth="1"
          />
          {/* Pin center inner light dot */}
          <circle cx="17.435" cy="17.435" r="3.815" fill="#DDFBFF" />
        </svg>
      </Box>
    </Box>
  );
}
