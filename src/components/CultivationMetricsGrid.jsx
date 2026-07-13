import React from "react";
import Card from "./Card.jsx";
import { C, FONT_MONO } from "../styles/theme.js";

const PRIMARY_METRICS = [
  ["closedLoopDays", "完整修煉閉環", "次"],
  ["zeroViolationClosedLoopDays", "零違規閉環", "次"],
  ["currentDisciplineStreak", "連續紀律修煉", "日"],
  ["successfulWaitDays", "成功等待", "日"],
];

const SECONDARY_METRICS = [
  ["compliantStrategySamples", "符合策略樣本"],
  ["completeTradeRecords", "完整交易紀錄"],
  ["journalDays", "Journal 結算"],
  ["longestDisciplineStreak", "最長紀律連續"],
];

const TRACKED_METRIC_KEYS = [
  ...PRIMARY_METRICS.map(([key]) => key),
  ...SECONDARY_METRICS.map(([key]) => key),
];

export default function CultivationMetricsGrid({ metrics, accent }) {
  const hasTrackedActivity = TRACKED_METRIC_KEYS.some(
    (key) => Number(metrics[key]) > 0
  );

  if (!hasTrackedActivity) {
    return (
      <Card style={{ borderStyle: "dashed" }}>
        <div style={{ color: C.textDim, fontSize: 12.5, lineHeight: 1.65 }}>
          完成第一次完整修煉閉環後，成長紀錄會開始累積。
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="grid grid-cols-2 gap-2.5">
        {PRIMARY_METRICS.map(([key, label, unit]) => (
          <div key={key} className="rounded-xl p-3" style={{ background: C.raised, border: `1px solid ${C.hair}` }}>
            <div style={{ color: C.textDim, fontSize: 10.5, lineHeight: 1.35 }}>{label}</div>
            <div className="mt-2" style={{ color: accent, fontFamily: FONT_MONO, fontSize: 21, fontWeight: 800 }}>
              {metrics[key]} <span style={{ color: C.textFaint, fontSize: 10 }}>{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-0">
        {SECONDARY_METRICS.map(([key, label], index) => (
          <div
            key={key}
            className="flex min-w-0 items-center justify-between gap-2 py-2.5"
            style={{ borderTop: index >= 2 ? `1px solid ${C.hair}` : "none" }}
          >
            <span className="min-w-0" style={{ color: C.textFaint, fontSize: 10.5, lineHeight: 1.3 }}>{label}</span>
            <span className="shrink-0" style={{ color: C.textDim, fontFamily: FONT_MONO, fontSize: 12 }}>{metrics[key]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
