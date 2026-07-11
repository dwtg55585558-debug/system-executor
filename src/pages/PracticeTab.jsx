import React, { useEffect, useRef, useState } from "react";
import Card from "../components/Card.jsx";
import SectionLabel from "../components/SectionLabel.jsx";
import ToggleRow from "../components/ToggleRow.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import SystemCheckModal from "../components/SystemCheckModal.jsx";
import executorApprentice from "../assets/characters/executor-apprentice.png";
import { C } from "../styles/theme.js";
import {
  CHECKLIST_ITEMS,
  BOSSES,
  VIOLATION_TYPES,
  EVENING_REFLECTION_REASONS,
} from "../utils/constants.js";
import { uid, detectRiskConditions, getLatestExecutionInstruction } from "../utils/helpers.js";

const ACCOUNT_TYPE_LABEL = {
  exam: "考試帳戶",
  funded: "出金帳戶",
};

const BOSS_DISPLAY_LABEL = {
  fomo: "害怕錯過",
  overconfidence: "過度自信",
  revenge: "報復交易",
  fear: "恐懼",
  greed: "貪婪",
  needtoberight: "想證明自己",
  impatience: "急躁",
};

const getAccountType = (trade) => (trade.accountType === "funded" ? "funded" : "exam");

const PROTECTION_ITEMS = [
  { id: "valid_stop", label: "止損放在符合策略位置" },
  { id: "stop_after_loss", label: "如果這筆虧損，今天不再交易" },
  { id: "not_recovery_trade", label: "這筆不是為了把今天轉正" },
  { id: "accept_loss_day", label: "我接受今天可以是虧損日" },
];

const calibrationOaths = [
  {
    id: "process_goal",
    title: "身份誓約",
    text: "我是策略執行者，只按照訊號出手；沒有訊號就等待，違反策略就是主動送命。",
    action: "確認身份",
  },
  {
    id: "a_plus_only",
    title: "未知誓約",
    text: "我不知道這一刀會不會命中，但我會相信策略，直到止損或止盈給出答案。",
    action: "接受未知",
  },
  {
    id: "emotional_stop",
    title: "風險誓約",
    text: "今天帳戶有可能歸零，但我仍然按照策略交易，不為了保護帳戶而破壞系統。",
    action: "接受風險",
  },
  {
    id: "energy_boundary",
    title: "執行誓約",
    text: "我是主角，策略是刀，市場是怪；我只照 SOP 出刀，不追著怪亂砍。",
    action: "握緊策略",
  },
];

const formatReminderDate = (date) => {
  if (typeof date !== "string") return "";
  const match = date.match(/^\d{4}-(\d{2})-(\d{2})$/);
  return match ? `${match[1]}-${match[2]}` : date;
};

const EMPTY_TRADE_RECORD_REWARDS = { count: 0, exp: 0, executionGranted: false };

const getTradeRecordRewards = (claimedRewards = {}) => ({
  ...EMPTY_TRADE_RECORD_REWARDS,
  ...(claimedRewards?.trade_record_rewards || {}),
});

const nextTradeRecordReward = (claimedRewards = {}, stopLossMode = false) => {
  if (stopLossMode) return { exp: 0, statKey: null, next: getTradeRecordRewards(claimedRewards) };

  const current = getTradeRecordRewards(claimedRewards);
  if (current.count >= 4) return { exp: 0, statKey: null, next: current };

  const count = current.count + 1;
  const exp = count === 1 ? 40 : 10;
  const statKey = count === 1 && !current.executionGranted ? "execution" : null;

  return {
    exp,
    statKey,
    next: {
      count,
      exp: current.exp + exp,
      executionGranted: current.executionGranted || statKey === "execution",
    },
  };
};

const hasValidStrategyTrade = (trades, stopLossMode) =>
  !stopLossMode && trades.some((trade) => trade.followed_checklist === true);

const getAccountProtectionStates = (trades) => {
  const initial = {
    exam: { dailyPnl: 0, hasLossTrade: false, hasEmotionAffectedTrade: false, active: false },
    funded: { dailyPnl: 0, hasLossTrade: false, hasEmotionAffectedTrade: false, active: false },
  };

  const states = trades.reduce((acc, trade) => {
    const type = getAccountType(trade);
    const pnlValue = trade.pnl == null ? 0 : Number(trade.pnl) || 0;
    acc[type].dailyPnl += pnlValue;
    if (trade.pnl != null && pnlValue < 0) acc[type].hasLossTrade = true;
    if (trade.emotion_affected === true) acc[type].hasEmotionAffectedTrade = true;
    return acc;
  }, initial);

  return Object.fromEntries(
    Object.entries(states).map(([type, state]) => [
      type,
      {
        ...state,
        active: state.hasLossTrade || state.dailyPnl < 0 || state.hasEmotionAffectedTrade,
      },
    ])
  );
};

export default function PracticeTab({ ctx }) {
  const { day, data, lvl, updateDay, addExp, addReward, adjustIntegrity, spendEnergy, showToast, setTab, setBossCard, navigationTarget, setNavigationTarget } = ctx;
  const latestDayRef = useRef(day);
  latestDayRef.current = day;
  const calibrationTransitionRef = useRef(false);
  const [isTradeFormOpen, setIsTradeFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [accountType, setAccountType] = useState("exam");
  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState("long");
  const [followed, setFollowed] = useState(null);
  const [emotionAffected, setEmotionAffected] = useState(false);
  const [stopLoss, setStopLoss] = useState(false);
  const [entryReason, setEntryReason] = useState("");
  const [rValue, setRValue] = useState("");
  const [notes, setNotes] = useState("");
  const [pnl, setPnl] = useState("");
  const [confirmViolation, setConfirmViolation] = useState(null);
  const [riskCheck, setRiskCheck] = useState(null);
  const [protectionConfirmedForCurrentTrade, setProtectionConfirmedForCurrentTrade] = useState(false);
  const [protectionChecks, setProtectionChecks] = useState({});
  const [emotionProtectionRequired, setEmotionProtectionRequired] = useState(false);
  const [calibrationChecks, setCalibrationChecks] = useState({});
  const [calibrationStage, setCalibrationStage] = useState("intro");
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [isCalibrationTransitioning, setIsCalibrationTransitioning] = useState(false);
  const [calibrationMotionPhase, setCalibrationMotionPhase] = useState("entered");
  const [showMorningDetails, setShowMorningDetails] = useState(!day.morning_plan);
  const [showChecklistDetails, setShowChecklistDetails] = useState(
    day.morning_plan === true && day.checklist_pass !== true
  );
  const [expandedTradeDetails, setExpandedTradeDetails] = useState({});
  const [showNoTradeReflection, setShowNoTradeReflection] = useState(false);
  const [activeExtraTraining, setActiveExtraTraining] = useState(null);
  const executionGoal = "只在符合系統時進場";
  const accountProtection = getAccountProtectionStates(day.trades);
  const activeProtectionTypes = Object.entries(accountProtection).filter(([, state]) => state.active);
  const selectedAccountNeedsProtection = !editingId && accountProtection[accountType].active;
  const mustCompleteProtectionBeforeForm =
    !editingId && (emotionProtectionRequired || (selectedAccountNeedsProtection && !protectionConfirmedForCurrentTrade));
  const allProtectionChecksDone = PROTECTION_ITEMS.every((item) => protectionChecks[item.id]);
  const latestExecutionInstruction = getLatestExecutionInstruction(data.history, day.date);
  const previewReminderEnabled =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get("previewMorningReminder") === "1";
  const displayedExecutionInstruction =
    latestExecutionInstruction ||
    (previewReminderEnabled
      ? { date: "2026-07-10", instruction: "未見確認，不先行" }
      : null);
  const identityDisplayName = data.identity.name?.trim() || "執行者";
  const shouldDisplayIdentityName = !/^\d+$/.test(identityDisplayName);

  const morningCalibrationItems = [
    ...calibrationOaths,
    ...(displayedExecutionInstruction
      ? [{ id: "execution_instruction" }]
      : []),
  ];
  const activeChecklistItems = displayedExecutionInstruction
    ? [
        ...CHECKLIST_ITEMS,
        { id: "execution_instruction", label: "這筆交易沒有違反我的修正指令" },
      ]
    : CHECKLIST_ITEMS;
  const allCalibrationChecked = morningCalibrationItems.every((item) => calibrationChecks[item.id] || day.morning_plan);
  const allChecked = activeChecklistItems.every((c) => day.checklistChecks[c.id]);
  const nextTradeNumber = day.trades.length + 1;
  const hasValidTradePermission = day.morning_plan === true && day.checklist_pass === true;
  const canOpenTrade = day.stopLossMode === true || hasValidTradePermission;
  const checklistRewardClaimed =
    day.claimedRewards?.checklist === true ||
    data.expLog.some((log) => log.date === day.date && log.label === "交易前 Checklist");
  const hasCompletedChecklistToday = day.checklist_pass === true || checklistRewardClaimed;
  const showFullPractice = day.morning_plan === true && day.checklist_pass === true;
  const canEndTrading =
    day.morning_plan === true &&
    hasCompletedChecklistToday &&
    !isTradeFormOpen &&
    !mustCompleteProtectionBeforeForm;
  const showExtraTraining =
    day.morning_plan === true &&
    (day.checklist_pass === true ||
      day.trades.length > 0 ||
      day.successful_wait === true ||
      day.bossResists.length > 0 ||
      day.violations.length > 0);
  const currentStep =
    day.morning_plan !== true
      ? "morning"
      : isTradeFormOpen || mustCompleteProtectionBeforeForm || riskCheck
        ? "record"
        : day.checklist_pass !== true
          ? "checklist"
          : "execute";
  const stepCardStyle = (step, state = "pending") => ({
    borderColor:
      currentStep === step
        ? "rgba(203,163,95,0.72)"
        : state === "completed"
          ? "rgba(107,154,126,0.28)"
          : C.hair,
    background: currentStep === step ? "rgba(203,163,95,0.055)" : C.surface,
    opacity: currentStep === step ? 1 : state === "locked" ? 0.56 : state === "completed" ? 0.76 : 1,
  });
  const calibrationContentClass = `transition-all duration-200 ease-out ${
    calibrationMotionPhase === "exiting"
      ? "-translate-y-1.5 opacity-0"
      : calibrationMotionPhase === "entering"
        ? "translate-y-1.5 opacity-0"
        : "translate-y-0 opacity-100"
  }`;
  const calibrationButtonClass =
    "w-full rounded-lg py-2.5 text-sm font-semibold transition duration-[120ms] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60";

  useEffect(() => {
    setShowMorningDetails(day.morning_plan !== true);
    setCalibrationStage("intro");
    setCalibrationStep(0);
    setCalibrationChecks({});
    calibrationTransitionRef.current = false;
    setIsCalibrationTransitioning(false);
    setCalibrationMotionPhase("entered");
  }, [day.date, day.morning_plan]);

  useEffect(() => {
    setShowChecklistDetails(day.morning_plan === true && day.checklist_pass !== true);
  }, [day.date, day.morning_plan, day.checklist_pass]);

  useEffect(() => {
    setExpandedTradeDetails({});
    setShowNoTradeReflection(false);
    setActiveExtraTraining(null);
  }, [day.date]);

  useEffect(() => {
    const supportedTargets = ["morning-calibration", "pre-trade-checklist", "trade-practice"];
    if (!supportedTargets.includes(navigationTarget)) return undefined;

    const animationFrame = requestAnimationFrame(() => {
      const element = document.getElementById(navigationTarget);
      if (!element) return;
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setNavigationTarget(null);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [navigationTarget, setNavigationTarget]);

  const toggleCheck = (id) => {
    if (day.morning_plan !== true) {
      showToast("請先完成晨間校準，再進行交易前準備", "info");
      setNavigationTarget("morning-calibration");
      return;
    }
    if (day.checklist_pass) return;
    updateDay((d) => ({ ...d, checklistChecks: { ...d.checklistChecks, [id]: !d.checklistChecks[id] } }));
  };

  const returnToHomeTop = () => {
    setNavigationTarget("home-top");
    setTab("home");
  };

  const completeChecklist = () => {
    if (day.morning_plan !== true) {
      showToast("請先完成晨間校準，再進行交易前準備", "info");
      setNavigationTarget("morning-calibration");
      return;
    }
    if (day.checklist_pass || !allChecked) return;
    updateDay((d) => ({
      ...d,
      checklist_pass: true,
      claimedRewards: { ...(d.claimedRewards || {}), checklist: true },
    }));
    if (checklistRewardClaimed) {
      showToast("交易前準備完成｜本筆執行許可已取得", "info");
    } else {
      addReward({ exp: 20, label: "交易前 Checklist", statKey: "discipline" });
      showToast("交易前準備完成｜EXP +20｜紀律 +1", "reward");
    }
    returnToHomeTop();
  };

  const completeMorningPlan = () => {
    if (day.morning_plan || !allCalibrationChecked || isCalibrationTransitioning) return;
    updateDay((d) => ({ ...d, morning_plan: true, identityStatement: executionGoal }));
    addReward({ exp: 10, label: "晨間校準", statKey: "focus" });
    showToast("晨間校準完成｜EXP +10｜專注 +1", "reward");
    returnToHomeTop();
  };

  const runCalibrationTransition = (nextAction) => {
    if (calibrationTransitionRef.current) return;

    calibrationTransitionRef.current = true;
    setIsCalibrationTransitioning(true);
    setCalibrationMotionPhase("exiting");

    window.setTimeout(() => {
      nextAction();
      setCalibrationMotionPhase("entering");

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setCalibrationMotionPhase("entered"));
      });
      window.setTimeout(() => {
        calibrationTransitionRef.current = false;
        setIsCalibrationTransitioning(false);
      }, 160);
    }, 120);
  };

  const confirmCalibrationStep = () => {
    const currentOath = calibrationOaths[calibrationStep];
    if (!currentOath || day.morning_plan || isCalibrationTransitioning) return;

    runCalibrationTransition(() => {
      setCalibrationChecks((checks) => ({ ...checks, [currentOath.id]: true }));
      if (calibrationStep < calibrationOaths.length - 1) {
        setCalibrationStep((step) => step + 1);
      } else if (displayedExecutionInstruction) {
        setCalibrationStep(calibrationOaths.length);
      } else {
        setCalibrationStage("ready");
      }
    });
  };

  const confirmExecutionInstruction = () => {
    if (!displayedExecutionInstruction || day.morning_plan || isCalibrationTransitioning) return;
    runCalibrationTransition(() => {
      setCalibrationChecks((checks) => ({ ...checks, execution_instruction: true }));
      setCalibrationStage("ready");
    });
  };

  const returnCalibrationStep = () => {
    runCalibrationTransition(() => {
      if (calibrationStep > 0) {
        setCalibrationStep((step) => step - 1);
      } else {
        setCalibrationStage("intro");
      }
    });
  };

  const resetForm = () => {
    setIsTradeFormOpen(false);
    setAccountType("exam");
    setSymbol("");
    setDirection("long");
    setFollowed(null);
    setEmotionAffected(false);
    setStopLoss(false);
    setEntryReason("");
    setRValue("");
    setNotes("");
    setPnl("");
    setEditingId(null);
    setProtectionConfirmedForCurrentTrade(false);
    setProtectionChecks({});
    setEmotionProtectionRequired(false);
  };

  const startEdit = (trade) => {
    setIsTradeFormOpen(true);
    setEditingId(trade.id);
    setAccountType(getAccountType(trade));
    setSymbol(trade.symbol);
    setDirection(trade.direction);
    setFollowed(trade.followed_checklist === true);
    setEmotionAffected(trade.emotion_affected === true);
    setStopLoss(trade.stop_loss_set);
    setEntryReason(trade.entry_reason || "");
    setRValue(trade.r_value != null ? String(trade.r_value) : "");
    setNotes(trade.notes || "");
    setPnl(trade.pnl != null ? String(trade.pnl) : "");
    setProtectionConfirmedForCurrentTrade(false);
    setProtectionChecks({});
    setEmotionProtectionRequired(false);
  };

  const setSelectedAccountType = (type) => {
    setAccountType(type);
    setProtectionConfirmedForCurrentTrade(false);
    setProtectionChecks({});
    setEmotionProtectionRequired(false);
  };

  const openTradeForm = () => {
    if (editingId) {
      setIsTradeFormOpen(true);
      return;
    }
    if (!day.stopLossMode && day.morning_plan !== true) {
      showToast("請先完成晨間校準，再開始今日交易", "info");
      setNavigationTarget("morning-calibration");
      return;
    }
    if (!day.stopLossMode && day.checklist_pass !== true) {
      showToast("請先完成交易前準備，取得本筆交易許可", "info");
      setNavigationTarget("pre-trade-checklist");
      return;
    }
    setProtectionConfirmedForCurrentTrade(false);
    setProtectionChecks({});
    setRiskCheck(null);
    setIsTradeFormOpen(true);
  };

  const isValidNumberInput = (value) => value !== "" && Number.isFinite(Number(value));
  const requiredTradeFieldsComplete =
    !!accountType &&
    !!symbol.trim() &&
    !!entryReason.trim() &&
    followed !== null &&
    stopLoss &&
    isValidNumberInput(rValue) &&
    isValidNumberInput(pnl);

  const buildTrade = () => ({
    id: editingId || uid(),
    accountType,
    symbol,
    direction,
    followed_checklist: followed === true,
    emotion_affected: emotionAffected,
    stop_loss_set: stopLoss,
    entry_reason: entryReason.trim(),
    r_value: rValue === "" ? null : Number(rValue),
    notes: notes.trim(),
    pnl: pnl === "" ? null : Number(pnl),
    ts: editingId ? day.trades.find((t) => t.id === editingId)?.ts || Date.now() : Date.now(),
  });

  const diffTrade = (oldT, newT) => {
    const fields = ["accountType", "symbol", "direction", "followed_checklist", "emotion_affected", "stop_loss_set", "entry_reason", "r_value", "notes", "pnl"];
    const now = Date.now();
    return fields.filter((f) => oldT[f] !== newT[f]).map((f) => ({ field: f, old_value: oldT[f], new_value: newT[f], edited_at: now }));
  };

  const toggleProtectionCheck = (id) => {
    setProtectionChecks((checks) => ({ ...checks, [id]: !checks[id] }));
  };

  const completeProtectionConfirm = () => {
    if (!allProtectionChecksDone) return;
    setProtectionConfirmedForCurrentTrade(true);
    setProtectionChecks({});
    setEmotionProtectionRequired(false);
  };

  const commitTrade = (tradeData) => {
    const latestDay = latestDayRef.current;

    if (editingId) {
      const idx = latestDay.trades.findIndex((t) => t.id === editingId);
      if (idx < 0) return;

      const old = latestDay.trades[idx];
      const changes = diffTrade(old, tradeData);
      const finalTrade = {
        ...tradeData,
        edit_history: [...(old.edit_history || []), ...changes],
        edited_at: changes.length ? Date.now() : old.edited_at || null,
      };
      const newTrades = [...latestDay.trades];
      newTrades[idx] = finalTrade;
      updateDay((d) => ({
        ...d,
        trades: newTrades,
        strategy_trade: hasValidStrategyTrade(newTrades, d.stopLossMode),
      }));
      showToast("已更新交易", "info");
    } else {
      if (!latestDay.stopLossMode && latestDay.morning_plan !== true) {
        setRiskCheck(null);
        showToast("請先完成晨間校準，再開始今日交易", "info");
        setNavigationTarget("morning-calibration");
        return;
      }
      if (!latestDay.stopLossMode && latestDay.checklist_pass !== true) {
        setRiskCheck(null);
        showToast("請先完成交易前準備，取得本筆交易許可", "info");
        setNavigationTarget("pre-trade-checklist");
        return;
      }
      const reward = nextTradeRecordReward(latestDay.claimedRewards, latestDay.stopLossMode);

      updateDay((d) => {
        const newTrades = [...d.trades, tradeData];
        return {
          ...d,
          trades: newTrades,
          strategy_trade: hasValidStrategyTrade(newTrades, d.stopLossMode),
          ...(!d.stopLossMode
            ? { checklist_pass: false, checklistChecks: {} }
            : {}),
          claimedRewards:
            reward.exp > 0
              ? {
                  ...(d.claimedRewards || {}),
                  trade_record_rewards: reward.next,
                }
              : d.claimedRewards,
        };
      });
      spendEnergy(10);
      if (reward.exp > 0) {
        addReward({ exp: reward.exp, label: "交易紀錄", statKey: reward.statKey });
        showToast(reward.statKey ? "交易紀錄｜EXP +40｜執行 +1｜Energy -10" : `交易紀錄｜EXP +${reward.exp}｜Energy -10`, "reward");
      } else if (latestDay.stopLossMode) {
        showToast("止血模式中｜已記錄交易｜Energy -10｜不發放交易紀錄獎勵", "info");
      } else {
        showToast("已記錄交易｜Energy -10｜今日交易紀錄獎勵已達上限", "info");
      }
    }
    resetForm();
    setRiskCheck(null);
    if (
      !editingId &&
      tradeData.followed_checklist === true &&
      tradeData.emotion_affected !== true &&
      !latestDay.stopLossMode
    ) {
      returnToHomeTop();
    }
  };

  const respondRiskCheck = (response) => {
    updateDay((d) => ({ ...d, riskEvents: [...d.riskEvents, { reasons: riskCheck.reasons, response, ts: Date.now() }] }));
    if (response === "emotionally_driven") {
      setRiskCheck(null);
      setIsTradeFormOpen(false);
      setProtectionConfirmedForCurrentTrade(false);
      setProtectionChecks({});
      setEmotionProtectionRequired(true);
      showToast("誠實標記本身,就是紀律的一部分。", "info");
      return;
    }
    commitTrade(riskCheck.trade);
  };

  const submitTrade = () => {
    if (!editingId && !day.stopLossMode && day.morning_plan !== true) {
      showToast("請先完成晨間校準，再開始今日交易", "info");
      setNavigationTarget("morning-calibration");
      return;
    }
    if (!editingId && !day.stopLossMode && !hasValidTradePermission) {
      showToast("請先完成交易前準備，取得本筆交易許可", "info");
      setNavigationTarget("pre-trade-checklist");
      return;
    }
    if (followed === null) {
      showToast("請選擇是否符合策略", "info");
      return;
    }
    if (!requiredTradeFieldsComplete) {
      showToast("請完成所有必填交易欄位", "info");
      return;
    }
    if (selectedAccountNeedsProtection && !protectionConfirmedForCurrentTrade) {
      return;
    }
    const trade = buildTrade();
    if (!editingId) {
      const reasons = detectRiskConditions(day, data.history);
      if (reasons.length > 0) {
        setRiskCheck({ trade, reasons });
        return;
      }
    }
    commitTrade(trade);
  };

  const logSuccessfulWait = () => {
    if (day.successful_wait) return;
    updateDay((d) => ({ ...d, successful_wait: true }));
    addReward({ exp: 50, label: "成功等待", statKey: "discipline" });
    showToast("成功等待完成｜EXP +50｜紀律 +1", "reward");
    returnToHomeTop();
  };

  const resistBoss = (bossId) => {
    if (day.bossResists.includes(bossId)) return;
    updateDay((d) => ({ ...d, bossResists: [...d.bossResists, bossId] }));
    addExp(30, "抵抗誘惑");
    showToast(`你擊退了 ${BOSS_DISPLAY_LABEL[bossId] || BOSSES.find((b) => b.id === bossId).name}。+30 EXP`, "reward");
  };

  const logViolation = (v) => {
    updateDay((d) => ({ ...d, violations: [...d.violations, { id: v.id, ts: Date.now() }] }));
    addExp(v.exp, v.label);
    adjustIntegrity(-v.integrity);
    setConfirmViolation(null);
    setBossCard(BOSSES.find((b) => b.id === v.bossId));
  };

  return (
    <div>
      <div style={{ color: C.textDim, fontSize: 13, letterSpacing: 1.2 }} className="mb-1">
        交易修煉關卡
      </div>

      <div id="morning-calibration" style={{ scrollMarginTop: "16px" }}>
        <SectionLabel>晨間校準</SectionLabel>
        <Card
          style={{
            ...stepCardStyle("morning", day.morning_plan === true ? "completed" : "pending"),
            boxShadow:
              calibrationStage === "ready" && calibrationMotionPhase !== "entered"
                ? "0 0 20px rgba(203,163,95,0.18)"
                : "none",
            transition: "border-color 240ms ease, box-shadow 240ms ease",
          }}
        >
        {day.morning_plan === true && !showMorningDetails ? (
          <button
            type="button"
            onClick={() => setShowMorningDetails(true)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left"
            style={{ background: C.raised, border: `1px solid ${C.hair}` }}
          >
            <span className="flex items-center gap-2.5">
              <span style={{ color: C.sage, fontSize: 16 }}>✓</span>
              <span>
                <span style={{ display: "block", color: C.text, fontSize: 13, fontWeight: 700 }}>策略執行者已就位</span>
                <span style={{ display: "block", color: C.textFaint, fontSize: 11.5, marginTop: 2 }}>
                  今日身份與邊界已確認。
                </span>
              </span>
            </span>
            <span style={{ color: C.textFaint, fontSize: 11 }}>查看承諾</span>
          </button>
        ) : (
        day.morning_plan === true ? (
          <>
            <div className="mb-3 text-center">
              <div style={{ color: C.gold, fontSize: 11, letterSpacing: 1.2 }}>身份啟動完成</div>
              <div style={{ color: C.text, fontSize: 20, fontWeight: 800, marginTop: 5 }}>策略執行者已就位</div>
              <div style={{ color: C.textFaint, fontSize: 12, marginTop: 5 }}>今日身份與邊界已確認。</div>
            </div>
            <div className="rounded-lg px-3 py-2.5" style={{ background: "rgba(10,11,14,0.42)", border: `1px solid ${C.hair}` }}>
              {calibrationOaths.map((oath) => (
                <div key={oath.id} className="flex items-center justify-between py-1.5" style={{ color: C.textDim, fontSize: 12.5 }}>
                  <span>{oath.title}</span><span style={{ color: C.sage }}>已確認</span>
                </div>
              ))}
              {displayedExecutionInstruction && (
                <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${C.hair}` }}>
                  <div style={{ color: C.textDim, fontSize: 12.5, lineHeight: 1.55 }}>{displayedExecutionInstruction.instruction}</div>
                  <div style={{ color: C.sage, fontSize: 11, marginTop: 4 }}>已看見上一輪提醒</div>
                </div>
              )}
            </div>
            <button type="button" onClick={() => setShowMorningDetails(false)} className="w-full pt-3 text-xs" style={{ color: C.textFaint }}>
              收合承諾
            </button>
          </>
        ) : calibrationStage === "intro" ? (
          <div className={`flex flex-col items-center text-center ${calibrationContentClass}`} style={{ minHeight: 330, justifyContent: "center" }}>
            <div style={{ color: C.gold, fontSize: 11, letterSpacing: 1.5 }}>今日修煉</div>
            <img src={executorApprentice} alt="策略執行者" style={{ width: 112, height: 132, objectFit: "contain", margin: "6px auto" }} />
            <h2 style={{ color: C.text, fontSize: 24, fontWeight: 800, margin: 0 }}>策略執行者</h2>
            {shouldDisplayIdentityName && <div style={{ color: C.gold, fontSize: 11.5, marginTop: 4 }}>{identityDisplayName}</div>}
            {Number.isFinite(lvl?.level) && <div style={{ color: C.textFaint, fontSize: 11, marginTop: 3 }}>LV. {lvl.level}</div>}
            <div style={{ color: C.text, fontSize: 15, marginTop: 10 }}>今天，我不追結果，只執行策略。</div>
            <div style={{ color: C.textFaint, fontSize: 12.5, marginTop: 6 }}>完成校準，進入今日修煉狀態。</div>
            <button
              type="button"
              disabled={isCalibrationTransitioning}
              onClick={() => runCalibrationTransition(() => { setCalibrationStage("oath"); setCalibrationStep(0); })}
              className={`mt-5 ${calibrationButtonClass}`}
              style={{ background: C.goldDim, color: C.text, border: "1px solid rgba(203,163,95,0.42)" }}
            >
              開始身份校準
            </button>
          </div>
        ) : calibrationStage === "oath" ? (
          <div className={`flex flex-col ${calibrationContentClass}`} style={{ minHeight: 330, justifyContent: "center" }}>
            {calibrationStep < calibrationOaths.length ? (() => {
              const oath = calibrationOaths[calibrationStep];
              return (
                <>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full px-2 py-1" style={{ color: C.gold, background: C.goldDim, fontSize: 10.5, letterSpacing: 0.8 }}>{oath.title}</span>
                    <span style={{ color: C.textFaint, fontSize: 11 }}>{calibrationStep + 1} / 4</span>
                  </div>
                  <div style={{ color: C.text, fontSize: 19, fontWeight: 700, lineHeight: 1.75, margin: "22px 2px" }}>{oath.text}</div>
                  <button type="button" disabled={isCalibrationTransitioning} onClick={confirmCalibrationStep} className={calibrationButtonClass} style={{ background: C.goldDim, color: C.text, border: "1px solid rgba(203,163,95,0.42)" }}>
                    {oath.action}
                  </button>
                </>
              );
            })() : (
              <>
                <div className="flex items-center justify-between">
                  <span className="rounded-full px-2 py-1" style={{ color: C.gold, background: C.goldDim, fontSize: 10.5, letterSpacing: 0.8 }}>上一輪留下的提醒</span>
                  <span style={{ color: C.textFaint, fontSize: 11 }}>提醒確認</span>
                </div>
                <div style={{ color: C.text, fontSize: 19, fontWeight: 700, lineHeight: 1.7, marginTop: 22 }}>{displayedExecutionInstruction.instruction}</div>
                <div style={{ color: C.textFaint, fontSize: 11, marginTop: 8 }}>記得 {formatReminderDate(displayedExecutionInstruction.date)} 的復盤提醒</div>
                <div style={{ color: C.textDim, fontSize: 12.5, margin: "18px 0" }}>今天交易前，再看一次這句話。</div>
                <button type="button" disabled={isCalibrationTransitioning} onClick={confirmExecutionInstruction} className={calibrationButtonClass} style={{ background: C.goldDim, color: C.text, border: "1px solid rgba(203,163,95,0.42)" }}>
                  我已看見這個提醒
                </button>
              </>
            )}
            <button type="button" disabled={isCalibrationTransitioning} onClick={returnCalibrationStep} className="w-full pt-4 text-xs transition duration-[120ms] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 disabled:opacity-60" style={{ color: C.textFaint }}>返回上一誓約</button>
          </div>
        ) : (
          <div className={`flex flex-col text-center ${calibrationContentClass}`} style={{ minHeight: 330, justifyContent: "center" }}>
            <div className="transition-opacity duration-150 delay-75" style={{ color: C.gold, fontSize: 11, letterSpacing: 1.2, opacity: calibrationMotionPhase === "entered" ? 1 : 0 }}>身份啟動</div>
            <h2 className="transition-opacity duration-200 delay-150" style={{ color: C.text, fontSize: 22, fontWeight: 800, margin: "8px 0 0", opacity: calibrationMotionPhase === "entered" ? 1 : 0 }}>策略執行者已就位</h2>
            <div style={{ color: "#a84d4d", fontSize: 14, fontWeight: 700, lineHeight: 1.6, marginTop: 20 }}>課題分離：我做我的，市場會給我答案。</div>
            <div style={{ color: C.textFaint, fontSize: 11, marginTop: 20 }}>今日唯一任務</div>
            <div style={{ color: C.text, fontSize: 16, fontWeight: 700, marginTop: 5 }}>等待策略允許，再出手。</div>
            {displayedExecutionInstruction && <div style={{ color: C.textFaint, fontSize: 11.5, lineHeight: 1.5, marginTop: 16 }}>今日提醒：{displayedExecutionInstruction.instruction}</div>}
            <button
              type="button"
              disabled={!allCalibrationChecked || isCalibrationTransitioning}
              onClick={completeMorningPlan}
              className={`mt-6 ${calibrationButtonClass}`}
              style={{ background: allCalibrationChecked ? C.goldDim : C.raised, color: allCalibrationChecked ? C.text : C.textFaint, border: `1px solid ${allCalibrationChecked ? "rgba(203,163,95,0.42)" : C.hair}` }}
            >
              進入今日修煉
            </button>
          </div>
        )
        )}
        </Card>
      </div>

      <div id="pre-trade-checklist" style={{ scrollMarginTop: "16px" }}>
        <SectionLabel>交易前準備</SectionLabel>
        <Card
          style={stepCardStyle(
            "checklist",
            day.morning_plan !== true ? "locked" : day.checklist_pass === true ? "completed" : "pending"
          )}
        >
        {day.morning_plan !== true ? (
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-3" style={{ background: C.raised, border: `1px solid ${C.hair}`, color: C.textFaint }}>
            <span style={{ fontSize: 15 }}>◇</span>
            <span>
              <span style={{ display: "block", color: C.textDim, fontSize: 12.5, fontWeight: 700 }}>交易前準備</span>
              <span style={{ display: "block", fontSize: 11.5, marginTop: 2 }}>完成晨間校準後解鎖</span>
            </span>
          </div>
        ) : day.checklist_pass === true && !showChecklistDetails ? (
          <button
            type="button"
            onClick={() => setShowChecklistDetails(true)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left"
            style={{ background: C.raised, border: `1px solid ${C.hair}` }}
          >
            <span className="flex items-center gap-2.5">
              <span style={{ color: C.sage, fontSize: 16 }}>✓</span>
              <span>
                <span style={{ display: "block", color: C.text, fontSize: 13, fontWeight: 700 }}>本筆交易許可已取得</span>
                <span style={{ display: "block", color: C.textFaint, fontSize: 11.5, marginTop: 2 }}>策略、風險與停損已確認</span>
              </span>
            </span>
            <span style={{ color: C.textFaint, fontSize: 11 }}>查看內容</span>
          </button>
        ) : (
        <>
        {day.checklist_pass !== true && (
          <div className="mb-2 rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(203,163,95,0.07)", border: `1px solid ${C.goldDim}`, color: C.gold }}>
            下一筆交易前，重新確認執行條件
          </div>
        )}
        {displayedExecutionInstruction && (
          <div
            className="mb-2.5 rounded-lg px-3 py-2.5"
            style={{ background: "rgba(203,145,72,0.065)", border: "1px solid rgba(203,145,72,0.38)" }}
          >
            <div style={{ color: C.gold, fontSize: 10.5, letterSpacing: 0.8 }} className="mb-1">本輪修正指令</div>
            <div style={{ color: C.text, fontSize: 13.5, lineHeight: 1.6 }}>{displayedExecutionInstruction.instruction}</div>
            <div style={{ color: C.textFaint, fontSize: 11, lineHeight: 1.45, marginTop: 5 }}>確認本筆交易沒有違反這條規則。</div>
          </div>
        )}
        {activeChecklistItems.map((c) => (
          <div
            key={c.id}
            onClick={() => toggleCheck(c.id)}
            aria-disabled={day.morning_plan !== true || day.checklist_pass}
            className="flex items-center gap-2.5 py-1.5"
            style={{
              cursor: day.morning_plan !== true || day.checklist_pass ? "not-allowed" : "pointer",
              opacity: day.morning_plan !== true ? 0.48 : 1,
            }}
          >
            <div
              className="flex items-center justify-center rounded-md shrink-0"
              style={{
                width: 18,
                height: 18,
                background: day.checklistChecks[c.id] || day.checklist_pass ? C.sageDim : "transparent",
                border: `1.5px solid ${day.checklistChecks[c.id] || day.checklist_pass ? C.sage : C.textFaint}`,
              }}
            >
              {(day.checklistChecks[c.id] || day.checklist_pass) && <span style={{ color: C.sage, fontSize: 11 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13.5 }}>{c.label}</span>
          </div>
        ))}
        {day.checklist_pass !== true && (
          <button
            disabled={day.morning_plan !== true || !allChecked}
            onClick={completeChecklist}
            className="w-full rounded-lg py-2 text-sm font-medium mt-3"
            style={{ background: allChecked ? C.goldDim : C.raised, color: allChecked ? C.text : C.textFaint }}
          >
            取得本筆交易許可
          </button>
        )}
        {day.checklist_pass === true && (
          <button
            type="button"
            onClick={() => setShowChecklistDetails(false)}
            className="w-full pt-2 text-xs"
            style={{ color: C.textFaint }}
          >
            收合內容
          </button>
        )}
        </>
        )}
        </Card>
      </div>

      <div id="trade-practice" style={{ scrollMarginTop: "16px" }}>
        {!showFullPractice ? (
          <>
            <SectionLabel>執行交易</SectionLabel>
            <Card style={stepCardStyle("execute", "locked")}>
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-3" style={{ background: C.raised, border: `1px solid ${C.hair}` }}>
                <span style={{ color: C.textFaint, fontSize: 15 }}>◇</span>
                <span>
                  <span style={{ display: "block", color: C.textDim, fontSize: 12.5, fontWeight: 700 }}>{`執行第 ${nextTradeNumber} 筆交易`}</span>
                  <span style={{ display: "block", color: C.textFaint, fontSize: 11.5, marginTop: 2 }}>
                    {day.morning_plan !== true ? "先完成晨間校準" : "先取得本筆交易許可"}
                  </span>
                </span>
              </div>
            </Card>
          </>
        ) : (
        <>
        <SectionLabel>{editingId ? "編輯交易" : "執行交易"}</SectionLabel>
        <Card style={stepCardStyle(currentStep === "record" ? "record" : "execute")}>
        {activeProtectionTypes.length > 0 && (
          <div className="space-y-2 mb-3">
            {activeProtectionTypes.map(([type, state]) => (
              <div key={type} className="rounded-lg p-3" style={{ background: "rgba(170,112,45,0.08)", border: "1px solid rgba(203,145,72,0.34)" }}>
                <div style={{ fontSize: 12, color: "#d6a15f", fontWeight: 800, marginBottom: 5 }}>
                  {ACCOUNT_TYPE_LABEL[type]}保護中
                </div>
                <div style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.55 }}>
                  今天此帳戶已出現虧損或情緒影響紀錄，後續每一筆交易前都需要完成保護確認。
                </div>
                <div style={{ fontSize: 11.5, color: C.textFaint, lineHeight: 1.5, marginTop: 5 }}>
                  {state.hasEmotionAffectedTrade
                    ? "目標不是立刻修復結果，而是確認每一次出手都仍由系統主導。"
                    : "目標不是把今天轉正，而是避免虧損後追單。"}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isTradeFormOpen && <div className="flex gap-2 mb-2">
          {["exam", "funded"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedAccountType(type)}
              className="flex-1 rounded-lg py-1.5 text-xs"
              style={{
                background: accountType === type ? C.raised2 : C.raised,
                border: `1px solid ${accountType === type ? C.gold : C.hair}`,
                color: accountType === type ? C.text : C.textFaint,
              }}
            >
              {ACCOUNT_TYPE_LABEL[type]}
            </button>
          ))}
        </div>}

        {!editingId && !isTradeFormOpen ? (
          <div className="rounded-lg p-3" style={{ background: C.raised, border: `1px solid ${canOpenTrade ? C.goldDim : C.hair}` }}>
            <button
              type="button"
              onClick={openTradeForm}
              aria-disabled={!canOpenTrade}
              className="w-full rounded-lg py-2.5 text-sm font-medium"
              style={{
                background: canOpenTrade ? C.goldDim : C.raised2,
                color: canOpenTrade ? C.text : C.textFaint,
                cursor: canOpenTrade ? "pointer" : "not-allowed",
              }}
            >
              {`執行第 ${nextTradeNumber} 筆交易`}
            </button>
            {canEndTrading && (
              <button
                type="button"
                onClick={() => setShowNoTradeReflection(true)}
                className="mt-2 w-full py-1.5 text-xs"
                style={{ background: "transparent", color: C.textDim }}
              >
                今天停止交易，開始復盤
              </button>
            )}
          </div>
        ) : !editingId && mustCompleteProtectionBeforeForm ? (
          <div className="rounded-lg p-3" style={{ background: "rgba(170,112,45,0.08)", border: "1px solid rgba(203,145,72,0.5)" }}>
            <div style={{ fontSize: 12, color: "#d6a15f", fontWeight: 800, marginBottom: 4 }}>
              ◈ 帳戶保護確認
            </div>
            <div style={{ fontSize: 11.5, color: C.textDim, marginBottom: 10 }}>通過確認後，才能開啟本筆交易紀錄</div>
            <div style={{ display: "grid", gap: 8 }} className="mb-3">
              {PROTECTION_ITEMS.map((item) => {
                const checked = !!protectionChecks[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleProtectionCheck(item.id)}
                    className="flex w-full items-start gap-2 rounded-lg p-2 text-left"
                    style={{
                      background: C.raised,
                      border: `1px solid ${checked ? C.goldDim : C.hair}`,
                      color: checked ? C.text : C.textDim,
                    }}
                  >
                    <span style={{ color: checked ? C.gold : C.textFaint, lineHeight: 1 }}>
                      {checked ? "✓" : "□"}
                    </span>
                    <span style={{ fontSize: 12, lineHeight: 1.45 }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="rounded-lg px-3 py-2 mb-3" style={{ background: C.raised, border: `1px solid ${C.hair}`, color: C.textDim, fontSize: 12.5, lineHeight: 1.55 }}>
              我現在不是在修復損益，而是在確認自己仍然是系統執行者。
            </div>
            <button
              type="button"
              onClick={completeProtectionConfirm}
              disabled={!allProtectionChecksDone}
              className="w-full rounded-lg py-2 text-sm font-medium"
              style={{
                background: allProtectionChecksDone ? C.goldDim : C.raised,
                color: allProtectionChecksDone ? C.text : C.textFaint,
              }}
            >
              完成保護確認
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-lg p-3 mb-3" style={{ background: "rgba(10,11,14,0.32)", border: `1px solid ${C.hair}` }}>
            <div style={{ color: C.gold, fontSize: 11, fontWeight: 800, letterSpacing: 1 }} className="mb-2">交易設定</div>
            <div className="flex gap-2 mb-2">
              {["exam", "funded"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedAccountType(type)}
                  className="flex-1 rounded-lg py-1.5 text-xs"
                  style={{
                    background: accountType === type ? C.raised2 : C.raised,
                    border: `1px solid ${accountType === type ? C.gold : C.hair}`,
                    color: accountType === type ? C.text : C.textFaint,
                  }}
                >
                  {ACCOUNT_TYPE_LABEL[type]}
                </button>
              ))}
            </div>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="標的,例如 NQ"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-2"
              style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
            />
            <div>
              <div style={{ color: C.textFaint, fontSize: 12, marginBottom: 6 }}>方向</div>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: "long", label: "多" }, { value: "short", label: "空" }].map((option) => (
                  <button key={option.value} type="button" onClick={() => setDirection(option.value)} className="rounded-lg py-2 text-xs" style={{ background: direction === option.value ? C.raised2 : C.raised, border: `1px solid ${direction === option.value ? C.goldDim : C.hair}`, color: direction === option.value ? C.text : C.textFaint }}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            </div>

            <div className="rounded-lg p-3 mb-3" style={{ background: "rgba(10,11,14,0.32)", border: `1px solid ${C.hair}` }}>
            <div style={{ color: C.gold, fontSize: 11, fontWeight: 800, letterSpacing: 1 }} className="mb-2">執行品質</div>
            <input
              value={entryReason}
              onChange={(e) => setEntryReason(e.target.value)}
              placeholder="進場理由"
              maxLength={80}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-2"
              style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
            />
            <div className="mb-2">
              <div style={{ color: C.textFaint, fontSize: 12, marginBottom: 6 }}>符合策略</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: true, label: "是，符合策略" },
                  { value: false, label: "否，不符合策略" },
                ].map((option) => {
                  const selected = followed === option.value;
                  return (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => setFollowed(option.value)}
                      className="rounded-lg py-2 text-xs"
                      style={{
                        background: selected ? C.raised2 : C.raised,
                        border: `1px solid ${selected ? C.goldDim : C.hair}`,
                        color: selected ? C.text : C.textFaint,
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <ToggleRow label="受到情緒影響" value={emotionAffected} onChange={setEmotionAffected} />
            <ToggleRow label="設定停損" value={stopLoss} onChange={setStopLoss} />
            </div>

            <div className="rounded-lg p-3 mb-3" style={{ background: "rgba(10,11,14,0.32)", border: `1px solid ${C.hair}` }}>
            <div style={{ color: C.gold, fontSize: 11, fontWeight: 800, letterSpacing: 1 }} className="mb-2">結果紀錄</div>
            <input
              value={rValue}
              onChange={(e) => setRValue(e.target.value)}
              placeholder="R 值"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none mt-2"
              style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
            />
            <input
              value={pnl}
              onChange={(e) => setPnl(e.target.value)}
              placeholder="盈虧"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none mt-2"
              style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
            />
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="備註(選填)"
              maxLength={80}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none mt-2 mb-3"
              style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
            />
            </div>

            {!requiredTradeFieldsComplete && (
              <div className="rounded-lg p-3 mb-3" style={{ background: C.raised, border: `1px solid ${C.ashDim}` }}>
                <div style={{ fontSize: 11, color: C.ash, letterSpacing: 1 }} className="uppercase mb-1.5">
                  系統驗證
                </div>
                <div style={{ fontSize: 12, color: C.textDim }}>
                  除備註以外，所有交易欄位都需要完成。
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={resetForm} className="flex-1 rounded-lg py-2 text-sm" style={{ background: C.raised, color: C.textDim }}>
                取消
              </button>
              <button
                onClick={submitTrade}
                className="flex-1 rounded-lg py-2 text-sm font-medium"
                style={{ background: C.violetDim, color: C.text }}
              >
                {editingId ? "儲存修改" : "記錄本筆交易"}
              </button>
            </div>
          </>
        )}
        </Card>

      {day.trades.length > 0 && (
        <Card style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: C.textDim, fontWeight: 800, marginBottom: 8 }}>今日執行紀錄</div>
          <div className="space-y-2">
            {day.trades.map((t, index) => (
              <div key={t.id} className="rounded-lg p-2.5" style={{ background: C.raised, border: `1px solid ${editingId === t.id ? C.violet : C.hair}` }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span style={{ fontSize: 11, color: C.textFaint }}>第 {index + 1} 筆</span>
                  <span style={{ fontSize: 12.5, color: C.text, fontWeight: 700 }}>{String(t.symbol || "").toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: C.textDim }}>{t.direction === "long" ? "多" : "空"}</span>
                  <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10.5, color: t.followed_checklist ? C.sage : "#d6a15f", background: t.followed_checklist ? C.sageDim : "rgba(116,43,43,0.18)" }}>
                    {t.followed_checklist ? "符合策略" : "偏離策略"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span style={{ fontSize: 11, color: C.textFaint }}>R {t.r_value ?? "—"}</span>
                  <span style={{ fontSize: 11, color: C.textFaint }}>PnL {t.pnl == null ? "—" : `${Number(t.pnl) > 0 ? "+" : ""}${t.pnl}`}</span>
                  <span style={{ fontSize: 11, color: t.emotion_affected === true ? "#d6a15f" : C.textFaint }}>
                    {t.emotion_affected === true ? "受情緒影響" : "未受情緒影響"}
                  </span>
                  {t.edited_at && <span style={{ fontSize: 10, color: C.textFaint }}>已編輯</span>}
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <button type="button" onClick={() => setExpandedTradeDetails((details) => ({ ...details, [t.id]: !details[t.id] }))} className="text-xs" style={{ color: C.gold }}>
                    {expandedTradeDetails[t.id] ? "收合詳情" : "查看詳情"}
                  </button>
                  <button onClick={() => startEdit(t)} style={{ fontSize: 11, color: C.textDim }}>編輯</button>
                </div>
                {(t.entry_reason || t.notes) && (
                  <>
                    {expandedTradeDetails[t.id] && (
                      <div className="mt-2 rounded-lg px-3 py-2" style={{ background: "rgba(10,11,14,0.38)", border: `1px solid ${C.hair}` }}>
                        {t.entry_reason && <div style={{ fontSize: 11, color: C.textDim }}>進場理由：{t.entry_reason}</div>}
                        {t.notes && <div style={{ fontSize: 11, color: C.textFaint, marginTop: t.entry_reason ? 5 : 0 }}>備註：{t.notes}</div>}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

        </>
        )}

      </div>

      {!showFullPractice && day.trades.length > 0 && (
        <Card style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: C.textDim, fontWeight: 800, marginBottom: 8 }}>今日執行紀錄</div>
          <div className="space-y-2">
            {day.trades.map((t, index) => (
              <div key={t.id} className="rounded-lg p-2.5" style={{ background: C.raised, border: `1px solid ${editingId === t.id ? C.violet : C.hair}` }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span style={{ fontSize: 11, color: C.textFaint }}>第 {index + 1} 筆</span>
                  <span style={{ fontSize: 12.5, color: C.text, fontWeight: 700 }}>{String(t.symbol || "").toUpperCase()}</span>
                  <span style={{ fontSize: 11, color: C.textDim }}>{t.direction === "long" ? "多" : "空"}</span>
                  <span className="rounded-full px-2 py-0.5" style={{ fontSize: 10.5, color: t.followed_checklist ? C.sage : "#d6a15f", background: t.followed_checklist ? C.sageDim : "rgba(116,43,43,0.18)" }}>
                    {t.followed_checklist ? "符合策略" : "偏離策略"}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span style={{ fontSize: 11, color: C.textFaint }}>R {t.r_value ?? "—"}</span>
                  <span style={{ fontSize: 11, color: C.textFaint }}>PnL {t.pnl == null ? "—" : `${Number(t.pnl) > 0 ? "+" : ""}${t.pnl}`}</span>
                  <span style={{ fontSize: 11, color: t.emotion_affected === true ? "#d6a15f" : C.textFaint }}>
                    {t.emotion_affected === true ? "受情緒影響" : "未受情緒影響"}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <button type="button" onClick={() => setExpandedTradeDetails((details) => ({ ...details, [t.id]: !details[t.id] }))} className="text-xs" style={{ color: C.gold }}>
                    {expandedTradeDetails[t.id] ? "收合詳情" : "查看詳情"}
                  </button>
                  <button onClick={() => startEdit(t)} style={{ fontSize: 11, color: C.textDim }}>編輯</button>
                </div>
                {expandedTradeDetails[t.id] && (t.entry_reason || t.notes) && (
                  <div className="mt-2 rounded-lg px-3 py-2" style={{ background: "rgba(10,11,14,0.38)", border: `1px solid ${C.hair}` }}>
                    {t.entry_reason && <div style={{ fontSize: 11, color: C.textDim }}>進場理由：{t.entry_reason}</div>}
                    {t.notes && <div style={{ fontSize: 11, color: C.textFaint, marginTop: t.entry_reason ? 5 : 0 }}>備註：{t.notes}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {day.morning_plan === true &&
        hasCompletedChecklistToday &&
        day.trades.length === 0 &&
        showNoTradeReflection && (
        <>
          <SectionLabel>晚間檢視</SectionLabel>
          <Card>
            {day.eveningReflection ? (
              <div style={{ fontSize: 12.5, color: C.textDim }}>
                今天沒有交易的原因:
                <span style={{ color: C.text }}> {EVENING_REFLECTION_REASONS.find((r) => r.id === day.eveningReflection.reason)?.label}</span>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12.5, color: C.textDim }} className="mb-3">
                  今天沒有交易。原因是?
                </div>
                <div className="space-y-2">
                  {EVENING_REFLECTION_REASONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        updateDay((d) => ({ ...d, eveningReflection: { reason: r.id, ts: Date.now() } }));
                        showToast("已記錄,這不影響 EXP。", "info");
                      }}
                      className="w-full rounded-lg py-2 text-sm text-left px-3"
                      style={{ background: C.raised, border: `1px solid ${C.hair}`, color: C.text }}
                    >
                      ○ {r.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </Card>
        </>
      )}

      {showExtraTraining && (
      <>
      <SectionLabel>其他修煉紀錄</SectionLabel>
      <div className="grid grid-cols-1 gap-2">
        {[
          { id: "wait", label: "記錄成功等待" },
          { id: "temptation", label: "記錄抵抗誘惑" },
          { id: "violation", label: "誠實記錄違規" },
        ].map((item) => {
          const active = activeExtraTraining === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveExtraTraining(active ? null : item.id)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left"
              style={{
                background: active ? "rgba(203,163,95,0.055)" : C.surface,
                border: `1px solid ${active ? C.goldDim : C.hair}`,
                color: active ? C.text : C.textDim,
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>{item.label}</span>
              <span style={{ color: active ? C.gold : C.textFaint, fontSize: 13 }}>{active ? "−" : "+"}</span>
            </button>
          );
        })}
      </div>

      {activeExtraTraining === "wait" && (
      <Card style={{ marginTop: 8, borderColor: C.hair, opacity: 0.9 }}>
        <div style={{ fontSize: 12.5, color: C.textDim }} className="mb-3">
          沒有交易也是一種完整的一天,只要你有意識地選擇等待。
        </div>
        {day.successful_wait ? (
          <div className="rounded-lg px-3 py-2 text-xs" style={{ background: C.sageDim, border: `1px solid rgba(107,154,126,0.28)`, color: C.sage }}>
            ✓ 成功等待已記錄
          </div>
        ) : (
          <button onClick={logSuccessfulWait} className="w-full rounded-lg py-2 text-sm font-medium" style={{ background: C.sageDim, color: C.text }}>
            記錄成功等待
          </button>
        )}
      </Card>
      )}

      {activeExtraTraining === "temptation" && (
      <Card style={{ marginTop: 8, borderColor: C.hair, opacity: 0.9 }}>
        <div style={{ fontSize: 12.5, color: C.textDim }} className="mb-3">
          今天有心魔想拉你下水,但你忍住了?記下這一刻。
        </div>
        <div className="grid grid-cols-2 gap-2">
          {BOSSES.map((b) => {
            const done = day.bossResists.includes(b.id);
            return (
              <button
                key={b.id}
                disabled={done}
                onClick={() => resistBoss(b.id)}
                className="rounded-lg py-2 text-xs"
                style={{ background: done ? C.raised : C.raised2, border: `1px solid ${done ? C.hair : C.violetDim}`, color: done ? C.textFaint : C.text }}
              >
                {done ? "✓ " : ""}
                {BOSS_DISPLAY_LABEL[b.id] || b.name}
              </button>
            );
          })}
        </div>
      </Card>
      )}

      {activeExtraTraining === "violation" && (
      <Card style={{ marginTop: 8, borderColor: "rgba(154,79,73,0.62)", background: "rgba(90,54,52,0.12)" }}>
        <div style={{ fontSize: 12.5, color: C.textDim }} className="mb-3">
          違規不是失敗,是身份暫時受到污染。誠實記錄,才能真正修復。
        </div>
        <div className="grid grid-cols-2 gap-2">
          {VIOLATION_TYPES.map((v) => (
            <button
              key={v.id}
              onClick={() => setConfirmViolation(v)}
              className="rounded-lg py-2 text-xs"
              style={{ background: C.raised, border: `1px solid ${C.ashDim}`, color: C.text }}
            >
              {v.label}
              <div style={{ color: C.ash, fontSize: 10.5, marginTop: 2 }}>{v.exp} EXP</div>
            </button>
          ))}
        </div>
      </Card>
      )}
      </>
      )}

      {confirmViolation && (
        <ConfirmModal
          title={`記錄「${confirmViolation.label}」?`}
          desc={`Integrity 將下降 ${confirmViolation.integrity}%,EXP ${confirmViolation.exp}。誠實面對,是修練的一部分。`}
          onCancel={() => setConfirmViolation(null)}
          onConfirm={() => logViolation(confirmViolation)}
        />
      )}

      {riskCheck && <SystemCheckModal riskCheck={riskCheck} onRespond={respondRiskCheck} onClose={() => setRiskCheck(null)} />}
    </div>
  );
}
