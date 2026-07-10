import React, { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  Dumbbell,
  Pencil,
  ScrollText,
} from "lucide-react";
import Card from "../components/Card.jsx";
import CultivatorNameModal from "../components/CultivatorNameModal.jsx";
import { C, FONT_DISPLAY, FONT_MONO } from "../styles/theme.js";
import { QUOTES, JOURNAL_GAP_WARNING } from "../utils/constants.js";
import { journalGapDays } from "../utils/helpers.js";
import { titleForLevel } from "../utils/levels.js";
import executorApprentice from "../assets/characters/executor-apprentice.png";

export default function HomeTab({ ctx }) {
  const {
    day,
    addReward,
    updateDay,
    showToast,
    setTab,
    updateIdentityName,
    data,
    lvl,
    resetTodayToBaseline,
    resetAllData,
  } = ctx;
  const [editingName, setEditingName] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const stopLossMode = !!day.stopLossMode;
  const gapDays = journalGapDays(data.history);
  const tradeTrainingDone = !!(day.strategy_trade || day.successful_wait);
  const coreStages = [
    { key: "morning", label: "晨間校準", done: !!day.morning_plan },
    { key: "checklist", label: "交易前準備", done: !!day.checklist_pass },
    { key: "training", label: "交易修煉", done: tradeTrainingDone },
    { key: "journal", label: "今日復盤", done: !!day.journal },
  ];
  const completedCoreCount = coreStages.filter((stage) => stage.done).length;
  const coreProgress = (completedCoreCount / coreStages.length) * 100;
  const nextIncompleteIndex = coreStages.findIndex((stage) => !stage.done);

  let nextAction;
  if (!day.morning_plan) {
    nextAction = { title: "開始晨間校準", description: "先設定今日交易邊界。", tab: "practice" };
  } else if (!day.checklist_pass) {
    nextAction = { title: "完成交易前 Checklist", description: "確認條件後再進入交易。", tab: "practice" };
  } else if (!tradeTrainingDone) {
    nextAction = {
      title: "完成今日交易修煉",
      description: "記錄符合策略交易，或在沒有機會時完成成功等待。",
      tab: "practice",
    };
  } else if (!day.journal) {
    nextAction = { title: "完成今日復盤", description: "用 Decision Journal 結束今日修煉。", tab: "journal" };
  } else {
    nextAction = { title: "今日修煉已完成", description: "今天的交易修煉閉環已完成。", complete: true };
  }

  const expPct = lvl.expToNext ? Math.round((lvl.expInto / lvl.expToNext) * 100) : 100;
  const rankTitle = titleForLevel(lvl.level);
  const cultivatorName = data.identity.name?.trim() || "執行者";
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
      ? { label: "穩定", color: "#6B9A7E", dim: "#3E5A49" }
      : energy === 0
        ? { label: "今日額度已用完", color: "#D19A42", dim: "#6B4E27" }
        : { label: "過度交易", color: "#B9574F", dim: "#653735" };

  const toggleManual = (id, exp, label, statKey) => {
    if (day[id]) return;
    const rewardToastByTask = {
      workout: "健身完成｜EXP +20｜心態 +1",
      reading: "閱讀完成｜EXP +20｜洞察 +1",
    };
    updateDay((d) => ({ ...d, [id]: true }));
    addReward({ exp, label, statKey });
    showToast(rewardToastByTask[id], "reward");
  };

  const enterStopLossMode = () => {
    if (stopLossMode) return;
    updateDay((d) => ({ ...d, stopLossMode: true }));
    showToast("已進入止血模式｜今日只允許復盤與停止", "info");
  };

  const confirmResetToday = () => {
    const confirmed = window.confirm(
      "確定要重置今日嗎？這會把今日任務、Energy、EXP、屬性成長等恢復到今日開始時的狀態，但不會重置角色名稱或歷史資料。"
    );
    if (!confirmed) return;
    resetTodayToBaseline();
  };

  const confirmResetAll = () => {
    const confirmed = window.confirm(
      "確定要重置整個角色嗎？這會清除角色名稱、EXP、等級、屬性、Energy、任務、交易紀錄與日誌，並回到首次建立身份畫面。"
    );
    if (!confirmed) return;
    resetAllData();
  };

  const sectionTitleStyle = {
    fontFamily: FONT_DISPLAY,
    fontSize: 17,
    color: C.text,
    letterSpacing: 0.5,
  };

  return (
    <div>
      <Card
        style={{
          position: "relative",
          overflow: "hidden",
          borderColor: C.goldDim,
          background:
            "radial-gradient(circle at 18% 4%, rgba(203,163,95,0.2), transparent 30%), linear-gradient(145deg, rgba(7,8,11,0.99), rgba(15,16,21,0.98) 58%, rgba(25,22,17,0.98))",
          boxShadow: "0 18px 38px rgba(0,0,0,0.4), inset 0 1px 0 rgba(203,163,95,0.16)",
          padding: 14,
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div style={{ color: C.gold, fontFamily: FONT_DISPLAY, fontSize: 28, lineHeight: 1 }}>
            Lv.{lvl.level}
          </div>
          <div className="text-right">
            <div style={{ color: C.gold, fontSize: 12, fontWeight: 700 }}>{rankTitle}</div>
            <div style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 10, marginTop: 2 }}>{ctx.today}</div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 92,
              height: 92,
              borderRadius: "50%",
              border: "1px solid rgba(203,163,95,0.36)",
              background: "radial-gradient(circle at 50% 42%, rgba(203,163,95,0.3), rgba(10,11,14,0.92) 56%, #040507)",
              overflow: "hidden",
            }}
          >
            <img src={executorApprentice} alt="修煉者角色" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="min-w-0 flex-1">
                <div style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 10 }}>修煉者名稱</div>
                <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontSize: 19, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {cultivatorName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingName(true)}
                aria-label="更改名稱"
                className="shrink-0 flex items-center justify-center"
                style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(203,163,95,0.26)", background: "rgba(203,163,95,0.08)", color: C.gold }}
              >
                <Pencil size={14} />
              </button>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: "rgba(42,44,54,0.86)" }}>
              <div style={{ width: `${expPct}%`, height: "100%", background: `linear-gradient(90deg, ${C.goldDim}, ${C.gold})` }} />
            </div>
            <div className="mt-1.5 flex justify-between gap-2" style={{ fontFamily: FONT_MONO, fontSize: 10 }}>
              <span style={{ color: C.gold }}>{lvl.expToNext ? `${lvl.expInto} / ${lvl.expToNext} EXP` : "MAX EXP"}</span>
              <span style={{ color: C.textFaint }}>{lvl.expToNext ? `還差 ${Math.max(0, lvl.expToNext - lvl.expInto)} EXP` : "已達最高等級"}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-3" style={{ borderColor: nextAction.complete ? C.sage : C.goldDim, background: "linear-gradient(135deg, rgba(19,20,25,0.96), rgba(27,29,36,0.78))" }}>
        <div style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1 }}>下一步行動</div>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div style={{ color: nextAction.complete ? C.sage : C.text, fontFamily: FONT_DISPLAY, fontSize: 18 }}>{nextAction.title}</div>
            <div style={{ color: C.textDim, fontSize: 12.5, lineHeight: 1.5, marginTop: 4 }}>{nextAction.description}</div>
          </div>
          {nextAction.complete ? (
            <div className="shrink-0 flex items-center gap-1.5" style={{ color: C.sage, fontSize: 12, fontWeight: 700 }}>
              <Check size={16} /> 完成
            </div>
          ) : (
            <button type="button" onClick={() => setTab(nextAction.tab)} className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium" style={{ background: C.goldDim, color: C.text }}>
              前往
            </button>
          )}
        </div>
      </Card>

      {gapDays >= JOURNAL_GAP_WARNING && !day.journal && (
        <Card className="mt-3" style={{ borderColor: C.ashDim, background: "rgba(90,54,52,0.22)" }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={15} color={C.ash} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1" style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>
              已有 {gapDays} 天未完成 Decision Journal。<br />用 60 秒補上今天的復盤。
            </div>
            <button type="button" onClick={() => setTab("journal")} className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium" style={{ border: `1px solid ${C.goldDim}`, color: C.gold, background: "rgba(203,163,95,0.06)" }}>
              前往日誌
            </button>
          </div>
        </Card>
      )}

      <div className="mt-5 mb-2 flex items-end justify-between gap-3">
        <div style={sectionTitleStyle}>今日修煉</div>
        <div style={{ color: C.gold, fontFamily: FONT_MONO, fontSize: 12 }}>{completedCoreCount} / 4</div>
      </div>
      <Card style={{ borderColor: C.hair, background: "linear-gradient(180deg, #131419, #101116)", padding: 12 }}>
        <div className="mb-2 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(42,44,54,0.86)" }}>
          <div className="h-full rounded-full" style={{ width: `${coreProgress}%`, background: C.sage }} />
        </div>
        {coreStages.map((stage, index) => {
          const status = stage.done ? "已完成" : index === nextIncompleteIndex ? "進行中" : "尚未完成";
          return (
            <div key={stage.key} className="flex items-center justify-between gap-3" style={{ borderTop: index === 0 ? "none" : `1px solid ${C.hair}`, padding: "11px 2px" }}>
              <div style={{ color: stage.done ? C.textDim : C.text, fontSize: 13.5, fontWeight: 700 }}>{stage.label}</div>
              <div className="flex items-center gap-2" style={{ color: stage.done ? C.sage : C.textFaint, fontSize: 11.5 }}>
                {status}
                <span className="flex items-center justify-center" style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${stage.done ? C.sage : C.hair}`, background: stage.done ? "rgba(62,90,73,0.45)" : "transparent" }}>
                  {stage.done && <Check size={13} strokeWidth={3} />}
                </span>
              </div>
            </div>
          );
        })}
      </Card>

      <div className="mt-5 mb-2" style={sectionTitleStyle}>附加修煉</div>
      <Card style={{ borderColor: C.hair, background: "rgba(19,20,25,0.86)", padding: 12 }}>
        {[
          { id: "workout", label: "健身", exp: 20, statKey: "mindset", icon: Dumbbell },
          { id: "reading", label: "閱讀", exp: 20, statKey: "insight", icon: BookOpen },
        ].map((task, index) => {
          const Icon = task.icon;
          const done = !!day[task.id];
          return (
            <button key={task.id} type="button" disabled={done} onClick={() => toggleManual(task.id, task.exp, task.label, task.statKey)} className="flex w-full items-center justify-between gap-3 text-left" style={{ borderTop: index === 0 ? "none" : `1px solid ${C.hair}`, padding: "12px 2px", cursor: done ? "default" : "pointer" }}>
              <span className="flex items-center gap-3" style={{ color: done ? C.textDim : C.text, fontSize: 13.5, fontWeight: 700 }}><Icon size={16} color={done ? C.sage : C.textDim} />{task.label}</span>
              <span className="flex items-center gap-1.5" style={{ color: done ? C.sage : C.textFaint, fontSize: 11.5 }}>{done ? "已完成" : "點擊完成"}{done && <Check size={14} />}</span>
            </button>
          );
        })}
      </Card>

      <div className="mt-5 mb-2" style={sectionTitleStyle}>今日交易資源</div>
      <Card style={{ borderColor: stopLossMode ? "rgba(185,87,79,0.72)" : C.hair, background: stopLossMode ? "linear-gradient(135deg, rgba(90,54,52,0.3), rgba(19,20,25,0.9))" : "rgba(19,20,25,0.86)" }}>
        <div className="flex items-center justify-between gap-3">
          <div style={{ color: stopLossMode ? "#B9574F" : C.text, fontFamily: FONT_DISPLAY, fontSize: 17 }}>{stopLossMode ? "止血模式中" : "今日交易資源"}</div>
          <div style={{ color: energyState.color, fontSize: 11, fontWeight: 800 }}>{energyState.label}</div>
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div style={{ color: energyState.color, fontFamily: FONT_DISPLAY, fontSize: 24 }}>Energy {energy} <span style={{ color: C.textFaint, fontSize: 13 }}>/ {maxEnergy}</span></div>
          <div style={{ color: C.textDim, fontSize: 12 }}>今日交易筆數：{day.trades.length}</div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(42,44,54,0.86)" }}>
          <div className="h-full rounded-full" style={{ width: `${energyPercent}%`, background: `linear-gradient(90deg, ${energyState.dim}, ${energyState.color})` }} />
        </div>
        <div style={{ color: C.textFaint, fontSize: 11.5, lineHeight: 1.5, marginTop: 8 }}>
          {stopLossMode ? "交易仍可紀錄，但今日不再獲得交易紀錄獎勵。" : "每筆交易消耗 10"}
        </div>
        {!stopLossMode && (
          <button type="button" onClick={enterStopLossMode} className="mt-3 rounded-lg px-3 py-2 text-xs font-medium" style={{ background: "rgba(90,54,52,0.42)", border: "1px solid rgba(185,87,79,0.56)", color: C.text }}>
            進入止血模式
          </button>
        )}
      </Card>

      <Card className="mt-3" style={{ borderColor: C.hair, background: "rgba(19,20,25,0.72)", padding: 12 }}>
        <button type="button" onClick={() => setShowAttributes((value) => !value)} aria-expanded={showAttributes} className="flex w-full items-center justify-between gap-3 text-left">
          <span><span style={{ color: C.text, fontFamily: FONT_DISPLAY, fontSize: 16 }}>角色能力</span><span style={{ color: C.textFaint, fontSize: 11.5, marginLeft: 10 }}>專注、紀律、心態、執行、觀察、洞察</span></span>
          <ChevronDown size={16} color={C.textDim} style={{ transform: showAttributes ? "rotate(180deg)" : "none", transition: "transform 160ms ease" }} />
        </button>
        {showAttributes && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {hexAttributes.map((stat) => (
              <div key={stat.key} className="flex items-center justify-between gap-2" style={{ border: `1px solid ${C.hair}`, background: "rgba(10,11,14,0.7)", borderRadius: 9, padding: "8px 10px" }}>
                <span style={{ color: C.textDim, fontSize: 12, fontWeight: 700 }}>{stat.label}</span>
                <span style={{ color: C.gold, fontFamily: FONT_MONO, fontSize: 13 }}>{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mt-3" style={{ borderColor: C.goldDim, background: "linear-gradient(135deg, rgba(19,20,25,0.96), rgba(27,29,36,0.72))", padding: 12 }}>
        <div className="flex items-start gap-2"><ScrollText size={14} color={C.gold} className="mt-0.5 shrink-0" /><div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>{quote}</div></div>
      </Card>

      <div className="mt-5 flex flex-col items-center gap-2">
        <button type="button" onClick={() => setShowDataManagement((value) => !value)} aria-expanded={showDataManagement} className="rounded-lg px-3 py-2 text-xs" style={{ background: "transparent", border: "1px solid rgba(126,130,142,0.22)", color: C.textFaint }}>
          資料管理
        </button>
        {showDataManagement && (
          <div className="flex justify-center gap-2">
            <button type="button" onClick={confirmResetToday} className="rounded-lg px-3 py-2 text-xs" style={{ background: "transparent", border: "1px solid rgba(126,130,142,0.28)", color: C.textFaint }}>重置今日</button>
            <button type="button" onClick={confirmResetAll} className="rounded-lg px-3 py-2 text-xs" style={{ background: "transparent", border: "1px solid rgba(90,54,52,0.38)", color: C.textFaint }}>重置整個角色</button>
          </div>
        )}
      </div>

      {editingName && (
        <CultivatorNameModal initialName={cultivatorName} onSave={(name) => { updateIdentityName(name); setEditingName(false); }} onCancel={() => setEditingName(false)} />
      )}
    </div>
  );
}
