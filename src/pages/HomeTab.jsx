import React from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  CircleDot,
  Dumbbell,
  ScrollText,
  Shield,
  Target,
} from "lucide-react";
import Card from "../components/Card.jsx";
import { C, FONT_DISPLAY, FONT_MONO } from "../styles/theme.js";
import { QUOTES, JOURNAL_GAP_WARNING } from "../utils/constants.js";
import { journalGapDays } from "../utils/helpers.js";
import { titleForLevel } from "../utils/levels.js";
import executorApprentice from "../assets/characters/executor-apprentice.png";

export default function HomeTab({ ctx }) {
  const { day, addExp, updateDay, showToast, data, lvl } = ctx;
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const manualTasks = [
    { id: "morning_plan", label: "晨間計畫", exp: 10 },
    { id: "workout", label: "健身", exp: 20 },
    { id: "reading", label: "閱讀", exp: 20 },
  ];

  const followedToday = day.trades.some((t) => t.followed_checklist);
  const gapDays = journalGapDays(data.history);

  const checklistRows = [
    ...manualTasks.map((t) => ({
      key: t.id,
      label: t.label,
      exp: t.exp,
      done: day[t.id],
      manual: true,
    })),
    { key: "checklist_pass", label: "交易前 Checklist", exp: 20, done: day.checklist_pass, manual: false },
    { key: "followed", label: "有符合策略才進場", exp: 40, done: followedToday, manual: false },
    { key: "wait", label: "沒有機會、成功等待", exp: 50, done: day.successful_wait, manual: false },
    { key: "stoploss", label: "完整停損", exp: null, done: day.trades.some((t) => t.stop_loss_set), manual: false },
    { key: "journal", label: "完成 Decision Journal", exp: 20, done: !!day.journal, manual: false },
  ];

  const completedQuestCount = checklistRows.filter((row) => row.done).length;
  const questPct = Math.round((completedQuestCount / checklistRows.length) * 100);
  const expPct = lvl.expToNext ? Math.round((lvl.expInto / lvl.expToNext) * 100) : 100;
  const rankTitle = titleForLevel(lvl.level);

  const energy = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        55 +
          (day.morning_plan ? 10 : 0) +
          (day.checklist_pass ? 10 : 0) +
          (day.successful_wait ? 10 : 0) +
          (day.journal ? 15 : 0) -
          day.violations.length * 12
      )
    )
  );

  const toggleManual = (id, exp, label) => {
    if (day[id]) return;
    updateDay((d) => ({ ...d, [id]: true }));
    addExp(exp, label);
    showToast(`+${exp} EXP · ${label}`, "reward");
  };

  const questIcon = (row) => {
    if (row.key === "workout") return <Dumbbell size={17} />;
    if (row.key === "reading") return <BookOpen size={17} />;
    if (row.key === "journal") return <ScrollText size={17} />;
    if (row.key === "followed" || row.key === "checklist_pass") return <Target size={17} />;
    return <CircleDot size={17} />;
  };

  return (
    <div>
      <Card
        style={{
          position: "relative",
          overflow: "hidden",
          borderColor: C.goldDim,
          background:
            "radial-gradient(circle at 18% 4%, rgba(203,163,95,0.22), transparent 32%), linear-gradient(145deg, rgba(7,8,11,0.99), rgba(15,16,21,0.98) 55%, rgba(25,22,17,0.98))",
          boxShadow: "0 22px 46px rgba(0,0,0,0.42), inset 0 1px 0 rgba(203,163,95,0.16)",
          padding: 16,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontSize: 17 }}>
            主頁 <span style={{ color: C.textFaint, fontSize: 12 }}>(Home)</span>
          </div>
          <div
            style={{
              color: C.gold,
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: 1,
              border: `1px solid rgba(203,163,95,0.34)`,
              borderRadius: 999,
              padding: "4px 8px",
              background: "rgba(203,163,95,0.06)",
            }}
          >
            {ctx.today}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: `1px solid rgba(203,163,95,0.36)`,
              background:
                "radial-gradient(circle at 50% 42%, rgba(203,163,95,0.3), rgba(10,11,14,0.92) 56%, rgba(4,5,7,1))",
              boxShadow: "inset 0 0 28px rgba(0,0,0,0.48), 0 0 28px rgba(203,163,95,0.08)",
              overflow: "hidden",
            }}
          >
            <img
              src={executorApprentice}
              alt="System Executor apprentice character"
              style={{
                width: 136,
                height: 136,
                objectFit: "cover",
                objectPosition: "center 32%",
                display: "block",
                filter: "drop-shadow(0 14px 16px rgba(0,0,0,0.55))",
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, color: C.text, lineHeight: 1 }}>
                Lv.{lvl.level}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: C.gold, fontSize: 12, fontWeight: 700 }}>{rankTitle}</div>
                <div style={{ color: C.textFaint, fontSize: 10, marginTop: 1 }}>System Executor</div>
              </div>
            </div>

            <div
              style={{
                height: 8,
                background: "rgba(42,44,54,0.86)",
                borderRadius: 999,
                marginTop: 12,
                overflow: "hidden",
                border: `1px solid rgba(203,163,95,0.12)`,
              }}
            >
              <div
                style={{
                  width: `${expPct}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${C.goldDim}, ${C.gold})`,
                }}
              />
            </div>

            <div className="flex justify-between mt-2" style={{ fontFamily: FONT_MONO, fontSize: 11 }}>
              <span style={{ color: C.textFaint }}>EXP</span>
              <span style={{ color: C.textDim }}>
                {lvl.expToNext ? `${lvl.expInto} / ${lvl.expToNext} XP` : "MAX"}
              </span>
            </div>
          </div>
        </div>

        <div
          className="mt-4"
          style={{
            border: `1px solid rgba(203,163,95,0.16)`,
            background: "rgba(10,11,14,0.58)",
            borderRadius: 13,
            padding: "12px 13px",
            textAlign: "center",
            color: C.textDim,
            fontFamily: FONT_DISPLAY,
            fontSize: 15,
            letterSpacing: 0.5,
          }}
        >
          「紀律，是自由之門。」
        </div>
      </Card>

      {gapDays >= JOURNAL_GAP_WARNING && !day.journal && (
        <Card className="mt-3" style={{ borderColor: C.ashDim, background: "rgba(90,54,52,0.22)" }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} color={C.ash} className="mt-0.5 shrink-0" />
            <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>
              你已經 {gapDays} 天沒有誠實面對自己了。今天要不要花 60 秒完成 Journal?
            </div>
          </div>
        </Card>
      )}

      <div
        className="mt-5 mb-2"
        style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.text, letterSpacing: 0.5 }}
      >
        今日任務
      </div>

      <Card style={{ borderColor: C.hair, background: "linear-gradient(180deg, #131419, #101116)", padding: 12 }}>
        {checklistRows.slice(0, 5).map((row, i) => (
          <div
            key={row.key}
            onClick={() => row.manual && !row.done && toggleManual(row.key, row.exp, row.label)}
            className="flex items-center justify-between gap-3"
            style={{
              borderTop: i === 0 ? "none" : `1px solid rgba(42,44,54,0.78)`,
              cursor: row.manual && !row.done ? "pointer" : "default",
              padding: "12px 0",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: row.done ? "rgba(62,90,73,0.36)" : "rgba(203,163,95,0.08)",
                  border: `1px solid ${row.done ? C.sage : C.goldDim}`,
                  color: row.done ? C.sage : C.gold,
                }}
              >
                {questIcon(row)}
              </div>
              <div className="min-w-0">
                <div style={{ color: row.done ? C.textDim : C.text, fontSize: 14, fontWeight: 700 }}>
                  {row.label}
                </div>
                <div style={{ color: row.done ? C.sage : C.gold, fontFamily: FONT_MONO, fontSize: 11, marginTop: 3 }}>
                  {row.exp !== null ? `+${row.exp} EXP` : "SYSTEM RECORD"}
                </div>
              </div>
            </div>

            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: row.done ? "rgba(62,90,73,0.72)" : "rgba(10,11,14,0.4)",
                border: `1px solid ${row.done ? C.sage : C.hair}`,
                color: row.done ? C.text : C.textFaint,
                fontFamily: FONT_MONO,
                fontSize: 12,
              }}
            >
              {row.done ? <Check size={18} strokeWidth={3} /> : row.manual ? "" : "0/1"}
            </div>
          </div>
        ))}
      </Card>

      <div
        className="mt-5 mb-2"
        style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.text, letterSpacing: 0.5 }}
      >
        今日狀態
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card style={{ borderColor: C.hair, background: "rgba(19,20,25,0.86)" }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(203,163,95,0.08)",
                border: `1px solid ${C.goldDim}`,
                color: C.gold,
              }}
            >
              <Shield size={19} />
            </div>
            <div>
              <div style={{ color: C.textFaint, fontSize: 11, fontFamily: FONT_MONO }}>Integrity</div>
              <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontSize: 25, marginTop: 2 }}>
                {data.identity.integrity}
                <span style={{ color: C.textFaint, fontSize: 13 }}> /100</span>
              </div>
            </div>
          </div>
        </Card>

        <Card style={{ borderColor: C.hair, background: "rgba(19,20,25,0.86)" }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(203,163,95,0.08)",
                border: `1px solid ${C.goldDim}`,
                color: C.gold,
              }}
            >
              <Target size={19} />
            </div>
            <div>
              <div style={{ color: C.textFaint, fontSize: 11, fontFamily: FONT_MONO }}>Energy</div>
              <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontSize: 25, marginTop: 2 }}>
                {energy}
                <span style={{ color: C.textFaint, fontSize: 13 }}> /100</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card
        className="mt-3"
        style={{
          borderColor: C.goldDim,
          background: "linear-gradient(135deg, rgba(19,20,25,0.96), rgba(27,29,36,0.72))",
          padding: 13,
        }}
      >
        <div className="flex items-start gap-2">
          <ScrollText size={15} color={C.gold} className="mt-0.5 shrink-0" />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13.5, color: C.textDim, lineHeight: 1.5 }}>
            {quote}
          </div>
        </div>
      </Card>
    </div>
  );
}
