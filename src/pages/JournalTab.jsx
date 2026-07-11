import React, { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import HistoryList from "../components/HistoryList.jsx";
import { C } from "../styles/theme.js";

const REFLECTION_CONFIG = {
  violation: {
    q3Placeholder: "開始想補回時就停止",
    q4Placeholder: "接受這筆止損",
  },
  deviation: {
    q3Placeholder: "多等 BOS",
    q4Placeholder: "沒型態就不進場",
  },
  emotion: {
    q3Placeholder: "接受止損",
    q4Placeholder: "不要急",
  },
  waiting: {
    q3Placeholder: "沒有型態也是完成策略",
    q4Placeholder: "沒型態就不進場",
  },
  noTrade: {
    q3Placeholder: "更有耐心",
    q4Placeholder: "照 Checklist 執行",
  },
  faithful: {
    q3Placeholder: "照 SOP 執行",
    q4Placeholder: "多等 BOS",
  },
};

function getExecutionSummary(day, counts) {
  const { totalTrades, followedTrades, deviatedTrades, emotionAffectedTrades, violationCount } = counts;

  if (totalTrades === 0 && day.successful_wait === true) {
    return violationCount === 0
      ? "今日沒有符合策略的機會，完成等待，無違規。"
      : `今日沒有符合策略的機會，完成等待，另有 ${violationCount} 次違規紀錄。`;
  }

  if (totalTrades === 0 && day.eveningReflection?.reason) {
    const summaries = {
      no_setup: "今日沒有符合策略的機會，完成等待。",
      did_not_watch_market: "今日沒有交易紀錄，可以留下今天想記住的內容。",
      rest_day: "今日為休息日，可以留下今天想記住的內容。",
      fear_based_avoidance: "今日沒有交易紀錄，可以留下今天想記住的內容。",
    };
    return summaries[day.eveningReflection.reason] || "今日沒有交易紀錄，可以留下今天想記住的內容。";
  }

  if (totalTrades === 0) return "今日沒有交易紀錄，可以留下今天想記住的內容。";

  if (violationCount > 0) {
    return `今日共 ${totalTrades} 筆交易，其中 ${followedTrades} 筆符合策略，發生 ${violationCount} 次違規。`;
  }

  if (deviatedTrades > 0) {
    const emotionSummary = emotionAffectedTrades > 0 ? `其中 ${emotionAffectedTrades} 筆受到情緒影響。` : "";
    return `今日共 ${totalTrades} 筆交易，其中 ${deviatedTrades} 筆偏離策略。${emotionSummary}`;
  }

  if (emotionAffectedTrades > 0) {
    return `今日 ${totalTrades} 筆交易皆符合策略，其中 ${emotionAffectedTrades} 筆受到情緒影響，無違規。`;
  }

  return `今日完成 ${totalTrades} 筆策略交易，已留下交易紀錄，無違規。`;
}

function getReflectionConfig({ totalTrades, deviatedTrades, emotionAffectedTrades, violationCount }, successfulWait) {
  if (violationCount > 0) return REFLECTION_CONFIG.violation;
  if (deviatedTrades > 0) return REFLECTION_CONFIG.deviation;
  if (emotionAffectedTrades > 0) return REFLECTION_CONFIG.emotion;
  if (totalTrades === 0 && successfulWait === true) return REFLECTION_CONFIG.waiting;
  if (totalTrades === 0) return REFLECTION_CONFIG.noTrade;
  return REFLECTION_CONFIG.faithful;
}

export default function JournalTab({ ctx }) {
  const { day, updateDay, addReward, showToast, setTab, navigationTarget, setNavigationTarget } = ctx;
  const existing = day.journal;
  const journalRewardClaimed =
    !!day.claimedRewards?.journal ||
    ctx.data.expLog.some((log) => log.date === ctx.today && log.label === "Decision Journal");
  const [q3, setQ3] = useState(existing ? existing.q3 : "");
  const [q4, setQ4] = useState(existing ? existing.q4 : "");
  const [editingJournal, setEditingJournal] = useState(!existing);

  const totalTrades = day.trades.length;
  const followedTrades = day.trades.filter((trade) => trade.followed_checklist === true).length;
  const deviatedTrades = day.trades.filter((trade) => trade.followed_checklist === false).length;
  const emotionAffectedTrades = day.trades.filter((trade) => trade.emotion_affected === true).length;
  const violationCount = day.violations?.length || 0;
  const resistCount = day.bossResists?.length || 0;
  const counts = { totalTrades, followedTrades, deviatedTrades, emotionAffectedTrades, violationCount, resistCount };
  const executionSummary = getExecutionSummary(day, counts);
  const reflectionConfig = getReflectionConfig(counts, day.successful_wait);
  const isReading = !!existing && !editingJournal;

  useEffect(() => {
    if (existing) {
      setQ3(existing.q3 || "");
      setQ4(existing.q4 || "");
      setEditingJournal(false);
    } else {
      setQ3("");
      setQ4("");
      setEditingJournal(true);
    }
  }, [existing]);

  useEffect(() => {
    if (navigationTarget !== "decision-journal") return undefined;

    const animationFrame = requestAnimationFrame(() => {
      const element = document.getElementById(navigationTarget);
      if (!element) return;
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setNavigationTarget(null);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [navigationTarget, setNavigationTarget]);

  const startEdit = () => {
    if (!existing) return;
    setQ3(existing.q3 || "");
    setQ4(existing.q4 || "");
    setEditingJournal(true);
  };

  const cancelEdit = () => {
    if (!existing) return;
    setQ3(existing.q3 || "");
    setQ4(existing.q4 || "");
    setEditingJournal(false);
  };

  const deleteJournal = () => {
    if (!existing) return;
    const confirmed = window.confirm("確定要刪除此日誌嗎？");
    if (!confirmed) return;
    updateDay((d) => ({ ...d, journal: null }));
    setEditingJournal(true);
    showToast("日誌已刪除", "info");
  };

  const submit = () => {
    if (existing && !editingJournal) return;
    if (!q3.trim() || !q4.trim()) {
      showToast("請完成今日修煉領悟與下一輪提醒", "info");
      return;
    }
    const systemFaithful = violationCount === 0 && deviatedTrades === 0;
    const derivedEmotion = emotionAffectedTrades > 0 ? existing?.emotion || "未記錄" : "平靜";
    const behaviorTrustworthy = violationCount === 0 && deviatedTrades === 0 && emotionAffectedTrades === 0;
    const newJournal = {
      q1: systemFaithful,
      emotion: derivedEmotion,
      q3: q3.trim(),
      q4: q4.trim(),
      q5: behaviorTrustworthy,
      linked_trade_ids: day.trades.map((t) => t.id),
      ts: existing ? existing.ts : Date.now(),
    };

    if (existing) {
      const fields = ["q1", "emotion", "q3", "q4", "q5"];
      const now = Date.now();
      const changes = fields
        .filter((field) => existing[field] !== newJournal[field])
        .map((field) => ({ field, old_value: existing[field], new_value: newJournal[field], edited_at: now }));
      newJournal.edit_history = [...(existing.edit_history || []), ...changes];
      newJournal.edited_at = changes.length ? now : existing.edited_at || null;
      updateDay((d) => ({
        ...d,
        journal: newJournal,
        claimedRewards: { ...(d.claimedRewards || {}), journal: true },
      }));
      setEditingJournal(false);
      showToast("日誌已更新", "info");
    } else {
      updateDay((d) => ({
        ...d,
        journal: newJournal,
        claimedRewards: { ...(d.claimedRewards || {}), journal: true },
      }));
      setEditingJournal(false);
      if (journalRewardClaimed) {
        showToast("日誌已更新", "info");
      } else {
        addReward({ exp: 20, label: "Decision Journal", statKey: "observation" });
        showToast("決策復盤完成｜EXP +20｜觀察 +1", "reward");
      }
      setNavigationTarget("home-top");
      setTab("home");
    }
  };

  const history = Object.values(ctx.data.history).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30);

  return (
    <div>
      <div style={{ color: C.textDim, fontSize: 13 }} className="mb-1">
        決策復盤
      </div>
      <div style={{ fontSize: 11.5, color: C.textFaint }} className="mb-3">
        {existing ? "復盤已完成，可隨時回看今日修煉" : "記錄今日修煉，留下下一輪提醒"}
      </div>

      <div id="decision-journal" style={{ scrollMarginTop: "16px" }}>
        {isReading ? (
          <>
            <Card className="mb-3" style={{ borderColor: "rgba(107,154,126,0.3)", background: "rgba(19,20,25,0.78)" }}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ color: C.sage, fontSize: 13 }}>✓</span>
                    <span style={{ color: C.sage, fontSize: 11, letterSpacing: 1 }}>復盤完成</span>
                  </div>
                  {(existing.edited_at || existing.ts) && (
                    <div style={{ color: C.textFaint, fontSize: 10.5, marginTop: 4 }}>
                      {existing.edited_at ? "最後修改" : "建立時間"}：
                      {new Date(existing.edited_at || existing.ts).toLocaleString()}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={startEdit}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs"
                  style={{ background: "transparent", border: "1px solid rgba(126,130,142,0.28)", color: C.textFaint }}
                >
                  編輯日誌
                </button>
              </div>
            </Card>

            <Card className="mb-3" style={{ borderColor: C.hair }}>
              <div style={{ fontSize: 10.5, color: C.gold, letterSpacing: 1 }} className="mb-2">今日修煉結果</div>
              <div style={{ fontSize: 13.5, color: C.textDim, lineHeight: 1.65 }}>{executionSummary}</div>
            </Card>

            <Card className="mb-3" style={{ borderColor: C.hair }}>
              <div style={{ fontSize: 10.5, color: C.gold, letterSpacing: 1 }} className="mb-2">今日修煉領悟</div>
              <div style={{ fontSize: 13.5, color: existing.q3 ? C.textDim : C.textFaint, lineHeight: 1.65 }}>
                {existing.q3 || "尚未留下修煉領悟"}
              </div>
            </Card>

            <Card className="mb-2" style={{ borderColor: "rgba(203,163,95,0.52)", background: "rgba(203,163,95,0.05)" }}>
              <div style={{ fontSize: 10.5, color: C.gold, letterSpacing: 1 }} className="mb-2">下一輪提醒</div>
              <div style={{ fontSize: 15, color: existing.q4 ? C.text : C.textFaint, lineHeight: 1.7 }}>
                {existing.q4 || "尚未留下下一輪提醒"}
              </div>
            </Card>

            <div className="mb-4 text-right">
              <button type="button" onClick={deleteJournal} style={{ color: C.textFaint, fontSize: 11, background: "transparent" }}>
                刪除復盤
              </button>
            </div>
          </>
        ) : (
          <>
            <Card className="mb-3" style={{ borderColor: C.hair }}>
              <div style={{ fontSize: 10.5, color: C.gold, letterSpacing: 1 }} className="mb-2">今日修煉結果</div>
              <div style={{ fontSize: 13.5, color: C.textDim, lineHeight: 1.65 }}>{executionSummary}</div>
            </Card>

            <Card className="mb-3" style={{ borderColor: C.hair }}>
              <div style={{ fontSize: 10.5, color: C.gold, letterSpacing: 1 }} className="mb-2">今日修煉領悟</div>
              <label htmlFor="journal-reflection" style={{ display: "block", fontSize: 13.5, color: C.text, lineHeight: 1.55 }} className="mb-2">
                今天學到或想記住什麼？
              </label>
              <div style={{ fontSize: 11.5, color: C.textFaint, lineHeight: 1.55 }} className="mb-2">
                可以只寫幾個字，使用你最容易記住的方式。
              </div>
              <input
                id="journal-reflection"
                value={q3}
                onChange={(event) => setQ3(event.target.value)}
                maxLength={60}
                placeholder={reflectionConfig.q3Placeholder}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
              />
            </Card>

            <Card className="mb-4" style={{ borderColor: "rgba(203,163,95,0.52)", background: "rgba(203,163,95,0.05)" }}>
              <div style={{ fontSize: 10.5, color: C.gold, letterSpacing: 1 }} className="mb-2">下一輪提醒</div>
              <label htmlFor="journal-command" style={{ display: "block", fontSize: 13.5, color: C.text, lineHeight: 1.55 }} className="mb-1">
                下一次交易前，想提醒自己什麼？
              </label>
              <div style={{ fontSize: 11.5, color: C.textFaint, lineHeight: 1.55 }} className="mb-2">
                這不是考試，寫下你明天看得懂的提醒即可。
              </div>
              <input
                id="journal-command"
                value={q4}
                onChange={(event) => setQ4(event.target.value)}
                maxLength={60}
                placeholder={reflectionConfig.q4Placeholder}
                className="w-full rounded-lg px-3 py-2.5 outline-none"
                style={{ background: C.raised, color: C.text, border: "1px solid rgba(203,163,95,0.42)", fontSize: 14 }}
              />
            </Card>

            <div style={{ color: C.textFaint, fontSize: 11, textAlign: "center" }} className="mb-2">
              完成復盤，記錄今天的修煉。
            </div>
            <div className={existing ? "grid grid-cols-2 gap-2" : ""}>
              <button
                type="button"
                onClick={submit}
                className="w-full rounded-lg py-2.5 text-sm font-medium"
                style={{ background: C.violetDim, color: C.text }}
              >
                {existing ? "儲存修改" : "完成今日復盤"}
              </button>
              {existing && editingJournal && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full rounded-lg py-2.5 text-sm"
                  style={{ background: "transparent", border: `1px solid ${C.hair}`, color: C.textFaint }}
                >
                  取消
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <HistoryList history={history} today={ctx.today} onSelect={ctx.setReviewDate} />
    </div>
  );
}
