import React from "react";
import { C, FONT_DISPLAY } from "../styles/theme.js";

export default function BossCardOverlay({ boss, onClose }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.72)" }}
    >
      <div
        className="rounded-2xl p-6 w-full max-w-xs text-center"
        style={{ background: `linear-gradient(160deg, #201417, ${C.raised2})`, border: `1px solid ${C.ashDim}` }}
      >
        <div style={{ color: C.ash, fontSize: 11, letterSpacing: 2 }} className="uppercase mb-2">
          遭遇心魔
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.text }}>{boss.name}</div>
        <div style={{ fontSize: 12.5, color: C.textDim, marginTop: 8, lineHeight: 1.6 }}>{boss.desc}</div>
        <div style={{ fontSize: 12, color: C.textFaint, marginTop: 12 }}>
          你今天被 {boss.name} 擊敗了一次。記住這個感覺,下次會更快認出它。
        </div>
        <button onClick={onClose} className="w-full rounded-lg py-2 text-sm mt-5" style={{ background: C.raised, color: C.text }}>
          我知道了
        </button>
      </div>
    </div>
  );
}
