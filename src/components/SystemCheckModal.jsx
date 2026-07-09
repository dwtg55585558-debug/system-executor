import React from "react";
import { C } from "../styles/theme.js";
import { RISK_REASON_LABEL } from "../utils/constants.js";

export default function SystemCheckModal({ riskCheck, onRespond, onClose }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.68)" }}
    >
      <div className="relative rounded-2xl p-5 w-full max-w-xs" style={{ background: C.raised2, border: `1px solid ${C.violetDim}` }}>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉 System Check"
            className="absolute right-3 top-3 flex items-center justify-center rounded-full"
            style={{ width: 28, height: 28, color: C.textFaint, background: C.raised }}
          >
            ×
          </button>
        )}
        <div style={{ color: C.violet, fontSize: 11, letterSpacing: 2 }} className="uppercase mb-2">
          System Check
        </div>
        <div className="space-y-1 mb-4">
          {riskCheck.reasons.map((r) => (
            <div key={r} style={{ fontSize: 12, color: C.textDim }}>
              · {RISK_REASON_LABEL[r]}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <button
            onClick={() => onRespond("following_system")}
            className="w-full rounded-lg py-2.5 text-sm text-left px-3"
            style={{ background: C.raised, border: `1px solid ${C.sageDim}`, color: C.text }}
          >
            ○ 我現在依照系統
          </button>
          <button
            onClick={() => onRespond("emotionally_driven")}
            className="w-full rounded-lg py-2.5 text-sm text-left px-3"
            style={{ background: C.raised, border: `1px solid ${C.ashDim}`, color: C.text }}
          >
            ○ 我現在受到情緒影響
          </button>
        </div>
      </div>
    </div>
  );
}
