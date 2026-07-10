import React, { useEffect, useRef, useState } from "react";
import Card from "../components/Card.jsx";
import SectionLabel from "../components/SectionLabel.jsx";
import ToggleRow from "../components/ToggleRow.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import SystemCheckModal from "../components/SystemCheckModal.jsx";
import { C } from "../styles/theme.js";
import {
  CHECKLIST_ITEMS,
  BOSSES,
  VIOLATION_TYPES,
  EVENING_REFLECTION_REASONS,
} from "../utils/constants.js";
import { uid, detectRiskConditions } from "../utils/helpers.js";

const ACCOUNT_TYPE_LABEL = {
  exam: "考試帳戶",
  funded: "出金帳戶",
};

const getAccountType = (trade) => (trade.accountType === "funded" ? "funded" : "exam");

const PROTECTION_ITEMS = [
  { id: "valid_stop", label: "止損放在符合策略位置" },
  { id: "stop_after_loss", label: "如果這筆虧損，今天不再交易" },
  { id: "not_recovery_trade", label: "這筆不是為了把今天轉正" },
  { id: "accept_loss_day", label: "我接受今天可以是虧損日" },
];

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
  const { day, data, updateDay, addExp, addReward, adjustIntegrity, spendEnergy, showToast, setTab, setBossCard, navigationTarget, setNavigationTarget } = ctx;
  const latestDayRef = useRef(day);
  latestDayRef.current = day;
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
  const executionGoal = "只在符合系統時進場";
  const accountProtection = getAccountProtectionStates(day.trades);
  const activeProtectionTypes = Object.entries(accountProtection).filter(([, state]) => state.active);
  const selectedAccountNeedsProtection = !editingId && accountProtection[accountType].active;
  const mustCompleteProtectionBeforeForm =
    !editingId && (emotionProtectionRequired || (selectedAccountNeedsProtection && !protectionConfirmedForCurrentTrade));
  const allProtectionChecksDone = PROTECTION_ITEMS.every((item) => protectionChecks[item.id]);

  const morningCalibrationItems = [
    { id: "process_goal", label: "今天不以賺錢為目標，只以執行系統為目標" },
    { id: "a_plus_only", label: "今天只做 A+ 機會，沒有就等待" },
    { id: "emotional_stop", label: "今天若出現急躁、想補回、想證明自己，立刻停手" },
    { id: "energy_boundary", label: "今天 Energy 歸零後，不再新增交易" },
  ];
  const allCalibrationChecked = morningCalibrationItems.every((item) => calibrationChecks[item.id] || day.morning_plan);
  const allChecked = CHECKLIST_ITEMS.every((c) => day.checklistChecks[c.id]);

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
    if (day.checklist_pass) return;
    updateDay((d) => ({ ...d, checklistChecks: { ...d.checklistChecks, [id]: !d.checklistChecks[id] } }));
  };

  const returnToHomeTop = () => {
    setNavigationTarget("home-top");
    setTab("home");
  };

  const completeChecklist = () => {
    updateDay((d) => ({ ...d, checklist_pass: true }));
    addReward({ exp: 20, label: "交易前 Checklist", statKey: "discipline" });
    showToast("交易前 Checklist 完成｜EXP +20｜紀律 +1", "reward");
    returnToHomeTop();
  };

  const completeMorningPlan = () => {
    if (day.morning_plan || !allCalibrationChecked) return;
    updateDay((d) => ({ ...d, morning_plan: true, identityStatement: executionGoal }));
    addReward({ exp: 10, label: "晨間校準", statKey: "focus" });
    showToast("晨間校準完成｜EXP +10｜專注 +1", "reward");
    returnToHomeTop();
  };

  const toggleCalibrationCheck = (id) => {
    if (day.morning_plan) return;
    setCalibrationChecks((checks) => ({ ...checks, [id]: !checks[id] }));
  };

  const resetForm = () => {
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
      const reward = nextTradeRecordReward(latestDay.claimedRewards, latestDay.stopLossMode);

      updateDay((d) => {
        const newTrades = [...d.trades, tradeData];
        return {
          ...d,
          trades: newTrades,
          strategy_trade: hasValidStrategyTrade(newTrades, d.stopLossMode),
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
      setProtectionConfirmedForCurrentTrade(false);
      setProtectionChecks({});
      setEmotionProtectionRequired(true);
      showToast("誠實標記本身,就是紀律的一部分。", "info");
      return;
    }
    commitTrade(riskCheck.trade);
  };

  const submitTrade = () => {
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
    showToast(`你擊退了 ${BOSSES.find((b) => b.id === bossId).name}。+30 EXP`, "reward");
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
      <div style={{ color: C.textDim, fontSize: 13 }} className="mb-1">
        修練
      </div>

      <div id="morning-calibration" style={{ scrollMarginTop: "16px" }}>
        <SectionLabel>晨間校準</SectionLabel>
        <Card>
        <div style={{ fontSize: 12, color: C.textFaint }} className="mb-1.5">
          今日唯一執行目標
        </div>
        <div
          className="mb-3 rounded-lg px-3 py-2 text-sm"
          style={{
            background: "rgba(203,163,95,0.08)",
            color: C.text,
            border: `1px solid rgba(203,163,95,0.22)`,
            fontWeight: 700,
          }}
        >
          {executionGoal}
        </div>
        <div style={{ display: "grid", gap: 8 }} className="mb-3">
          {morningCalibrationItems.map((item) => {
            const checked = calibrationChecks[item.id] || day.morning_plan;

            return (
              <button
                key={item.id}
                type="button"
                disabled={day.morning_plan}
                onClick={() => toggleCalibrationCheck(item.id)}
                className="flex items-start gap-2.5 rounded-lg p-2 text-left"
                style={{
                  minHeight: 40,
                  background: "rgba(10,11,14,0.42)",
                  border: `1px solid ${checked ? "rgba(107,154,126,0.5)" : C.hair}`,
                  color: checked ? C.text : C.textDim,
                  cursor: day.morning_plan ? "default" : "pointer",
                }}
              >
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    background: "transparent",
                    border: `1.5px solid ${checked ? C.sage : C.textFaint}`,
                    color: C.sage,
                    fontSize: 11,
                    lineHeight: 1,
                  }}
                >
                  {checked && "✓"}
                </span>
                <span style={{ fontSize: 12.5, lineHeight: 1.45 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
        <button
          disabled={day.morning_plan || !allCalibrationChecked}
          onClick={completeMorningPlan}
          className="w-full rounded-lg py-2 text-sm font-medium"
          style={{
            background: day.morning_plan ? C.raised : allCalibrationChecked ? C.violetDim : C.raised,
            color: day.morning_plan ? C.textFaint : allCalibrationChecked ? C.text : C.textFaint,
          }}
        >
          {day.morning_plan ? "已完成" : "完成晨間校準"}
        </button>
        </Card>
      </div>

      <div id="pre-trade-checklist" style={{ scrollMarginTop: "16px" }}>
        <SectionLabel>交易前 Checklist</SectionLabel>
        <Card>
        {CHECKLIST_ITEMS.map((c) => (
          <div key={c.id} onClick={() => toggleCheck(c.id)} className="flex items-center gap-2.5 py-1.5" style={{ cursor: day.checklist_pass ? "default" : "pointer" }}>
            <div
              className="flex items-center justify-center rounded-md shrink-0"
              style={{
                width: 18,
                height: 18,
                background: day.checklistChecks[c.id] ? C.sageDim : "transparent",
                border: `1.5px solid ${day.checklistChecks[c.id] ? C.sage : C.textFaint}`,
              }}
            >
              {day.checklistChecks[c.id] && <span style={{ color: C.sage, fontSize: 11 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13.5 }}>{c.label}</span>
          </div>
        ))}
        <button
          disabled={!allChecked || day.checklist_pass}
          onClick={completeChecklist}
          className="w-full rounded-lg py-2 text-sm font-medium mt-3"
          style={{
            background: day.checklist_pass ? C.raised : allChecked ? C.violetDim : C.raised,
            color: day.checklist_pass ? C.textFaint : allChecked ? C.text : C.textFaint,
          }}
        >
          {day.checklist_pass ? "已通過" : "標記 Checklist 通過"}
        </button>
        </Card>
      </div>

      <div id="trade-practice" style={{ scrollMarginTop: "16px" }}>
        <SectionLabel>{editingId ? "編輯交易" : "記錄交易"}</SectionLabel>
        <Card>
        {activeProtectionTypes.length > 0 && (
          <div className="space-y-2 mb-3">
            {activeProtectionTypes.map(([type, state]) => (
              <div key={type} className="rounded-lg p-3" style={{ background: "rgba(116,43,43,0.16)", border: "1px solid rgba(203,120,72,0.42)" }}>
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

        {mustCompleteProtectionBeforeForm ? (
          <div className="rounded-lg p-3" style={{ background: "rgba(203,163,95,0.08)", border: `1px solid ${C.goldDim}` }}>
            <div style={{ fontSize: 12, color: C.gold, fontWeight: 800, marginBottom: 8 }}>
              {emotionProtectionRequired ? "系統執行者身份確認" : `${ACCOUNT_TYPE_LABEL[accountType]}保護確認`}
            </div>
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
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="標的,例如 NQ"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-2"
              style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
            />
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

            {!requiredTradeFieldsComplete && (
              <div className="rounded-lg p-3 mb-3" style={{ background: C.raised, border: `1px solid ${C.ashDim}` }}>
                <div style={{ fontSize: 11, color: C.ash, letterSpacing: 1 }} className="uppercase mb-1.5">
                  System Validation
                </div>
                <div style={{ fontSize: 12, color: C.textDim }}>
                  除備註以外，所有交易欄位都需要完成。
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {editingId && (
                <button onClick={resetForm} className="flex-1 rounded-lg py-2 text-sm" style={{ background: C.raised, color: C.textDim }}>
                  取消編輯
                </button>
              )}
              <button
                onClick={submitTrade}
                className="flex-1 rounded-lg py-2 text-sm font-medium"
                style={{ background: C.violetDim, color: C.text }}
              >
                {editingId ? "儲存修改" : "記錄這筆交易"}
              </button>
            </div>
            <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 8 }} className="text-center">
              今天可以記錄任意筆數,沒有次數限制
            </div>
          </>
        )}
        </Card>

      {day.trades.length > 0 && (
        <Card style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 8 }}>今天已記錄 {day.trades.length} 筆</div>
          <div className="space-y-2">
            {day.trades.map((t) => (
              <div key={t.id} className="rounded-lg p-2.5" style={{ background: C.raised, border: `1px solid ${editingId === t.id ? C.violet : C.hair}` }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12.5, color: C.text }}>
                    {t.symbol} · {t.direction === "long" ? "多" : "空"}
                  </span>
                  <button onClick={() => startEdit(t)} style={{ fontSize: 11, color: C.violet }}>
                    編輯
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span style={{ fontSize: 11, color: getAccountType(t) === "funded" ? "#d6a15f" : C.textFaint }}>
                    {ACCOUNT_TYPE_LABEL[getAccountType(t)]}
                  </span>
                  <span style={{ fontSize: 11, color: t.followed_checklist ? C.sage : C.textFaint }}>
                    {t.followed_checklist ? "符合策略" : "不符合策略"}
                  </span>
                  {t.emotion_affected === true && (
                    <span style={{ fontSize: 11, color: "#d6a15f" }}>情緒影響</span>
                  )}
                  {t.r_value != null && <span style={{ fontSize: 11, color: C.textFaint }}>R {t.r_value}</span>}
                  {t.edited_at && <span style={{ fontSize: 10, color: C.textFaint }}>已編輯</span>}
                </div>
                {t.entry_reason && <div style={{ fontSize: 11, color: C.textFaint, marginTop: 3 }}>{t.entry_reason}</div>}
              </div>
            ))}
          </div>
        </Card>
      )}

      <SectionLabel>今天沒有機會?</SectionLabel>
      <Card>
        <div style={{ fontSize: 12.5, color: C.textDim }} className="mb-3">
          沒有交易也是一種完整的一天,只要你有意識地選擇等待。
        </div>
        <button
          disabled={day.successful_wait}
          onClick={logSuccessfulWait}
          className="w-full rounded-lg py-2 text-sm font-medium"
          style={{ background: day.successful_wait ? C.raised : C.sageDim, color: day.successful_wait ? C.textFaint : C.text }}
        >
          {day.successful_wait ? "已記錄成功等待 +50" : "記錄成功等待 · +50 EXP"}
        </button>
      </Card>
      </div>

      {new Date().getHours() >= 18 && day.trades.length === 0 && (
        <>
          <SectionLabel>Evening Reflection</SectionLabel>
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

      <SectionLabel>抵抗誘惑</SectionLabel>
      <Card>
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
                {b.name}
              </button>
            );
          })}
        </div>
      </Card>

      <SectionLabel>誠實記錄違規</SectionLabel>
      <Card style={{ borderColor: C.ashDim }}>
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
