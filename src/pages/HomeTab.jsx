import React from "react";
import { Sparkles, Check } from "lucide-react";
import Card from "../components/Card.jsx";
import SectionLabel from "../components/SectionLabel.jsx";
import { C, FONT_DISPLAY, FONT_MONO } from "../styles/theme.js";
import { QUOTES, JOURNAL_GAP_WARNING } from "../utils/constants.js";
import { journalGapDays } from "../utils/helpers.js";

export default function HomeTab({ ctx }) {
  const { day, addExp, updateDay, showToast, data } = ctx;
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const manualTasks = [
    { id: "morning_plan", label: "晨間計畫", exp: 10 },
    { id: "workout", label: "健身", exp: 20 },
    { id: "reading", label: "閱讀", exp: 20 },
  ];

  const followedToday = day.trades.some((t) => t.followed_checklist);
  const gapDays = journalGapDays(data.history);

  const checklistRows = [
    ...manualTasks.map((t) => ({ key: t.id, label: t.label, exp: t.exp, done: day[t.id], manual: true })),
    { key: "checklist_pass", label: "交易前 Checklist", exp: 20, done: day.checklist_pass, manual: false },
    { key: "followed", label: "有符合策略才進場", exp: 40, done: followedToday, manual: false },
    { key: "wait", label: "沒有機會、成功等待", exp: 50, done: day.successful_wait, manual: false },
    { key: "stoploss", label: "完整停損", exp: null, done: day.trades.some((t) => t.stop_loss_set), manual: false },
    { key: "journal", label: "完成 Decision Journal", exp: 20, done: !!day.journal, manual: false },
  ];

  const toggleManual = (id, exp, label) => {
    if (day[id]) return;
    updateDay((d) => ({ ...d, [id]: true }));
    addExp(exp, label);
    showToast(`+${exp} EXP · ${label}`, "reward");
  };

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning.";
    if (h < 18) return "Good Afternoon.";
    return "Good Evening.";
  };

  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.text }}>{greet()}</div>
      <div style={{ color: C.textFaint, fontSize: 12, fontFamily: FONT_MONO, marginTop: 2 }}>{ctx.today}</div>

      <Card className="mt-4" style={{ borderColor: C.violetDim, background: "linear-gradient(135deg, #16151f, #131419)" }}>
        <div style={{ color: C.textFaint, fontSize: 11, letterSpacing: 1.5 }} className="uppercase mb-2">
          Today's Mission
        </div>
        <div style={{ fontSize: 12, color: C.textFaint }}>今天身份</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.gold, marginBottom: 8 }}>System Executor</div>
        <div style={{ fontSize: 12, color: C.textFaint }}>今天唯一工作</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: C.text }}>執行策略。</div>
        <div style={{ fontSize: 11.5, color: C.textFaint, marginTop: 10 }}>今天不需要證明自己。</div>
      </Card>

      <Card className="mt-3" style={{ borderColor: C.hair }}>
        <div className="flex items-start gap-2">
          <Sparkles size={15} color={C.violet} className="mt-0.5 shrink-0" />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13.5, color: C.textDim, lineHeight: 1.5 }}>{quote}</div>
        </div>
      </Card>

      {gapDays >= JOURNAL_GAP_WARNING && !day.journal && (
        <Card className="mt-3" style={{ borderColor: C.ashDim }}>
          <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>
            你已經 {gapDays} 天沒有誠實面對自己了。今天要不要花 60 秒完成 Journal?
          </div>
        </Card>
      )}

      <SectionLabel>Daily Quest</SectionLabel>
      <Card className="divide-y" style={{ borderColor: C.hair }}>
        {checklistRows.map((row, i) => (
          <div
            key={row.key}
            onClick={() => row.manual && toggleManual(row.key, row.exp, row.label)}
            className="flex items-center justify-between py-2.5"
            style={{
              borderTop: i === 0 ? "none" : `1px solid ${C.hair}`,
              cursor: row.manual && !row.done ? "pointer" : "default",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded-md shrink-0"
                style={{
                  width: 19,
                  height: 19,
                  background: row.done ? C.sageDim : "transparent",
                  border: `1.5px solid ${row.done ? C.sage : C.textFaint}`,
                }}
              >
                {row.done && <Check size={12} color={C.sage} strokeWidth={3} />}
              </div>
              <span
                style={{
                  fontSize: 13.5,
                  color: row.done ? C.textDim : C.text,
                  textDecoration: row.done ? "line-through" : "none",
                  textDecorationColor: C.textFaint,
                }}
              >
                {row.label}
              </span>
            </div>
            {row.exp !== null && (
              <span style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.textFaint }}>+{row.exp}</span>
            )}
          </div>
        ))}
      </Card>
      <div style={{ fontSize: 11, color: C.textFaint }} className="mt-3 text-center">
        前往「修練」完成 Checklist、記錄交易或成功等待
      </div>
    </div>
  );
}
