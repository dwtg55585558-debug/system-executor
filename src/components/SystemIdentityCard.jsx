import React from "react";
import { Lock } from "lucide-react";
import Card from "./Card.jsx";
import { C, FONT_DISPLAY, FONT_MONO } from "../styles/theme.js";

const STAGE_POSITIONING = {
  apprentice: "正在建立穩定執行的基本節奏",
  cultivator: "正在把正確執行轉化為可持續習慣",
  executor: "正在以一致方式提交策略樣本",
  awakened: "能辨識情緒，並維持系統主導",
  master: "不被單筆結果影響，穩定執行系統",
};

function StagePortrait({ stage }) {
  if (stage.idleImage) {
    return (
      <img
        src={stage.idleImage}
        alt={`${stage.label} Idle 角色`}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ color: C.textFaint }}>
      <Lock size={22} strokeWidth={1.4} aria-hidden="true" />
      <span style={{ fontFamily: FONT_MONO, fontSize: 12 }}>{stage.label.slice(0, 1)}</span>
    </div>
  );
}

export default function SystemIdentityCard({ identity, stage, level, levelTitle, isPreview = false }) {
  const expPercent = level.expToNext <= 0
    ? 100
    : Math.max(0, Math.min(100, Math.round((level.expInto / level.expToNext) * 100)));

  return (
    <Card
      style={{
        padding: 0,
        overflow: "hidden",
        borderColor: stage.identityAccentBorder,
        background: `radial-gradient(circle at 50% 110%, ${stage.identityGlow}, transparent 38%), linear-gradient(145deg, rgba(15,19,25,.98), rgba(9,12,17,.98))`,
        boxShadow: `0 0 28px ${stage.identityGlow}`,
      }}
    >
      <div className="flex min-w-0 gap-4 p-4">
        <div
          className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl"
          style={{ background: stage.idleBackground, border: `1px solid ${stage.identityAccentBorder}` }}
        >
          <StagePortrait stage={stage} />
        </div>

        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span style={{ color: stage.identityAccent, fontSize: 11, fontWeight: 800, letterSpacing: 1.2 }}>
              {stage.label}
            </span>
            {isPreview && (
              <span
                className="rounded-full px-2 py-0.5"
                style={{ color: C.textDim, background: C.raised2, fontSize: 9.5 }}
              >
                DEV 預覽
              </span>
            )}
          </div>
          <div className="mt-1 truncate" style={{ color: C.text, fontFamily: FONT_DISPLAY, fontSize: 21, fontWeight: 800 }}>
            {identity?.name?.trim() || "執行者"}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1" style={{ fontSize: 11.5 }}>
            <span style={{ color: stage.identityAccent, fontFamily: FONT_MONO, fontWeight: 800 }}>Lv.{level.level}</span>
            <span style={{ color: C.textFaint }}>等級稱號</span>
            <span style={{ color: C.textDim }}>{levelTitle}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: C.raised2 }}>
            <div className="h-full rounded-full" style={{ width: `${expPercent}%`, background: stage.identityAccent }} />
          </div>
          <div className="mt-1.5 flex justify-between gap-2" style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 9.5 }}>
            <span>Level EXP</span>
            <span>{level.expToNext <= 0 ? "MAX" : `${level.expInto} / ${level.expToNext}`}</span>
          </div>
        </div>
      </div>

      <div
        className="px-4 py-3"
        style={{ borderTop: `1px solid ${stage.identityAccentDim}`, color: C.textDim, fontSize: 12.5, lineHeight: 1.55 }}
      >
        {STAGE_POSITIONING[stage.key]}
      </div>
    </Card>
  );
}
