import React, { useState } from "react";
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

export default function PracticeTab({ ctx }) {
  const { day, data, updateDay, addExp, addReward, adjustIntegrity, spendEnergy, showToast, setBossCard } = ctx;
  const [editingId, setEditingId] = useState(null);
  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState("long");
  const [followed, setFollowed] = useState(true);
  const [stopLoss, setStopLoss] = useState(true);
  const [entryReason, setEntryReason] = useState("");
  const [rValue, setRValue] = useState("");
  const [notes, setNotes] = useState("");
  const [pnl, setPnl] = useState("");
  const [confirmViolation, setConfirmViolation] = useState(null);
  const [riskCheck, setRiskCheck] = useState(null);
  const [calibrationChecks, setCalibrationChecks] = useState({});
  const executionGoal = "只在符合系統時進場";

  const morningCalibrationItems = [
    { id: "process_goal", label: "今天不以賺錢為目標，只以執行系統為目標" },
    { id: "a_plus_only", label: "今天只做 A+ 機會，沒有就等待" },
    { id: "emotional_stop", label: "今天若出現急躁、想補回、想證明自己，立刻停手" },
    { id: "energy_boundary", label: "今天 Energy 歸零後，不再新增交易" },
  ];
  const allCalibrationChecked = morningCalibrationItems.every((item) => calibrationChecks[item.id] || day.morning_plan);
  const stopLossMode = !!day.stopLossMode;

  const allChecked = CHECKLIST_ITEMS.every((c) => day.checklistChecks[c.id]);

  const toggleCheck = (id) => {
    if (day.checklist_pass) return;
    updateDay((d) => ({ ...d, checklistChecks: { ...d.checklistChecks, [id]: !d.checklistChecks[id] } }));
  };

  const completeChecklist = () => {
    updateDay((d) => ({ ...d, checklist_pass: true }));
    addReward({ exp: 20, label: "交易前 Checklist", statKey: "discipline" });
    showToast("交易前 Checklist 完成｜EXP +20｜紀律 +1", "reward");
  };

  const completeMorningPlan = () => {
    if (day.morning_plan || !allCalibrationChecked) return;
    updateDay((d) => ({ ...d, morning_plan: true, identityStatement: executionGoal }));
    addReward({ exp: 10, label: "晨間校準", statKey: "focus" });
    showToast("晨間校準完成｜EXP +10｜專注 +1", "reward");
  };

  const toggleCalibrationCheck = (id) => {
    if (day.morning_plan) return;
    setCalibrationChecks((checks) => ({ ...checks, [id]: !checks[id] }));
  };

  const resetForm = () => {
    setSymbol("");
    setDirection("long");
    setFollowed(true);
    setStopLoss(true);
    setEntryReason("");
    setRValue("");
    setNotes("");
    setPnl("");
    setEditingId(null);
  };

  const startEdit = (trade) => {
    setEditingId(trade.id);
    setSymbol(trade.symbol);
    setDirection(trade.direction);
    setFollowed(trade.followed_checklist);
    setStopLoss(trade.stop_loss_set);
    setEntryReason(trade.entry_reason || "");
    setRValue(trade.r_value != null ? String(trade.r_value) : "");
    setNotes(trade.notes || "");
    setPnl(trade.pnl != null ? String(trade.pnl) : "");
  };

  // System Validation: 符合策略 = YES 時,進場理由/停損/R Risk 缺一則禁止送出
  const validationMissing = followed
    ? [!entryReason.trim() && "進場理由", !stopLoss && "停損", rValue === "" && "R Risk"].filter(Boolean)
    : [];

  const buildTrade = () => ({
    id: editingId || uid(),
    symbol,
    direction,
    followed_checklist: followed,
    stop_loss_set: stopLoss,
    entry_reason: entryReason.trim(),
    r_value: rValue === "" ? null : Number(rValue),
    notes: notes.trim(),
    pnl: pnl === "" ? null : Number(pnl),
    ts: editingId ? day.trades.find((t) => t.id === editingId)?.ts || Date.now() : Date.now(),
  });

  const diffTrade = (oldT, newT) => {
    const fields = ["symbol", "direction", "followed_checklist", "stop_loss_set", "entry_reason", "r_value", "notes", "pnl"];
    const now = Date.now();
    return fields.filter((f) => oldT[f] !== newT[f]).map((f) => ({ field: f, old_value: oldT[f], new_value: newT[f], edited_at: now }));
  };

  const commitTrade = (tradeData) => {
    if (editingId) {
      const idx = day.trades.findIndex((t) => t.id === editingId);
      const old = day.trades[idx];
      const changes = diffTrade(old, tradeData);
      const finalTrade = {
        ...tradeData,
        edit_history: [...(old.edit_history || []), ...changes],
        edited_at: changes.length ? Date.now() : old.edited_at || null,
      };
      const otherFollowedExists = day.trades.some((t, i) => i !== idx && t.followed_checklist);
      const newTrades = [...day.trades];
      newTrades[idx] = finalTrade;
      updateDay((d) => ({ ...d, trades: newTrades }));
      if (finalTrade.followed_checklist && !old.followed_checklist && !otherFollowedExists) {
        if (stopLossMode) {
          showToast("止血模式中｜今日不再獎勵新增交易", "info");
        } else {
          addReward({ exp: 40, label: "符合策略進場", statKey: "execution" });
          showToast("符合策略交易｜EXP +40｜執行 +1", "reward");
        }
      } else {
        showToast("已更新交易", "info");
      }
    } else {
      const alreadyAwarded = day.trades.some((t) => t.followed_checklist);
      updateDay((d) => ({ ...d, trades: [...d.trades, tradeData] }));
      spendEnergy(10);
      if (tradeData.followed_checklist && !alreadyAwarded) {
        if (stopLossMode) {
          showToast("止血模式中｜今日不再獎勵新增交易", "info");
        } else {
          addReward({ exp: 40, label: "符合策略進場", statKey: "execution" });
          showToast("符合策略交易｜EXP +40｜執行 +1", "reward");
        }
      } else {
        showToast("已記錄交易", "info");
      }
    }
    resetForm();
    setRiskCheck(null);
  };

  const respondRiskCheck = (response) => {
    updateDay((d) => ({ ...d, riskEvents: [...d.riskEvents, { reasons: riskCheck.reasons, response, ts: Date.now() }] }));
    commitTrade(riskCheck.trade);
    if (response === "emotionally_driven") {
      showToast("誠實標記本身,就是紀律的一部分。", "info");
    }
  };

  const submitTrade = () => {
    if (!symbol.trim()) {
      showToast("請輸入交易標的", "info");
      return;
    }
    if (validationMissing.length > 0) return;
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

      <SectionLabel>{editingId ? "編輯交易" : "記錄交易"}</SectionLabel>
      <Card>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="標的,例如 BTC / TSLA"
          className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-2"
          style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
        />
        <div className="flex gap-2 mb-2">
          {["long", "short"].map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className="flex-1 rounded-lg py-1.5 text-xs"
              style={{
                background: direction === d ? C.raised2 : C.raised,
                border: `1px solid ${direction === d ? C.violet : C.hair}`,
                color: direction === d ? C.text : C.textFaint,
              }}
            >
              {d === "long" ? "做多" : "做空"}
            </button>
          ))}
        </div>
        <ToggleRow label="符合我的策略" value={followed} onChange={setFollowed} />
        <ToggleRow label="已設定停損" value={stopLoss} onChange={setStopLoss} />

        {followed && (
          <>
            <input
              value={entryReason}
              onChange={(e) => setEntryReason(e.target.value)}
              placeholder="進場理由"
              maxLength={80}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none mt-2"
              style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
            />
            <input
              value={rValue}
              onChange={(e) => setRValue(e.target.value)}
              placeholder="R Risk,例如 1.5"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none mt-2"
              style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
            />
          </>
        )}

        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="備註(選填)"
          maxLength={80}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none mt-2"
          style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
        />
        <input
          value={pnl}
          onChange={(e) => setPnl(e.target.value)}
          placeholder="盈虧(選填,僅記錄,不影響 EXP)"
          className="w-full rounded-lg px-3 py-2 text-sm outline-none mt-2 mb-3"
          style={{ background: C.raised, color: C.textDim, border: `1px solid ${C.hair}` }}
        />

        {followed && validationMissing.length > 0 && (
          <div className="rounded-lg p-3 mb-3" style={{ background: C.raised, border: `1px solid ${C.ashDim}` }}>
            <div style={{ fontSize: 11, color: C.ash, letterSpacing: 1 }} className="uppercase mb-1.5">
              System Validation
            </div>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 6 }}>符合策略必須包含進場理由、停損、R Risk：</div>
            {["進場理由", "停損", "R Risk"].map((f) => (
              <div key={f} className="flex items-center gap-1.5 py-0.5" style={{ fontSize: 12 }}>
                <span style={{ color: validationMissing.includes(f) ? C.ash : C.sage }}>
                  {validationMissing.includes(f) ? "✗" : "✓"}
                </span>
                <span style={{ color: C.textDim }}>{f}</span>
              </div>
            ))}
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
            disabled={followed && validationMissing.length > 0}
            className="flex-1 rounded-lg py-2 text-sm font-medium"
            style={{
              background: followed && validationMissing.length > 0 ? C.raised : C.violetDim,
              color: followed && validationMissing.length > 0 ? C.textFaint : C.text,
            }}
          >
            {editingId ? "儲存修改" : "記錄這筆交易"}
          </button>
        </div>
        <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 8 }} className="text-center">
          今天可以記錄任意筆數,沒有次數限制
        </div>
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
                  <span style={{ fontSize: 11, color: t.followed_checklist ? C.sage : C.textFaint }}>
                    {t.followed_checklist ? "符合策略" : "未標記符合"}
                  </span>
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

      {riskCheck && <SystemCheckModal riskCheck={riskCheck} onRespond={respondRiskCheck} />}
    </div>
  );
}
