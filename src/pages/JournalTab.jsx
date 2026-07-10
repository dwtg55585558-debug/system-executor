import React, { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import SectionLabel from "../components/SectionLabel.jsx";
import YesNo from "../components/YesNo.jsx";
import StatMini from "../components/StatMini.jsx";
import HistoryList from "../components/HistoryList.jsx";
import { C } from "../styles/theme.js";
import { EMOTION_TAGS } from "../utils/constants.js";

export default function JournalTab({ ctx }) {
  const { day, updateDay, addReward, showToast, setTab, navigationTarget, setNavigationTarget } = ctx;
  const existing = day.journal;
  const journalRewardClaimed =
    !!day.claimedRewards?.journal ||
    ctx.data.expLog.some((log) => log.date === ctx.today && log.label === "Decision Journal");
  const [q1, setQ1] = useState(existing ? existing.q1 : null);
  const [emotion, setEmotion] = useState(existing ? existing.emotion : null);
  const [q3, setQ3] = useState(existing ? existing.q3 : "");
  const [q4, setQ4] = useState(existing ? existing.q4 : "");
  const [q5, setQ5] = useState(existing ? existing.q5 : null);
  const [editingJournal, setEditingJournal] = useState(!existing);
  const formDisabled = !!existing && !editingJournal;

  const followedCount = day.trades.filter((t) => t.followed_checklist).length;
  const rValues = day.trades.filter((t) => t.r_value != null).map((t) => t.r_value);
  const avgR = rValues.length ? (rValues.reduce((a, b) => a + b, 0) / rValues.length).toFixed(2) : null;

  useEffect(() => {
    if (existing) {
      setQ1(existing.q1);
      setEmotion(existing.emotion);
      setQ3(existing.q3 || "");
      setQ4(existing.q4 || "");
      setQ5(existing.q5);
      setEditingJournal(false);
    } else {
      setQ1(null);
      setEmotion(null);
      setQ3("");
      setQ4("");
      setQ5(null);
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
    setQ1(existing.q1);
    setEmotion(existing.emotion);
    setQ3(existing.q3 || "");
    setQ4(existing.q4 || "");
    setQ5(existing.q5);
    setEditingJournal(true);
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
    if (formDisabled) return;
    if (q1 === null || !emotion || q5 === null) {
      showToast("請完成必填的三題", "info");
      return;
    }
    const newJournal = {
      q1,
      emotion,
      q3,
      q4,
      q5,
      linked_trade_ids: day.trades.map((t) => t.id),
      ts: existing ? existing.ts : Date.now(),
    };
    if (existing) {
      const fields = ["q1", "emotion", "q3", "q4", "q5"];
      const now = Date.now();
      const changes = fields
        .filter((f) => existing[f] !== newJournal[f])
        .map((f) => ({ field: f, old_value: existing[f], new_value: newJournal[f], edited_at: now }));
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
        showToast("Decision Journal 完成｜EXP +20｜觀察 +1", "reward");
      }
      setNavigationTarget("home-top");
      setTab("home");
    }
  };

  const history = Object.values(ctx.data.history).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30);

  return (
    <div>
      <div style={{ color: C.textDim, fontSize: 13 }} className="mb-1">
        Decision Journal
      </div>
      <div style={{ fontSize: 11.5, color: C.textFaint }} className="mb-3">
        {existing ? "隨時可以修改,修改會留下紀錄" : "五題,60 秒內完成"}
      </div>

      {day.trades.length > 0 && (
        <Card className="mb-3" style={{ borderColor: C.hair }}>
          <div style={{ fontSize: 11, color: C.textFaint, letterSpacing: 1 }} className="uppercase mb-2">
            今日交易彙總
          </div>
          <div className="flex items-center gap-4">
            <StatMini label="交易" value={day.trades.length} />
            <StatMini label="符合策略" value={followedCount} color={C.sage} />
            <StatMini label="平均 R" value={avgR ?? "—"} color={C.gold} />
            <StatMini label="違規" value={day.violations.length} color={day.violations.length ? C.ash : C.textFaint} />
          </div>
        </Card>
      )}

      <div id="decision-journal" style={{ scrollMarginTop: "16px" }}>
      {existing && (
        <Card className="mb-3" style={{ borderColor: C.hair, background: "rgba(19,20,25,0.72)" }}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div style={{ color: C.textDim, fontSize: 12 }}>已新增日誌</div>
              <div style={{ color: C.textFaint, fontSize: 11, marginTop: 3 }}>
                {editingJournal ? "編輯中" : "可編輯或刪除，不會調整已領取獎勵"}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={startEdit}
                className="rounded-lg px-3 py-1.5 text-xs"
                style={{
                  background: "transparent",
                  border: `1px solid rgba(126,130,142,0.28)`,
                  color: C.textFaint,
                }}
              >
                編輯
              </button>
              <button
                type="button"
                onClick={deleteJournal}
                className="rounded-lg px-3 py-1.5 text-xs"
                style={{
                  background: "transparent",
                  border: `1px solid rgba(90,54,52,0.38)`,
                  color: C.textFaint,
                }}
              >
                刪除
              </button>
            </div>
          </div>
        </Card>
      )}

      <Card className="mb-3">
        <div style={{ fontSize: 13 }} className="mb-2">1. 今天有忠於系統嗎?</div>
        <YesNo value={q1} onChange={(value) => !formDisabled && setQ1(value)} />
      </Card>

      <Card className="mb-3">
        <div style={{ fontSize: 13 }} className="mb-2">2. 今天最大的情緒?</div>
        <div className="flex flex-wrap gap-1.5">
          {EMOTION_TAGS.map((e) => (
            <button
              key={e}
              disabled={formDisabled}
              onClick={() => setEmotion(e)}
              className="rounded-full px-3 py-1 text-xs"
              style={{ background: emotion === e ? C.violetDim : C.raised, border: `1px solid ${emotion === e ? C.violet : C.hair}`, color: C.text }}
            >
              {e}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mb-3">
        <div style={{ fontSize: 13 }} className="mb-2">3. 今天最大的學習?</div>
        <input
          value={q3}
          onChange={(e) => setQ3(e.target.value)}
          disabled={formDisabled}
          maxLength={60}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
        />
      </Card>

      <Card className="mb-3">
        <div style={{ fontSize: 13 }} className="mb-2">4. 今天唯一改善?</div>
        <input
          value={q4}
          onChange={(e) => setQ4(e.target.value)}
          disabled={formDisabled}
          maxLength={60}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
        />
      </Card>

      <Card className="mb-4">
        <div style={{ fontSize: 13 }} className="mb-2">5. 今天值得信任自己嗎?</div>
        <YesNo value={q5} onChange={(value) => !formDisabled && setQ5(value)} />
      </Card>

      <button
        onClick={submit}
        disabled={formDisabled}
        className="w-full rounded-lg py-2.5 text-sm font-medium"
        style={{
          background: formDisabled ? C.raised : C.violetDim,
          color: formDisabled ? C.textFaint : C.text,
        }}
      >
        {existing ? (editingJournal ? "儲存日誌" : "先點擊編輯") : "完成今日 Journal"}
      </button>
      {existing?.edited_at && (
        <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 6 }} className="text-center">
          最後修改:{new Date(existing.edited_at).toLocaleString()}
        </div>
      )}
      </div>

      <HistoryList history={history} today={ctx.today} onSelect={ctx.setReviewDate} />
    </div>
  );
}
