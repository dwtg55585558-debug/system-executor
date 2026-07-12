import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  Dumbbell,
  ScrollText,
} from "lucide-react";
import Card from "../components/Card.jsx";
import CultivatorNameModal from "../components/CultivatorNameModal.jsx";
import CharacterStatusCard from "../components/CharacterStatusCard.jsx";
import SystemMissionPanel from "../components/SystemMissionPanel.jsx";
import { resolveCharacterStage } from "../config/characterStages.js";
import { C, FONT_DISPLAY, FONT_MONO } from "../styles/theme.js";
import { QUOTES, JOURNAL_GAP_WARNING } from "../utils/constants.js";
import { journalGapDays } from "../utils/helpers.js";

export default function HomeTab({ ctx }) {
  const {
    day,
    addReward,
    updateDay,
    showToast,
    setTab,
    navigationTarget,
    setNavigationTarget,
    updateIdentityName,
    data,
    lvl,
    resetTodayToBaseline,
    resetAllData,
    openSuccessfulWaitModal,
  } = ctx;
  const [editingName, setEditingName] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [handoffSettled, setHandoffSettled] = useState(true);
  const [handoffGlow, setHandoffGlow] = useState(false);
  const handoffTimersRef = useRef([]);
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  useEffect(() => {
    if (navigationTarget !== "home-top" && navigationTarget !== "home-morning-complete") return undefined;
    const isMorningHandoff = navigationTarget === "home-morning-complete";
    window.scrollTo({ top: 0, behavior: "smooth" });
    setNavigationTarget(null);

    if (isMorningHandoff) {
      setHandoffSettled(false);
      setHandoffGlow(true);
      handoffTimersRef.current = [
        window.setTimeout(() => setHandoffSettled(true), 16),
        window.setTimeout(() => setHandoffGlow(false), 600),
      ];
    }
    return undefined;
  }, [navigationTarget, setNavigationTarget]);

  useEffect(() => () => handoffTimersRef.current.forEach(window.clearTimeout), []);

  const navigateTo = (tab, target) => {
    setNavigationTarget(target);
    setTab(tab);
  };

  const stopLossMode = !!day.stopLossMode;
  const gapDays = journalGapDays(data.history);
  const hasViolation = (day.violations?.length || 0) > 0;
  const stage = resolveCharacterStage(data.identity);
  const nextTradeNumber = day.trades.length + 1;
  let nextAction;
  if (day.journal) nextAction = { status: "今日修煉完成", title: "今日任務已結算", description: "今日的成果由執行品質決定，不由盈虧決定。", cta: "查看今日修煉紀錄", tab: "journal", target: "decision-journal", complete: true };
  else if (day.successful_wait) nextAction = { status: "等待任務已完成", title: <>你選擇等待，<br />而不是<span className="whitespace-nowrap">製造交易</span></>, description: "今日交易已結束，接著完成修煉結算。", cta: "開始今日復盤", tab: "journal", target: "decision-journal" };
  else if (stopLossMode) nextAction = { status: "系統保護中", title: "今日交易權限已收回", description: "接下來的任務是停止擴大情緒與風險。", cta: "開始保護性復盤", tab: "journal", target: "decision-journal", risk: true };
  else if (!day.morning_plan) nextAction = { status: "未啟動", title: "身份尚未啟動", description: "先確認今天的交易身份與執行邊界。", cta: "開始身份啟動", tab: "practice", target: "morning-calibration" };
  else if (day.checklist_pass === true) nextAction = { status: "出手許可已取得", title: `第 ${nextTradeNumber} 筆出手許可已取得`, description: "只在所有進場條件成立時提交策略樣本。", cta: "提交策略樣本", tab: "practice", target: "trade-practice", permission: true, tradeNumber: nextTradeNumber };
  else if (day.trades.length > 0) nextAction = { status: "樣本已提交", title: "本筆策略樣本已提交", description: "下一筆交易仍需重新取得出手許可。", cta: "取得下一筆出手許可", tab: "practice", target: "pre-trade-checklist", secondary: { label: "今日交易已結束｜開始今日復盤", tab: "journal", target: "decision-journal" } };
  else nextAction = { status: "系統已同步", title: "等待策略訊號", description: "沒有符合策略的機會，也是一項完整任務。", cta: "取得本筆出手許可", tab: "practice", target: "pre-trade-checklist", secondary: { label: "今日沒有策略機會｜完成等待任務", action: "successful-wait" } };

  const missionPath = day.successful_wait === true
    ? "waiting"
    : day.checklist_pass === true || day.trades.length > 0
      ? "trade"
      : "undecided";
  const syncNode = hasViolation
    ? { key: "sync", label: day.journal ? "違規已誠實記錄" : "系統同步中斷", state: "warning" }
    : day.journal
      ? { key: "sync", label: "零違規完成", state: "completed" }
      : { key: "sync", label: "系統同步維持中", state: "ongoing-neutral" };
  const settlementNode = {
    key: "settlement",
    label: "今日任務結算",
    state: day.journal ? "completed" : day.successful_wait ? "active" : "pending",
    detail: !day.journal && day.successful_wait ? "提交修煉領悟與下一輪提醒。" : undefined,
  };
  const unlockNode = { key: "unlock", label: "身份啟動", state: day.morning_plan ? "completed" : "active", detail: !day.morning_plan ? nextAction.description : undefined };
  const signalNode = { key: "signal", label: "等待策略訊號", state: !day.morning_plan ? "pending" : missionPath === "undecided" ? "active" : "completed", detail: missionPath === "undecided" && day.morning_plan ? nextAction.description : undefined };
  const missionNodes = missionPath === "waiting"
    ? [
        unlockNode,
        signalNode,
        { key: "wait", label: "完成成功等待", state: "completed" },
        syncNode,
        settlementNode,
      ]
    : [
        unlockNode,
        signalNode,
        {
          key: "permission",
          label: day.trades.length > 0 && !day.checklist_pass ? "取得下一筆出手許可" : "取得本筆出手許可",
          state: day.checklist_pass ? "completed" : day.morning_plan && day.trades.length > 0 && !day.journal ? "active" : "pending",
          detail: day.morning_plan && day.trades.length > 0 && !day.checklist_pass && !day.journal ? "下一筆交易前，必須重新完成交易前準備。" : undefined,
        },
        { key: "sample", label: "提交策略樣本", state: day.checklist_pass ? "active" : day.trades.length > 0 ? "completed" : "pending", detail: day.checklist_pass ? nextAction.description : undefined },
        { key: "record", label: "完成交易紀錄", state: day.trades.length > 0 ? "completed" : "pending" },
        syncNode,
        settlementNode,
      ];

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
  const energyValueColor = stopLossMode || energy < 0 ? "#B9574F" : C.gold;

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
      <div style={{ opacity: handoffSettled ? 1 : .86, transition: "opacity 240ms ease", filter: handoffGlow ? "drop-shadow(0 0 10px rgba(127,166,200,.18))" : "none" }}>
        <CharacterStatusCard stage={stage} activated={!!day.morning_plan} risk={stopLossMode || hasViolation} level={lvl.level} name={cultivatorName} date={ctx.today} mission={nextAction} onEditName={() => setEditingName(true)} onPrimary={() => navigateTo(nextAction.tab, nextAction.target)} onSecondary={() => nextAction.secondary.action === "successful-wait" ? openSuccessfulWaitModal() : navigateTo(nextAction.secondary.tab, nextAction.secondary.target)} />
      </div>
      <SystemMissionPanel nodes={missionNodes} accent={stage.accent} />

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

      <div className="mt-4 mb-2" style={sectionTitleStyle}>每日交易能量</div>
      <Card style={{ borderColor: stopLossMode ? "rgba(185,87,79,0.72)" : C.hair, background: stopLossMode ? "linear-gradient(135deg, rgba(90,54,52,0.3), rgba(19,20,25,0.9))" : "rgba(19,20,25,0.86)" }}>
        <div className="flex items-center justify-between gap-3">
          <div style={{ color: energyValueColor, fontFamily: FONT_DISPLAY, fontSize: 24 }}>Energy {energy} <span style={{ color: C.textFaint, fontSize: 13 }}>/ {maxEnergy}</span></div>
          <div style={{ color: energyState.color, fontSize: 11, fontWeight: 800 }}>{energyState.label}</div>
        </div>
        <div className="mt-2 flex items-end justify-end gap-3">
          <div style={{ color: C.textDim, fontSize: 12 }}>今日交易筆數：{day.trades.length}</div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(42,44,54,0.86)" }}>
          <div className="h-full rounded-full" style={{ width: `${energyPercent}%`, background: `linear-gradient(90deg, ${energyState.dim}, ${energyState.color})` }} />
        </div>
        <div style={{ color: C.textFaint, fontSize: 11.5, lineHeight: 1.5, marginTop: 8 }}>
          {stopLossMode ? "交易仍可紀錄，但今日不再獲得交易紀錄獎勵。" : "每筆交易消耗 10"}
        </div>
        {!stopLossMode && (
          <button type="button" onClick={enterStopLossMode} className="mt-3 rounded-lg px-3 py-2 text-xs font-medium" style={{ minHeight: 40, background: "rgba(90,54,52,0.42)", border: "1px solid rgba(185,87,79,0.56)", color: C.text }}>
            進入止血模式
          </button>
        )}
      </Card>

      <div className="mt-4 mb-2" style={sectionTitleStyle}>附加修煉</div>
      <Card style={{ borderColor: C.hair, background: "rgba(19,20,25,0.86)", padding: 12 }}>
        {[
          { id: "workout", label: "健身", exp: 20, statKey: "mindset", icon: Dumbbell },
          { id: "reading", label: "閱讀", exp: 20, statKey: "insight", icon: BookOpen },
        ].map((task, index) => {
          const Icon = task.icon;
          const done = !!day[task.id];
          return (
            <button key={task.id} type="button" disabled={done} onClick={() => toggleManual(task.id, task.exp, task.label, task.statKey)} className="flex w-full items-center justify-between gap-3 text-left" style={{ minHeight: 40, borderTop: index === 0 ? "none" : `1px solid ${C.hair}`, padding: "9px 2px", cursor: done ? "default" : "pointer" }}>
              <span className="flex items-center gap-3" style={{ color: done ? C.textDim : C.text, fontSize: 13.5, fontWeight: 700 }}><Icon size={16} color={done ? C.sage : C.textDim} />{task.label}</span>
              <span className="flex items-center gap-1.5" style={{ color: done ? C.sage : C.textFaint, fontSize: 11.5 }}>{done ? "已完成" : "點擊完成"}{done && <Check size={14} />}</span>
            </button>
          );
        })}
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

      <Card className="mt-3" style={{ borderColor: C.goldDim, background: "linear-gradient(135deg, rgba(19,20,25,0.96), rgba(27,29,36,0.72))", padding: "10px 12px" }}>
        <div className="flex items-start gap-2"><ScrollText size={14} color={C.gold} className="mt-0.5 shrink-0" /><div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>{quote}</div></div>
      </Card>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button type="button" onClick={() => setShowDataManagement((value) => !value)} aria-expanded={showDataManagement} className="rounded-lg px-3 py-2 text-xs" style={{ minHeight: 40, background: "transparent", border: "1px solid rgba(126,130,142,0.22)", color: C.textFaint }}>
          資料管理
        </button>
        {showDataManagement && (
          <div className="flex justify-center gap-2">
            <button type="button" onClick={confirmResetToday} className="rounded-lg px-3 py-2 text-xs" style={{ minHeight: 40, background: "transparent", border: "1px solid rgba(126,130,142,0.28)", color: C.textFaint }}>重置今日</button>
            <button type="button" onClick={confirmResetAll} className="rounded-lg px-3 py-2 text-xs" style={{ minHeight: 40, background: "transparent", border: "1px solid rgba(90,54,52,0.38)", color: C.textFaint }}>重置整個角色</button>
          </div>
        )}
      </div>

      {editingName && (
        <CultivatorNameModal initialName={cultivatorName} onSave={(name) => { updateIdentityName(name); setEditingName(false); }} onCancel={() => setEditingName(false)} />
      )}
    </div>
  );
}
