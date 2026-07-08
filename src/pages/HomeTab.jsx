import React from "react";
import { AlertTriangle, Check, CircleDot, ScrollText, Shield, Swords } from "lucide-react";
import Card from "../components/Card.jsx";
import SectionLabel from "../components/SectionLabel.jsx";
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
    ...manualTasks.map((t) => ({ key: t.id, label: t.label, exp: t.exp, done: day[t.id], manual: true })),
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
  const characterView = {
    identity: "System Executor",
    rank: rankTitle,
    level: lvl.level,
    totalExp: data.identity.totalExp,
    expInto: lvl.expInto,
    expToNext: lvl.expToNext,
    expPct,
    integrity: data.identity.integrity,
  };

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
      <Card
        style={{
          position: "relative",
          overflow: "hidden",
          borderColor: C.goldDim,
          background:
            "radial-gradient(circle at 18% 8%, rgba(203,163,95,0.2), transparent 34%), linear-gradient(145deg, rgba(8,9,12,0.99) 0%, rgba(17,18,23,0.98) 56%, rgba(31,27,20,0.98) 100%)",
          boxShadow: "0 22px 46px rgba(0,0,0,0.42), inset 0 1px 0 rgba(203,163,95,0.16)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 2,
            background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            opacity: 0.85,
          }}
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className="uppercase"
              style={{ color: C.gold, fontSize: 10.5, letterSpacing: 1.8, fontFamily: FONT_MONO }}
            >
              Training Hall
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.text, marginTop: 7 }}>{greet()}</div>
            <div style={{ color: C.textFaint, fontSize: 12, fontFamily: FONT_MONO, marginTop: 3 }}>{ctx.today}</div>
          </div>

          <div
            className="text-right shrink-0"
            style={{
              border: `1px solid rgba(203,163,95,0.42)`,
              background: "rgba(10,11,14,0.62)",
              borderRadius: 12,
              padding: "8px 10px",
              minWidth: 74,
            }}
          >
            <div style={{ color: C.textFaint, fontSize: 9.5, letterSpacing: 1.1 }} className="uppercase">
              Quest Seal
            </div>
            <div style={{ color: C.gold, fontFamily: FONT_MONO, fontSize: 14, marginTop: 3 }}>
              {completedQuestCount}/{checklistRows.length}
            </div>
            <div style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 9.5, marginTop: 1 }}>{questPct}%</div>
          </div>
        </div>

        <div
          className="mt-5"
          style={{
            display: "grid",
            gridTemplateColumns: "190px minmax(0, 1fr)",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              minHeight: 260,
              borderRadius: 18,
              border: `1px solid rgba(203,163,95,0.44)`,
              background:
                "radial-gradient(circle at 50% 20%, rgba(203,163,95,0.3), transparent 40%), linear-gradient(180deg, rgba(203,163,95,0.08), rgba(10,11,14,0.92))",
              boxShadow: "inset 0 0 34px rgba(0,0,0,0.5), 0 0 34px rgba(203,163,95,0.09)",
              padding: 4,
              overflow: "hidden",
            }}
          >
            <img
              src={executorApprentice}
              alt="System Executor apprentice character"
              style={{
                width: "100%",
                height: 252,
                objectFit: "contain",
                display: "block",
                filter: "drop-shadow(0 16px 22px rgba(0,0,0,0.58))",
              }}
            />
          </div>

          <div className="min-w-0">
            <div
              className="uppercase"
              style={{ fontSize: 10.5, color: C.textFaint, letterSpacing: 1.35, fontFamily: FONT_MONO }}
            >
              System Executor Identity
            </div>

            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: C.gold, lineHeight: 1.08, marginTop: 5 }}>
              {characterView.identity}
            </div>

            <div style={{ color: C.gold, fontSize: 12.5, lineHeight: 1.35, marginTop: 5 }}>
              Lv.{characterView.level} · {characterView.rank}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div
                style={{
                  border: `1px solid rgba(203,163,95,0.24)`,
                  background: "rgba(10,11,14,0.52)",
                  borderRadius: 10,
                  padding: "9px 10px",
                }}
              >
                <div style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 9.5 }}>TOTAL EXP</div>
                <div style={{ color: C.text, fontFamily: FONT_MONO, fontSize: 14, marginTop: 4 }}>
                  {characterView.totalExp}
                </div>
              </div>

              <div
                style={{
                  border: `1px solid rgba(203,163,95,0.24)`,
                  background: "rgba(10,11,14,0.52)",
                  borderRadius: 10,
                  padding: "9px 10px",
                }}
              >
                <div style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 9.5 }}>INTEGRITY</div>
                <div
                  style={{
                    color: characterView.integrity >= 80 ? C.gold : C.ash,
                    fontFamily: FONT_MONO,
                    fontSize: 14,
                    marginTop: 4,
                  }}
                >
                  {characterView.integrity}%
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="flex items-center justify-between gap-2">
                <span style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 10 }}>EXP PROGRESS</span>
                <span style={{ color: C.gold, fontFamily: FONT_MONO, fontSize: 10.5 }}>
                  {characterView.expToNext ? `${characterView.expInto}/${characterView.expToNext}` : "MAX"}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "rgba(42,44,54,0.86)",
                  borderRadius: 999,
                  marginTop: 6,
                  overflow: "hidden",
                  border: `1px solid rgba(203,163,95,0.12)`,
                }}
              >
                <div
                  style={{
                    width: `${characterView.expPct}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${C.goldDim}, ${C.gold})`,
                  }}
                />
              </div>
            </div>

            <div
              className="mt-4"
              style={{
                border: `1px solid rgba(203,163,95,0.26)`,
                background: "rgba(203,163,95,0.07)",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div className="flex items-center gap-2" style={{ color: C.gold, fontSize: 11, letterSpacing: 1.1 }}>
                <Swords size={14} />
                <span className="uppercase" style={{ fontFamily: FONT_MONO }}>
                  Today's Mission
                </span>
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.text, marginTop: 7 }}>執行策略。</div>
              <div style={{ fontSize: 11.5, color: C.textFaint, marginTop: 5 }}>
                今天不需要證明自己，只需要回到系統。
              </div>
            </div>
          </div>
        </div>
      </Card>

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
          <div>
            <div style={{ color: C.gold, fontSize: 10, fontFamily: FONT_MONO, marginBottom: 3, letterSpacing: 1 }}>
              CULTIVATION INSCRIPTION
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13.5, color: C.textDim, lineHeight: 1.5 }}>
              {quote}
            </div>
          </div>
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

      <SectionLabel>Training Quest</SectionLabel>
      <Card style={{ borderColor: C.hair, background: "linear-gradient(180deg, #131419, #101116)" }}>
        {checklistRows.map((row, i) => (
          <div
            key={row.key}
            onClick={() => row.manual && !row.done && toggleManual(row.key, row.exp, row.label)}
            className="flex items-center justify-between gap-3"
            style={{
              borderTop: i === 0 ? "none" : `1px solid rgba(42,44,54,0.82)`,
              cursor: row.manual && !row.done ? "pointer" : "default",
              padding: "11px 0",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: row.done ? "rgba(62,90,73,0.58)" : row.manual ? "rgba(203,163,95,0.08)" : "rgba(27,29,36,0.72)",
                  border: `1px solid ${row.done ? C.sage : row.manual ? C.goldDim : C.hair}`,
                }}
              >
                {row.done ? (
                  <Check size={14} color={C.sage} strokeWidth={3} />
                ) : row.manual ? (
                  <CircleDot size={13} color={C.goldDim} />
                ) : (
                  <Shield size={13} color={C.textFaint} />
                )}
              </div>
              <div className="min-w-0">
                <div
                  style={{
                    fontSize: 13.5,
                    color: row.done ? C.textDim : C.text,
                    textDecoration: row.done ? "line-through" : "none",
                    textDecorationColor: C.textFaint,
                    lineHeight: 1.25,
                  }}
                >
                  {row.label}
                </div>
                <div style={{ fontSize: 10.5, color: row.done ? C.sage : C.textFaint, marginTop: 3 }}>
                  {row.done ? "Quest complete" : row.manual ? "Selectable training drill" : "Complete through Practice record"}
                </div>
              </div>
            </div>
            {row.exp !== null && (
              <span
                className="shrink-0"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11.5,
                  color: row.done ? C.sage : C.gold,
                  border: `1px solid ${row.done ? C.sageDim : C.goldDim}`,
                  background: row.done ? "rgba(62,90,73,0.2)" : "rgba(203,163,95,0.07)",
                  borderRadius: 999,
                  padding: "3px 7px",
                }}
              >
                +{row.exp}
              </span>
            )}
          </div>
        ))}
      </Card>
      <div style={{ fontSize: 11, color: C.textFaint }} className="mt-3 text-center">
        前往「修練」完成 Checklist、記錄交易，或標記成功等待
      </div>
    </div>
  );
}
