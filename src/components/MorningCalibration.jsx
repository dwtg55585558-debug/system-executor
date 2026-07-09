import React, { useMemo } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "../styles/theme.js";
import { calibrationMessages } from "../utils/calibrationMessages.js";

export default function MorningCalibration({ onContinue }) {
  const message = useMemo(
    () => calibrationMessages[Math.floor(Math.random() * calibrationMessages.length)],
    []
  );

  return (
    <div
      style={{ background: "rgba(0,0,0,0.72)", color: C.text, fontFamily: FONT_BODY }}
      className="fixed inset-0 z-40 flex items-center justify-center px-6"
    >
      <div
        className="w-full max-w-sm"
        style={{
          border: `1px solid rgba(203,163,95,0.34)`,
          borderRadius: 18,
          padding: 24,
          textAlign: "center",
          background:
            "radial-gradient(circle at 50% 0%, rgba(203,163,95,0.2), transparent 38%), linear-gradient(155deg, rgba(19,20,25,0.98), rgba(10,11,14,0.99))",
          boxShadow: "0 28px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(203,163,95,0.12)",
        }}
      >
        <div style={{ color: C.textFaint, fontSize: 11, letterSpacing: 3 }} className="uppercase mb-4">
          Market Gate
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.gold }}>
          修煉校準
        </div>
        <div style={{ color: C.textFaint, fontSize: 12.5, marginTop: 8 }}>
          進入市場前，先回到系統
        </div>
        <div
          style={{
            border: `1px solid rgba(203,163,95,0.18)`,
            borderRadius: 14,
            background: "rgba(7,8,11,0.62)",
            color: C.text,
            fontFamily: FONT_DISPLAY,
            fontSize: 18,
            lineHeight: 1.55,
            marginTop: 22,
            padding: "18px 16px",
          }}
        >
          {message}
        </div>
        <button
          onClick={onContinue}
          className="mt-6 rounded-full px-10 py-3 text-sm font-medium"
          style={{ background: C.goldDim, color: C.text }}
        >
          我已校準
        </button>
      </div>
    </div>
  );
}
