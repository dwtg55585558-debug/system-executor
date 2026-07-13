import React from "react";
import { Check, Lock } from "lucide-react";
import Card from "./Card.jsx";
import { CHARACTER_STAGE_ORDER, CHARACTER_STAGES, getNextCharacterStage } from "../config/characterStages.js";
import { C } from "../styles/theme.js";

export default function CultivationStageProgress({ currentStageKey }) {
  const currentStage = CHARACTER_STAGES[currentStageKey] || CHARACTER_STAGES.apprentice;
  const nextStage = getNextCharacterStage(currentStage.key);

  return (
    <Card style={{ padding: "16px 10px" }}>
      <div className="grid grid-cols-5" aria-label="五階段修煉進度">
        {CHARACTER_STAGE_ORDER.map((stageKey, index) => {
          const stage = CHARACTER_STAGES[stageKey];
          const completed = stage.order < currentStage.order;
          const current = stage.key === currentStage.key;
          const next = stage.key === nextStage?.key;
          const unavailable = !stage.assetReady || !stage.unlockEnabled;
          const color = completed ? C.sage : current ? stage.identityAccent : next ? stage.identityAccentBorder : "#56606d";
          const stateLabel = current ? "目前" : unavailable ? "尚未開放" : next ? "下一階" : completed ? "已通過" : "未解鎖";

          return (
            <div key={stage.key} className="relative min-w-0 px-0.5 text-center">
              {index > 0 && (
                <div
                  className="absolute h-px"
                  style={{ left: "-50%", right: "50%", top: 14, background: C.hair }}
                  aria-hidden="true"
                />
              )}
              <div
                className="relative z-10 mx-auto flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  color,
                  background: current ? stage.identityAccentDim : next ? stage.identityAccentDim : C.raised,
                  border: `1px solid ${current ? stage.identityAccentBorder : completed ? C.sageDim : next ? stage.identityAccentBorder : C.hair}`,
                  boxShadow: current ? `0 0 12px ${stage.identityGlow}` : "none",
                }}
              >
                {completed ? <Check size={13} /> : unavailable && !current ? <Lock size={11} /> : <span style={{ fontSize: 10 }}>{index + 1}</span>}
              </div>
              <div className="mt-2 whitespace-nowrap" style={{ color: current ? C.text : C.textDim, fontSize: 10.5, fontWeight: current ? 800 : 600 }}>
                {stage.label}
              </div>
              <div style={{ color: current ? stage.identityAccent : next ? stage.identityAccentBorder : C.textFaint, fontSize: 8.5, lineHeight: 1.25, marginTop: 2 }}>
                {stateLabel}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
