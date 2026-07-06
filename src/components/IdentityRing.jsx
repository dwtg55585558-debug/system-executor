import React from "react";
import { C, FONT_DISPLAY } from "../styles/theme.js";

export default function IdentityRing({ level, title, expPct, integrityPct }) {
  const R = 58,
    CX = 68,
    CY = 68;
  const integrityColor = integrityPct >= 80 ? C.gold : integrityPct >= 50 ? "#B58A4A" : C.ash;
  const circumference = 2 * Math.PI * R;
  const integrityOffset = circumference * (1 - integrityPct / 100);
  const R2 = 66;
  const circumference2 = 2 * Math.PI * R2;
  const expOffset = circumference2 * (1 - expPct / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 136, height: 136 }}>
      <svg width="136" height="136" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={CX} cy={CY} r={R2} fill="none" stroke={C.hair} strokeWidth="3" />
        <circle
          cx={CX}
          cy={CY}
          r={R2}
          fill="none"
          stroke={C.violet}
          strokeWidth="3"
          strokeDasharray={circumference2}
          strokeDashoffset={expOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <circle cx={CX} cy={CY} r={R} fill={C.raised} stroke={C.hair} strokeWidth="1" />
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={integrityColor}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={integrityOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: C.text, lineHeight: 1 }}>
          Lv.{level}
        </div>
        <div style={{ fontSize: 11, color: C.textDim, marginTop: 4, letterSpacing: 0.5 }}>{title}</div>
      </div>
    </div>
  );
}
