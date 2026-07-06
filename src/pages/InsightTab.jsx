import React from "react";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Card from "../components/Card.jsx";
import SectionLabel from "../components/SectionLabel.jsx";
import StatBlock from "../components/StatBlock.jsx";
import StreakHeatmap from "../components/StreakHeatmap.jsx";
import { C } from "../styles/theme.js";
import { BOSSES, VIOLATION_TYPES, EMOTION_TAGS } from "../utils/constants.js";
import { clamp } from "../utils/helpers.js";

export default function InsightTab({ ctx }) {
  const { data } = ctx;
  const dates = Object.keys(data.history).sort();
  const sessions = dates.map((d) => data.history[d]);

  const totalTrades = sessions.reduce((s, d) => s + d.trades.length, 0);
  const followedTrades = sessions.reduce((s, d) => s + d.trades.filter((t) => t.followed_checklist).length, 0);
  const adherenceRate = totalTrades ? Math.round((followedTrades / totalTrades) * 100) : null;

  const daysWithViolation = sessions.filter((d) => d.violations.length > 0).length;
  const violationRate = sessions.length ? Math.round((daysWithViolation / sessions.length) * 100) : 0;

  const waitDays = sessions.filter((d) => d.successful_wait).length;
  const waitRate = sessions.length ? Math.round((waitDays / sessions.length) * 100) : 0;

  const emotionCounts = {};
  sessions.forEach((d) => {
    if (d.journal?.emotion) emotionCounts[d.journal.emotion] = (emotionCounts[d.journal.emotion] || 0) + 1;
  });
  const emotionData = EMOTION_TAGS.map((e) => ({ name: e, count: emotionCounts[e] || 0 }));

  const bossFreq = BOSSES.map((b) => {
    const count = sessions.reduce(
      (s, d) => s + d.violations.filter((v) => VIOLATION_TYPES.find((vt) => vt.id === v.id)?.bossId === b.id).length,
      0
    );
    return { name: b.name, count };
  });

  const qualityData = dates.map((d) => {
    const s = data.history[d];
    let score = 50;
    if (s.morning_plan && s.workout && s.reading && s.checklist_pass) score += 15;
    score += Math.min(s.trades.filter((t) => t.followed_checklist).length * 10, 20);
    score -= s.violations.length * 15;
    if (s.successful_wait) score += 10;
    if (s.journal?.q1) score += 10;
    if (s.journal?.q5) score += 10;
    return { name: d.slice(5), score: clamp(score, 0, 100) };
  });

  const cumMap = {};
  data.expLog
    .slice()
    .sort((a, b) => a.ts - b.ts)
    .forEach((e) => {
      cumMap[e.date] = e.total;
    });
  let lastVal = 0;
  const growthData = dates.map((d) => {
    if (cumMap[d] !== undefined) lastVal = cumMap[d];
    return { name: d.slice(5), exp: lastVal };
  });

  return (
    <div>
      <div style={{ color: C.textDim, fontSize: 13 }} className="mb-3">
        洞察 · 非績效導向
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatBlock label="策略遵守率" value={adherenceRate === null ? "—" : `${adherenceRate}%`} color={C.violet} />
        <StatBlock label="違規率" value={`${violationRate}%`} color={C.ash} />
        <StatBlock label="等待成功率" value={`${waitRate}%`} color={C.sage} />
      </div>

      <SectionLabel>身份成長曲線(累積 EXP)</SectionLabel>
      <Card>
        <div style={{ height: 130 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.violet} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={C.violet} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.hair} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ background: C.raised2, border: `1px solid ${C.hair}`, fontSize: 12 }} />
              <Area type="monotone" dataKey="exp" stroke={C.violet} fill="url(#expGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionLabel>Decision Quality 趨勢</SectionLabel>
      <Card>
        <div style={{ height: 130 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={qualityData}>
              <CartesianGrid stroke={C.hair} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip contentStyle={{ background: C.raised2, border: `1px solid ${C.hair}`, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke={C.gold} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionLabel>情緒分布</SectionLabel>
      <Card>
        <div style={{ height: 130 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emotionData}>
              <CartesianGrid stroke={C.hair} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: C.raised2, border: `1px solid ${C.hair}`, fontSize: 12 }} />
              <Bar dataKey="count" fill={C.violetDim} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionLabel>最常出現的心魔</SectionLabel>
      <Card>
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bossFreq} layout="vertical">
              <CartesianGrid stroke={C.hair} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fill: C.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ background: C.raised2, border: `1px solid ${C.hair}`, fontSize: 12 }} />
              <Bar dataKey="count" fill={C.ashDim} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionLabel>連續完成任務(近 28 天,點擊可回顧)</SectionLabel>
      <Card>
        <StreakHeatmap history={data.history} onSelect={ctx.setReviewDate} />
      </Card>
    </div>
  );
}
