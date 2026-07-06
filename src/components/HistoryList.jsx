import React from "react";
import Card from "./Card.jsx";
import SectionLabel from "./SectionLabel.jsx";
import { C } from "../styles/theme.js";

export default function HistoryList({ history, today, onSelect }) {
  if (history.length === 0) return null;
  return (
    <>
      <SectionLabel>回顧任一天</SectionLabel>
      <div className="space-y-2">
        {history.map((s) => (
          <Card
            key={s.date}
            style={{ padding: 12, cursor: onSelect ? "pointer" : "default" }}
            onClick={() => onSelect && onSelect(s.date)}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: "monospace", fontSize: 11.5, color: C.textFaint }}>
                {s.date === today ? "今天" : s.date}
              </span>
              <span style={{ fontSize: 11.5, color: s.violations.length ? C.ash : C.sage }}>
                {s.violations.length ? `${s.violations.length} 次違規` : "乾淨的一天"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              {s.journal ? (
                <>
                  <span style={{ fontSize: 12, color: C.textDim }}>{s.journal.emotion}</span>
                  <span style={{ fontSize: 12, color: C.textFaint }}>
                    信任自己:{s.journal.q5 ? "是" : "否"}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: C.textFaint }}>
                  {s.trades.length > 0 ? `${s.trades.length} 筆交易 · 未寫 Journal` : "未寫 Journal"}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
