import React from "react";
import { Sparkles, Lock, RotateCcw } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Card from "../components/Card.jsx";
import SectionLabel from "../components/SectionLabel.jsx";
import IdentityRing from "../components/IdentityRing.jsx";
import { C, FONT_MONO } from "../styles/theme.js";
import { TITLE_BANDS, BOSSES, VIOLATION_TYPES, ACHIEVEMENTS, RARITY_COLOR, JOURNAL_GAP_WARNING } from "../utils/constants.js";
import { titleForLevel } from "../utils/levels.js";
import { journalGapDays } from "../utils/helpers.js";

export default function SystemTab({ ctx, onReset }) {
  const { data, lvl } = ctx;

  const integrityData = data.integrityLog.slice(-14).map((p, i) => ({ name: i, value: p.value }));

  const bossStats = BOSSES.map((b) => {
    const encountered = Object.values(data.history).reduce(
      (sum, s) => sum + s.violations.filter((v) => VIOLATION_TYPES.find((vt) => vt.id === v.id)?.bossId === b.id).length,
      0
    );
    const defeated = Object.values(data.history).reduce((sum, s) => sum + (s.bossResists.includes(b.id) ? 1 : 0), 0);
    return { ...b, encountered, defeated };
  });

  const gap = journalGapDays(data.history);
  const sortedDates = Object.keys(data.history).sort();
  const todayViolations = (data.history[sortedDates[sortedDates.length - 1]] || {}).violations || [];
  let reason = null,
    recovery = null;
  if (data.identity.integrity < 100) {
    if (gap >= JOURNAL_GAP_WARNING) {
      reason = `Daily Reflection 已中斷 ${gap} 天。`;
      recovery = "完成今天 Journal。";
    } else if (todayViolations.length > 0) {
      reason = "今天出現過偏離系統的決策。";
      recovery = "明天回到系統,Integrity 會逐步恢復。";
    } else {
      reason = "過去的偏離尚未完全修復。";
      recovery = "持續完成每日任務即可恢復。";
    }
  }

  return (
    <div>
      <div style={{ color: C.textDim, fontSize: 13 }} className="mb-3">
        系統
      </div>

      <Card className="flex items-center gap-4">
        <IdentityRing
          level={lvl.level}
          title={titleForLevel(lvl.level)}
          expPct={lvl.expToNext ? (lvl.expInto / lvl.expToNext) * 100 : 100}
          integrityPct={data.identity.integrity}
        />
        <div className="flex-1 min-w-0">
          <div style={{ color: C.textFaint, fontSize: 11 }}>EXP 到下一級</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 15, color: C.violet }}>
            {lvl.expInto} / {lvl.expToNext || "MAX"}
          </div>
          <div style={{ color: C.textFaint, fontSize: 11, marginTop: 10 }}>System Integrity</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 15, color: C.gold }}>{data.identity.integrity}%</div>
        </div>
      </Card>

      <SectionLabel>身份成長路徑</SectionLabel>
      <Card>
        {TITLE_BANDS.map(([threshold, , zh], i) => {
          const active = lvl.level >= threshold;
          const isCurrent = i === TITLE_BANDS.length - 1 ? active : active && lvl.level < TITLE_BANDS[i + 1][0];
          return (
            <div key={threshold} className="flex items-center gap-3 py-1.5">
              <div className="rounded-full shrink-0" style={{ width: 7, height: 7, background: active ? C.gold : C.hair }} />
              <div style={{ fontSize: 13, color: isCurrent ? C.gold : active ? C.text : C.textFaint }}>
                Lv.{threshold} — {zh}
              </div>
              {isCurrent && <span style={{ fontSize: 10, color: C.gold, marginLeft: "auto" }}>目前</span>}
            </div>
          );
        })}
      </Card>

      <SectionLabel>System Integrity 趨勢</SectionLabel>
      <Card>
        <div style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={integrityData}>
              <CartesianGrid stroke={C.hair} strokeDasharray="3 3" vertical={false} />
              <XAxis hide dataKey="name" />
              <YAxis domain={[0, 100]} hide />
              <Tooltip contentStyle={{ background: C.raised2, border: `1px solid ${C.hair}`, fontSize: 12 }} labelStyle={{ display: "none" }} />
              <Line type="monotone" dataKey="value" stroke={C.gold} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {reason && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.hair}` }}>
            <div style={{ fontSize: 11.5, color: C.textFaint }}>原因</div>
            <div style={{ fontSize: 12.5, color: C.textDim, marginTop: 2 }}>{reason}</div>
            <div style={{ fontSize: 11.5, color: C.textFaint, marginTop: 8 }}>恢復方式</div>
            <div style={{ fontSize: 12.5, color: C.sage, marginTop: 2 }}>{recovery}</div>
          </div>
        )}
      </Card>

      <SectionLabel>心魔圖鑑</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {bossStats.map((b) => (
          <Card key={b.id} style={{ padding: 12 }}>
            <div style={{ fontSize: 13, fontFamily: "'Iowan Old Style', Georgia, serif" }}>{b.name}</div>
            <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 4, lineHeight: 1.4 }}>{b.desc}</div>
            <div className="flex items-center justify-between mt-2.5">
              <span style={{ fontSize: 10.5, color: C.ash }}>遭遇 {b.encountered}</span>
              <span style={{ fontSize: 10.5, color: C.sage }}>擊退 {b.defeated}</span>
            </div>
          </Card>
        ))}
      </div>

      <SectionLabel>成就牆</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = data.achievementsUnlocked.includes(a.id);
          const color = RARITY_COLOR[a.rarity];
          return (
            <Card key={a.id} style={{ padding: 12, borderColor: unlocked ? color : C.hair, opacity: unlocked ? 1 : 0.5 }}>
              <div className="flex items-center gap-1.5">
                {unlocked ? <Sparkles size={12} color={color} /> : <Lock size={12} color={C.textFaint} />}
                <span style={{ fontSize: 12.5, color: unlocked ? C.text : C.textFaint }}>{a.name}</span>
              </div>
              <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 4, lineHeight: 1.4 }}>{a.desc}</div>
            </Card>
          );
        })}
      </div>

      <button
        onClick={onReset}
        className="w-full rounded-lg py-2.5 text-xs mt-6 flex items-center justify-center gap-1.5"
        style={{ background: C.raised, color: C.textFaint, border: `1px solid ${C.hair}` }}
      >
        <RotateCcw size={12} /> 重置我的進度
      </button>
    </div>
  );
}
