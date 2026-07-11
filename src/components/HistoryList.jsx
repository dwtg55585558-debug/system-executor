import React from "react";
import SectionLabel from "./SectionLabel.jsx";
import { C } from "../styles/theme.js";

function getHistoryStatus(day) {
  const hasViolation = (day.violations?.length || 0) > 0;
  const hasDeviation = (day.trades || []).some((trade) => trade.followed_checklist === false);

  if (day.journal && (hasViolation || hasDeviation)) return { label: "需要修正", color: C.ash };
  if (day.journal) return { label: "復盤完成", color: C.sage };
  if (day.successful_wait) return { label: "成功等待", color: C.gold };
  return { label: "尚未復盤", color: C.textFaint };
}

function getHistorySummary(day) {
  if (day.journal?.q4) return `指令：${day.journal.q4}`;
  if (day.journal?.q3) return day.journal.q3;
  if (day.successful_wait) return "今日完成成功等待";

  const tradeCount = day.trades?.length || 0;
  if (tradeCount > 0) return `${tradeCount} 筆交易 · 尚未完成復盤`;
  return "今日無交易紀錄";
}

export default function HistoryList({ history, today, onSelect }) {
  if (history.length === 0) return null;

  return (
    <>
      <SectionLabel>歷史復盤</SectionLabel>
      <div style={{ borderTop: `1px solid ${C.hair}` }}>
        {history.map((day) => {
          const status = getHistoryStatus(day);
          return (
            <button
              type="button"
              key={day.date}
              onClick={() => onSelect && onSelect(day.date)}
              className="w-full text-left px-1 py-2.5"
              style={{ minHeight: 56, cursor: onSelect ? "pointer" : "default", borderBottom: `1px solid ${C.hair}`, background: "transparent" }}
            >
              <div className="flex items-center justify-between gap-3">
                <span style={{ fontFamily: "monospace", fontSize: 11.5, color: C.textDim }}>
                  {day.date === today ? "今天" : day.date}
                </span>
                <span style={{ fontSize: 11, color: status.color }}>{status.label}</span>
              </div>
              <div
                className="mt-1 overflow-hidden whitespace-nowrap text-ellipsis"
                style={{ fontSize: 12, color: C.textFaint }}
              >
                {getHistorySummary(day)}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
