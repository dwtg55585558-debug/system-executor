import React from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "../styles/theme.js";

export default function MorningCalibration({ onContinue }) {
  return (
    <div
      style={{ background: C.void, color: C.text, fontFamily: FONT_BODY }}
      className="w-full min-h-screen flex flex-col items-center justify-center px-8"
    >
      <div style={{ color: C.textFaint, fontSize: 11, letterSpacing: 3 }} className="uppercase mb-6">
        System Calibration
      </div>
      <div style={{ fontSize: 12, color: C.textFaint }}>今天身份</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.gold, marginTop: 4, marginBottom: 20 }}>
        System Executor
      </div>
      <div style={{ fontSize: 12, color: C.textFaint }}>今天唯一工作</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.text, marginTop: 4, marginBottom: 20 }}>
        執行策略。
      </div>
      <div style={{ fontSize: 12.5, color: C.textFaint, textAlign: "center", marginBottom: 40 }}>
        今天不需要證明自己。
      </div>
      <button
        onClick={onContinue}
        className="rounded-full px-10 py-3 text-sm font-medium"
        style={{ background: C.violetDim, color: C.text }}
      >
        Continue
      </button>
    </div>
  );
}
