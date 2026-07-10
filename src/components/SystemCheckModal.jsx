import React, { useState } from "react";
import { C } from "../styles/theme.js";
import { RISK_REASON_LABEL } from "../utils/constants.js";

const FUNDED_PROTECTION_ITEMS = [
  { id: "invalid_stop", label: "這筆止損放在策略失效位置" },
  { id: "stop_after_loss", label: "如果這筆虧損，今天不再交易" },
  { id: "not_recovery_trade", label: "這筆不是為了把今天轉正" },
  { id: "accept_loss_day", label: "我接受今天可以是虧損日" },
];

export default function SystemCheckModal({ riskCheck, onRespond, onClose }) {
  const [fundedChecks, setFundedChecks] = useState({});
  const needsFundedConfirm = !!riskCheck.fundedProtectionConfirm;
  const hasRiskReasons = riskCheck.reasons.length > 0;
  const allFundedChecksDone = FUNDED_PROTECTION_ITEMS.every((item) => fundedChecks[item.id]);
  const canFollowSystem = !needsFundedConfirm || allFundedChecksDone;

  const toggleFundedCheck = (id) => {
    setFundedChecks((checks) => ({ ...checks, [id]: !checks[id] }));
  };

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
        <div style={{ color: needsFundedConfirm ? C.gold : C.violet, fontSize: 11, letterSpacing: 2 }} className="uppercase mb-2">
          System Check
        </div>
        {hasRiskReasons && (
          <div className="space-y-1 mb-4">
            {riskCheck.reasons.map((r) => (
              <div key={r} style={{ fontSize: 12, color: C.textDim }}>
                · {RISK_REASON_LABEL[r]}
              </div>
            ))}
          </div>
        )}
        {needsFundedConfirm && (
          <div className="mb-4">
            <div style={{ fontSize: 12.5, color: C.text, fontWeight: 700, marginBottom: 8 }}>
              出金帳戶保護確認
            </div>
            <div className="space-y-2">
              {FUNDED_PROTECTION_ITEMS.map((item) => {
                const checked = !!fundedChecks[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleFundedCheck(item.id)}
                    className="flex w-full items-start gap-2 rounded-lg p-2 text-left"
                    style={{
                      background: C.raised,
                      border: `1px solid ${checked ? C.goldDim : C.hair}`,
                      color: checked ? C.text : C.textDim,
                    }}
                  >
                    <span style={{ color: checked ? C.gold : C.textFaint, lineHeight: 1 }}>
                      {checked ? "✓" : "□"}
                    </span>
                    <span style={{ fontSize: 12, lineHeight: 1.45 }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <button
            onClick={() => onRespond("following_system")}
            disabled={!canFollowSystem}
            className="w-full rounded-lg py-2.5 text-sm text-left px-3"
            style={{
              background: C.raised,
              border: `1px solid ${canFollowSystem ? C.sageDim : C.hair}`,
              color: canFollowSystem ? C.text : C.textFaint,
            }}
          >
            ○ 我現在依照系統
          </button>
          {hasRiskReasons && (
            <button
              onClick={() => onRespond("emotionally_driven")}
              className="w-full rounded-lg py-2.5 text-sm text-left px-3"
              style={{ background: C.raised, border: `1px solid ${C.ashDim}`, color: C.text }}
            >
              ○ 我現在受到情緒影響
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
