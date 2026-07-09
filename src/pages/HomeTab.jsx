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
  const { day, addReward, updateDay, showToast, data, lvl } = ctx;
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const manualTasks = [
    { id: "morning_plan", label: "晨間計畫", exp: 10, statKey: "focus" },
    { id: "workout", label: "健身", exp: 20, statKey: "mindset" },
    { id: "reading", label: "閱讀", exp: 20, statKey: "insight" },
  ];

  const followedToday = day.trades.some((t) => t.followed_checklist);
  const gapDays = journalGapDays(data.history);

  const checklistRows = [
    ...manualTasks.map((t) => ({
      key: t.id,
      label: t.label,
      exp: t.exp,
      statKey: t.statKey,
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
  const characterStats = data.identity.stats;
  const hexAttributes = [
    { key: "focus", label: "專注", value: characterStats.focus },
    { key: "discipline", label: "紀律", value: characterStats.discipline },
    { key: "mindset", label: "心態", value: characterStats.mindset },
    { key: "execution", label: "執行", value: characterStats.execution },
    { key: "observation", label: "觀察", value: characterStats.observation },
    { key: "insight", label: "洞察", value: characterStats.insight },
  ];

  const energy = data.identity.energy;
  const maxEnergy = data.identity.maxEnergy;
  const energyPercent = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));
  const energyState =
    energy > 0
      ? {
          label: "穩定",
          color: "#6B9A7E",
          dim: "#3E5A49",
          glow: "rgba(107,154,126,0.18)",
        }
      : energy === 0
        ? {
            label: "今日額度已用完",
            color: "#D19A42",
            dim: "#6B4E27",
            glow: "rgba(209,154,66,0.18)",
          }
        : {
            label: "過度交易",
            color: "#B9574F",
            dim: "#653735",
            glow: "rgba(185,87,79,0.18)",
          };

  const toggleManual = (id, exp, label, statKey) => {
    if (day[id]) return;
    const rewardToastByTask = {
      morning_plan: "晨間計畫完成｜EXP +10｜專注 +1",
      workout: "健身完成｜EXP +20｜心態 +1",
      reading: "閱讀完成｜EXP +20｜洞察 +1",
    };
    updateDay((d) => ({ ...d, [id]: true }));
    addReward({ exp, label, statKey });
    showToast(rewardToastByTask[id], "reward");
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
                width: "100%",
                maxWidth: 130,
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 34, color: C.text, lineHeight: 1, minWidth: 0, flexShrink: 1 }}>
                Lv.{lvl.level}
              </div>
              <div style={{ textAlign: "right", minWidth: 0, flexShrink: 0 }}>
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
            border: `1px solid rgba(203,163,95,0.18)`,
            background: "rgba(7,8,11,0.62)",
            borderRadius: 13,
            padding: 12,
            boxShadow: "inset 0 1px 0 rgba(203,163,95,0.08)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div style={{ color: C.gold, fontFamily: FONT_DISPLAY, fontSize: 14, letterSpacing: 0.5 }}>
              六角屬性
            </div>
            <div style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 10 }}>
              CORE STATS
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {hexAttributes.map((stat) => (
              <div
                key={stat.key}
                className="flex items-center justify-between gap-2"
                style={{
                  minHeight: 38,
                  border: `1px solid rgba(42,44,54,0.9)`,
                  background: "linear-gradient(180deg, rgba(19,20,25,0.9), rgba(10,11,14,0.86))",
                  borderRadius: 10,
                  padding: "8px 10px",
                }}
              >
                <span style={{ color: C.textDim, fontSize: 12, fontWeight: 700 }}>
                  {stat.label}
                </span>
                <span style={{ color: C.gold, fontFamily: FONT_MONO, fontSize: 13 }}>
                  {stat.value}
                </span>
              </div>
            ))}
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
            onClick={() => row.manual && !row.done && toggleManual(row.key, row.exp, row.label, row.statKey)}
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
                background: energyState.glow,
                border: `1px solid ${energyState.dim}`,
                color: energyState.color,
              }}
            >
              <Target size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div style={{ color: C.textFaint, fontSize: 11, fontFamily: FONT_MONO }}>Energy</div>
                <div style={{ color: energyState.color, fontSize: 10, fontWeight: 800 }}>
                  {energyState.label}
                </div>
              </div>
              <div style={{ color: energyState.color, fontFamily: FONT_DISPLAY, fontSize: 25, marginTop: 2 }}>
                {energy}
                <span style={{ color: C.textFaint, fontSize: 13 }}> /{maxEnergy}</span>
              </div>
              <div
                className="mt-2 h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgba(42,44,54,0.86)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${energyPercent}%`,
                    background: `linear-gradient(90deg, ${energyState.dim}, ${energyState.color})`,
                  }}
                />
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
