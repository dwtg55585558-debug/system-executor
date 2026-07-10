import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { C, FONT_DISPLAY, FONT_MONO } from "../styles/theme.js";
import { todayStr } from "../utils/helpers.js";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateKey(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isTrainingComplete(session) {
  return (
    session.morning_plan &&
    session.checklist_pass &&
    !!session.journal &&
    (session.successful_wait || session.trades.some((trade) => trade.followed_checklist))
  );
}

function calendarCells(viewDate) {
  const year = viewDate.getFullYear();
  const monthIndex = viewDate.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: firstDay.getDay() }, () => null);

  for (let day = 1; day <= totalDays; day++) {
    cells.push({
      day,
      date: dateKey(year, monthIndex, day),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default function TrainingCalendar({ history, onSelect }) {
  const today = todayStr();
  const [viewDate, setViewDate] = useState(() => new Date());
  const cells = calendarCells(viewDate);
  const label = `${viewDate.getFullYear()} 年 ${viewDate.getMonth() + 1} 月`;

  const shiftMonth = (offset) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          aria-label="上一個月"
          className="flex items-center justify-center"
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            border: `1px solid ${C.hair}`,
            background: C.raised,
            color: C.text,
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontSize: 17 }}>{label}</div>

        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="下一個月"
          className="flex items-center justify-center"
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            border: `1px solid ${C.hair}`,
            background: C.raised,
            color: C.text,
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map((day) => (
          <div key={day} style={{ color: C.textDim, fontSize: 10, textAlign: "center", fontFamily: FONT_MONO }}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${monthKey(viewDate)}-${index}`} style={{ aspectRatio: "1 / 1" }} />;
          }

          const session = history[cell.date];
          const isFuture = cell.date > today;
          const hasRealHistory = !!session;
          const canReview = hasRealHistory && !isFuture;
          const hasViolation = !!session && session.violations.length > 0;
          const complete = !!session && !hasViolation && isTrainingComplete(session);
          const isToday = cell.date === today;
          const hasVisibleState = hasViolation || complete || canReview || isToday;
          const dateTextColor = hasVisibleState && !isFuture ? C.text : C.textFaint;

          let background = C.raised;
          let border = `1px solid ${C.hair}`;
          if (hasViolation) {
            background = C.ashDim;
            border = `1px solid ${C.ash}`;
          } else if (complete) {
            background = C.sageDim;
            border = `1px solid ${C.sage}`;
          } else if (!session || isFuture) {
            background = C.void;
          }
          if (isToday) {
            border = `1px solid ${C.text}`;
          }

          return (
            <button
              key={cell.date}
              type="button"
              title={cell.date}
              disabled={!canReview}
              onClick={() => {
                if (canReview && onSelect) onSelect(cell.date);
              }}
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 6,
                border,
                background,
                color: dateTextColor,
                fontSize: 12,
                lineHeight: 1,
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canReview ? "pointer" : "default",
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
