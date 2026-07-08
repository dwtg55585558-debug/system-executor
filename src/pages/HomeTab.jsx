import React from "react";
import { AlertTriangle, Check, CircleDot, ScrollText, Shield, Swords } from "lucide-react";
import Card from "../components/Card.jsx";
import SectionLabel from "../components/SectionLabel.jsx";
import { C, FONT_DISPLAY, FONT_MONO } from "../styles/theme.js";
import { QUOTES, JOURNAL_GAP_WARNING } from "../utils/constants.js";
import { journalGapDays } from "../utils/helpers.js";
import { titleForLevel } from "../utils/levels.js";

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
            "linear-gradient(145deg, rgba(10,11,14,0.98) 0%, rgba(19,20,25,0.96) 54%, rgba(30,27,22,0.98) 100%)",
          boxShadow: "0 18px 38px rgba(0,0,0,0.34), inset 0 1px 0 rgba(203,163,95,0.14)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 2,
            background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            opacity: 0.75,
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
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 25, color: C.text, marginTop: 7 }}>{greet()}</div>
            <div style={{ color: C.textFaint, fontSize: 12, fontFamily: FONT_MONO, marginTop: 3 }}>{ctx.today}</div>
          </div>

          <div
            className="text-right shrink-0"
            style={{
              border: `1px solid rgba(203,163,95,0.38)`,
              background: "rgba(10,11,14,0.58)",
              borderRadius: 10,
              padding: "8px 10px",
              minWidth: 72,
            }}
          >
            <div style={{ color: C.textFaint, fontSize: 9.5, letterSpacing: 1.1 }} className="uppercase">
              Quest Seal
            </div>
            <div style={{ color: C.gold, fontFamily: FONT_MONO, fontSize: 13, marginTop: 3 }}>
              {completedQuestCount}/{checklistRows.length}
            </div>
            <div style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 9.5, marginTop: 1 }}>{questPct}%</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: `1px solid rgba(203,163,95,0.2)`,
          }}
        >
          <div style={{ fontSize: 11, color: C.textFaint, letterSpacing: 1.2 }} className="uppercase">
            System Executor Identity
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: C.gold, lineHeight: 1.12, marginTop: 4 }}>
            System Executor
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div style={{ border: `1px solid ${C.hair}`, background: "rgba(27,29,36,0.54)", borderRadius: 10, padding: 9 }}>
              <div style={{ color: C.textFaint, fontSize: 9.5, fontFamily: FONT_MONO }}>RANK</div>
              <div style={{ color: C.text, fontSize: 12, marginTop: 4, lineHeight: 1.25 }}>Lv.{lvl.level}</div>
              <div style={{ color: C.gold, fontSize: 10.5, marginTop: 1, lineHeight: 1.25 }}>{rankTitle}</div>
            </div>
            <div style={{ border: `1px solid ${C.hair}`, background: "rgba(27,29,36,0.54)", borderRadius: 10, padding: 9 }}>
              <div style={{ color: C.textFaint, fontSize: 9.5, fontFamily: FONT_MONO }}>EXP</div>
              <div style={{ color: C.text, fontFamily: FONT_MONO, fontSize: 12, marginTop: 4 }}>{expPct}%</div>
              <div
                style={{
                  height: 3,
                  background: C.hair,
                  borderRadius: 999,
                  marginTop: 7,
                  overflow: "hidden",
                }}
              >
                <div style={{ width: `${expPct}%`, height: "100%", background: C.gold }} />
              </div>
            </div>
            <div style={{ border: `1px solid ${C.hair}`, background: "rgba(27,29,36,0.54)", borderRadius: 10, padding: 9 }}>
              <div style={{ color: C.textFaint, fontSize: 9.5, fontFamily: FONT_MONO }}>INTEGRITY</div>
              <div style={{ color: data.identity.integrity >= 80 ? C.gold : C.ash, fontFamily: FONT_MONO, fontSize: 12, marginTop: 4 }}>
                {data.identity.integrity}%
              </div>
              <div style={{ color: C.textFaint, fontSize: 10, marginTop: 2 }}>Discipline</div>
            </div>
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
