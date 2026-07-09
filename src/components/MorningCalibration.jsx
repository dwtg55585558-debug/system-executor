import React, { useMemo } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "../styles/theme.js";

export const calibrationMessages = [
  "今天的目標不是獲利，而是遵守系統。",
  "這一單不重要，重要的是我是否照規則執行。",
  "沒有 A+ 訊號，就不是我的交易。",
  "錯過行情不是失敗，偏離系統才是失敗。",
  "我不需要抓住每一段行情，我只需要執行我的策略。",
  "市場不欠我機會，我只等待屬於我的型態。",
  "情緒想交易時，我選擇先停下來。",
  "我不是來證明自己，我是來重複正確行為。",
  "今天最多只做高品質決策，不做情緒反應。",
  "止損是系統成本，不是個人失敗。",
  "上一單已經結束，下一單重新按規則判斷。",
  "獲利不能讓我放鬆紀律，虧損不能讓我急著補回。",
  "如果這個決策不能寫進未來 1000 筆交易，我就不做。",
  "等待不是浪費時間，等待是交易系統的一部分。",
  "我可以不交易，但不能亂交易。",
  "我只執行符合策略的交易，不執行想像中的機會。",
  "真正的進步，是少做錯誤交易，不是多做幾單。",
  "當我想立刻進場，先問：這是訊號，還是焦慮？",
  "我的身份是穩定執行者，不是追逐行情的人。",
  "今天只修煉一件事：看見衝動，但不被衝動帶走。",
];

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
