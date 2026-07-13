import React from "react";
import { Check } from "lucide-react";
import Card from "./Card.jsx";
import { C, FONT_MONO } from "../styles/theme.js";

const REQUIREMENT_LABELS = {
  level: "Level",
  closedLoopDays: "完整修煉閉環",
  zeroViolationClosedLoopDays: "零違規閉環",
};

function RequirementRow({ type, requirement, targetStage }) {
  const isLevel = type === "level";
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div style={{ color: C.text, fontSize: 12.5, fontWeight: 800 }}>{REQUIREMENT_LABELS[type]}</div>
          <div className="mt-1" style={{ color: targetStage.identityAccent, fontFamily: FONT_MONO, fontSize: 11.5 }}>
            {isLevel ? `Lv.${requirement.current} / Lv.${requirement.target}` : `${requirement.current} / ${requirement.target}`}
          </div>
        </div>
        {requirement.complete ? (
          <div className="flex shrink-0 items-center gap-1" style={{ color: C.sage, fontSize: 11 }}>
            <Check size={13} />已達成｜還差 0 {isLevel ? "級" : "次"}
          </div>
        ) : (
          <div className="shrink-0" style={{ color: C.textFaint, fontSize: 11 }}>
            還差 {requirement.remaining} {isLevel ? "級" : "次"}
          </div>
        )}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: C.raised2 }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${requirement.progress}%`, background: targetStage.identityAccent }}
        />
      </div>
    </div>
  );
}

export default function StageEligibilityCard({ eligibility, canAdvance, previewActive, onAdvance }) {
  const { targetStage, requirements } = eligibility;

  if (!targetStage) {
    return (
      <Card>
        <div style={{ color: C.text, fontSize: 14, fontWeight: 900 }}>已抵達目前最高修煉階段</div>
        <div className="mt-2" style={{ color: C.textDim, fontSize: 12, lineHeight: 1.55 }}>
          繼續累積穩定執行，不以單筆結果定義自己。
        </div>
      </Card>
    );
  }

  const unavailable = !targetStage.assetReady || !targetStage.unlockEnabled;

  return (
    <Card
      style={{
        borderColor: targetStage.identityAccentBorder,
        background: `radial-gradient(circle at 100% 0%, ${targetStage.identityGlow}, transparent 34%), ${C.surface}`,
      }}
    >
      <div style={{ color: C.textFaint, fontSize: 10.5, letterSpacing: 1 }}>下一階段</div>
      <div className="mt-1" style={{ color: targetStage.identityAccent, fontSize: 18, fontWeight: 900 }}>{targetStage.label}</div>

      <div className="mt-4 divide-y" style={{ borderColor: C.hair }}>
        {Object.entries(REQUIREMENT_LABELS).map(([type]) => (
          <RequirementRow key={type} type={type} requirement={requirements[type]} targetStage={targetStage} />
        ))}
      </div>

      {unavailable ? (
        <div
          className="mt-4 rounded-lg px-3 py-2.5"
          style={{ color: "#8290a0", background: "rgba(73,87,104,.12)", border: "1px solid rgba(86,104,123,.26)", fontSize: 12 }}
        >
          下一階段尚未開放
        </div>
      ) : previewActive ? (
        <div className="mt-4" style={{ color: C.textFaint, fontSize: 11.5 }}>
          DEV 階段預覽中，正式晉階操作已停用。
        </div>
      ) : canAdvance ? (
        <button
          type="button"
          onClick={onAdvance}
          className="mt-4 w-full rounded-xl py-3 text-sm font-extrabold"
          style={{ color: "#0b1015", background: targetStage.identityAccent, boxShadow: `0 0 18px ${targetStage.identityGlow}` }}
        >
          完成晉階
        </button>
      ) : (
        <div className="mt-4" style={{ color: C.textFaint, fontSize: 11.5 }}>
          繼續修煉，完成未達成的資格。
        </div>
      )}
    </Card>
  );
}
