import { Check, Pencil, ShieldCheck } from "lucide-react";
import Card from "./Card.jsx";
import { C, FONT_DISPLAY, FONT_MONO } from "../styles/theme.js";

export default function CharacterStatusCard({
  stage,
  activated,
  risk,
  level,
  name,
  date,
  mission,
  onPrimary,
  onSecondary,
  onEditName,
}) {
  const image = activated ? stage.activatedImage : stage.idleImage;
  const stateColor = risk ? "#c96660" : mission.complete ? C.sage : activated ? stage.accent : "#66778a";
  const cardBorder = activated
    ? mission.permission ? stage.accent : stage.activatedBorder
    : stage.idleBorder;
  const cardBackground = activated
    ? `radial-gradient(circle at 24% 48%, ${stage.activatedGlow}, transparent 38%), ${stage.activatedBackground}`
    : stage.idleBackground;

  return (
    <Card
      style={{
        position: "relative",
        overflow: "hidden",
        padding: 16,
        borderColor: cardBorder,
        background: cardBackground,
        boxShadow: activated
          ? `0 16px 38px rgba(0,0,0,.4), inset 0 0 0 1px ${stage.activatedInnerBorder}`
          : "0 16px 34px rgba(0,0,0,.36)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div style={{ color: stage.accent, fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1.3 }}>{stage.label} · LV.{level}</div>
          <div className="mt-1 flex items-center gap-2">
            <span style={{ color: C.text, fontFamily: FONT_DISPLAY, fontSize: 19 }}>{name}</span>
            <button type="button" onClick={onEditName} aria-label="更改名稱" style={{ color: C.textFaint, background: "transparent", padding: 4 }}><Pencil size={13} /></button>
          </div>
        </div>
        <div className="shrink-0 rounded-full px-2.5 py-1" style={{ color: stateColor, border: `1px solid ${activated || risk || mission.complete ? stateColor : stage.idleBorder}`, background: activated || risk || mission.complete ? `${stateColor}12` : "rgba(69,84,101,.12)", fontSize: 10.5, fontWeight: 800 }}>{mission.status}</div>
      </div>

      <div className="mt-3 grid items-center gap-4" style={{ gridTemplateColumns: "minmax(112px,124px) minmax(0,1fr)" }}>
        <div className="relative mx-auto" style={{ width: "clamp(112px,31vw,124px)", height: "clamp(112px,31vw,124px)" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 24, overflow: "hidden", border: `1px solid ${activated ? stage.activatedBorder : stage.idleBorder}` }}>
            <img src={image} alt={`${stage.label}${activated ? "啟動" : "待命"}狀態`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
          </div>
          {mission.permission && <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full px-2 py-1" style={{ color: stage.accent, background: "#0a0d11", border: `1px solid ${stage.accentDim}`, fontFamily: FONT_MONO, fontSize: 8.5, fontWeight: 800 }}><ShieldCheck size={11} />TRADE {mission.tradeNumber} · AUTHORIZED</div>}
        </div>
        <div className="min-w-0">
          <div style={{ color: mission.complete ? C.sage : C.text, fontFamily: FONT_DISPLAY, fontSize: 18, lineHeight: 1.3 }}>{mission.title}</div>
          <div className="mt-2" style={{ color: C.textDim, fontSize: 12.5, lineHeight: 1.55 }}>{mission.description}</div>
        </div>
      </div>

      {mission.cta && <button type="button" onClick={onPrimary} className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-bold" style={{ minHeight: 46, color: activated ? "#071018" : "#111820", background: activated ? stage.accent : "#718296", boxShadow: activated ? `0 7px 16px -10px ${stage.accent}` : "none" }}>{mission.cta}</button>}
      {mission.secondary && <button type="button" onClick={onSecondary} className="mt-2 w-full px-2 py-2 text-xs" style={{ minHeight: 36, color: C.textDim, background: "transparent" }}>{mission.secondary.label}</button>}
      {mission.complete && !mission.cta && <div className="mt-4 flex items-center justify-center gap-2" style={{ color: C.sage, fontSize: 12 }}><Check size={15} />今日系統已封存</div>}
      <div className="mt-3 text-right" style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 9 }}>{date}</div>
    </Card>
  );
}
