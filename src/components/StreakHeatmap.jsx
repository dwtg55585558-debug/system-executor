import React from "react";
import { C } from "../styles/theme.js";
import { todayStr } from "../utils/helpers.js";

export default function StreakHeatmap({ history, onSelect }) {
  const days = [];
  const now = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(todayStr(d));
  }
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => {
        const s = history[d];
        const label = d === todayStr(now) ? "今天" : `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
        let bg = C.raised;
        if (s) {
          if (s.violations.length > 0) bg = C.ashDim;
          else if (s.journal || s.successful_wait || s.trades.length > 0) bg = C.sageDim;
          else bg = C.hair;
        }
        return (
          <button
            key={d}
            title={d}
            disabled={!s}
            onClick={() => s && onSelect && onSelect(d)}
            style={{ width: "100%", paddingBottom: "100%", position: "relative" }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: bg,
                borderRadius: 4,
                border: `1px solid ${C.hair}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: s ? C.text : C.textFaint,
                fontSize: 9,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
