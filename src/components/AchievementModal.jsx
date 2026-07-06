import React from "react";
import { C, FONT_DISPLAY } from "../styles/theme.js";
import { RARITY_COLOR } from "../utils/constants.js";

export default function AchievementModal({ achievement, onClose }) {
  const color = RARITY_COLOR[achievement.rarity];
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.72)" }}
    >
      <div className="rounded-2xl p-6 w-full max-w-xs text-center" style={{ background: C.raised2, border: `1px solid ${color}` }}>
        <div style={{ color, fontSize: 11, letterSpacing: 2 }} className="uppercase mb-2">
          成就解鎖
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.text }}>{achievement.name}</div>
        <div style={{ fontSize: 12.5, color: C.textDim, marginTop: 8 }}>{achievement.desc}</div>
        <button onClick={onClose} className="w-full rounded-lg py-2 text-sm mt-5" style={{ background: C.raised, color: C.text }}>
          太好了
        </button>
      </div>
    </div>
  );
}
