import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Lock, Trophy } from "lucide-react";
import AIMentorPanel from "../components/AIMentorPanel.jsx";
import Card from "../components/Card.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import CultivationMetricsGrid from "../components/CultivationMetricsGrid.jsx";
import CultivationStageProgress from "../components/CultivationStageProgress.jsx";
import SectionLabel from "../components/SectionLabel.jsx";
import StageEligibilityCard from "../components/StageEligibilityCard.jsx";
import SystemIdentityCard from "../components/SystemIdentityCard.jsx";
import {
  CHARACTER_STAGES,
  getCharacterStagePreviewKey,
  getNextCharacterStage,
  getStageEligibility,
  resolvePreviewCharacterStage,
  resolveStoredCharacterStage,
  resolveStoredCharacterStageKey,
} from "../config/characterStages.js";
import { C, FONT_MONO } from "../styles/theme.js";
import { computeCultivationMetrics } from "../utils/cultivationMetrics.js";
import { ACHIEVEMENTS } from "../utils/constants.js";
import { titleForLevel } from "../utils/levels.js";

const ACHIEVEMENT_CATEGORIES = ["交易修煉", "紀律連續", "復盤日誌", "心魔抵抗"];

function clampPercent(value, target) {
  if (!target) return 100;
  return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
}

function getAchievementCategory(id) {
  if (id === "first_wait" || id === "checklist_30") return "交易修煉";
  if (id === "clean_week" || id === "quest_100") return "紀律連續";
  if (id === "journal_7") return "復盤日誌";
  return "心魔抵抗";
}

function CollapsibleHeader({ title, description, open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full rounded-2xl p-4 text-left"
      style={{ background: C.surface, border: `1px solid ${C.hair}` }}
      aria-expanded={open}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div style={{ color: C.text, fontSize: 15, fontWeight: 900 }}>{title}</div>
          {description && <div className="mt-1" style={{ color: C.textFaint, fontSize: 11.5, lineHeight: 1.5 }}>{description}</div>}
        </div>
        <ChevronDown
          size={17}
          className="shrink-0 transition-transform"
          style={{ color: C.textDim, transform: open ? "rotate(180deg)" : "none" }}
          aria-hidden="true"
        />
      </div>
    </button>
  );
}

function AchievementRow({ item }) {
  const Icon = item.done ? Trophy : Lock;
  return (
    <div className="rounded-lg p-3" style={{ background: C.raised, border: `1px solid ${item.done ? C.goldDim : C.hair}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div style={{ color: item.done ? C.gold : C.text, fontSize: 13, fontWeight: 800 }}>{item.name}</div>
          <div className="mt-1" style={{ color: C.textFaint, fontSize: 11, lineHeight: 1.45 }}>{item.desc}</div>
        </div>
        <div className="flex shrink-0 items-center gap-1" style={{ color: item.done ? C.gold : C.textFaint, fontSize: 10.5 }}>
          <Icon size={12} />{item.done ? "已解鎖" : "未解鎖"}
        </div>
      </div>
      {!item.done && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full" style={{ background: C.raised2 }}>
            <div className="h-full rounded-full" style={{ width: `${item.percent}%`, background: C.goldDim }} />
          </div>
          <div className="mt-1 text-right" style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 9.5 }}>
            {item.current} / {item.target}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SystemTab({ ctx }) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [activeAchievementCategory, setActiveAchievementCategory] = useState(ACHIEVEMENT_CATEGORIES[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [advanceModalTargetKey, setAdvanceModalTargetKey] = useState(null);
  const [advanceAttempt, setAdvanceAttempt] = useState(null);
  const advanceSubmittingRef = useRef(false);
  const advanceAttemptSequenceRef = useRef(0);
  const resolvedAdvanceAttemptRef = useRef(null);
  const history = ctx.data.history && typeof ctx.data.history === "object" ? ctx.data.history : {};
  const historyDates = Object.keys(history).sort().reverse();
  const [mentorDate, setMentorDate] = useState(() => historyDates[0] || ctx.today);
  const rawMentorSession = history[mentorDate];
  const mentorSession = rawMentorSession
    ? {
        ...rawMentorSession,
        trades: Array.isArray(rawMentorSession.trades) ? rawMentorSession.trades : [],
        violations: Array.isArray(rawMentorSession.violations) ? rawMentorSession.violations : [],
        bossResists: Array.isArray(rawMentorSession.bossResists) ? rawMentorSession.bossResists : [],
        riskEvents: Array.isArray(rawMentorSession.riskEvents) ? rawMentorSession.riskEvents : [],
      }
    : null;

  const metrics = computeCultivationMetrics(history, {
    todayKey: ctx.today,
  });
  const currentStageKey = resolveStoredCharacterStageKey(ctx.data.identity);
  const storedStage = resolveStoredCharacterStage(ctx.data.identity);
  const previewStageKey = getCharacterStagePreviewKey();
  const displayStage = resolvePreviewCharacterStage(ctx.data.identity);
  const previewActive = previewStageKey !== null;
  const eligibility = getStageEligibility(currentStageKey, ctx.lvl.level, metrics);
  const targetStage = eligibility.targetStage;
  const advanceModalTargetStage = advanceModalTargetKey
    ? CHARACTER_STAGES[advanceModalTargetKey]
    : null;
  const canAdvance = Boolean(
    targetStage &&
    eligibility.eligible === true &&
    targetStage.assetReady === true &&
    targetStage.unlockEnabled === true &&
    !previewActive
  );

  const unlockedIds = Array.isArray(ctx.data.achievementsUnlocked) ? ctx.data.achievementsUnlocked : [];
  const achievementProgress = ACHIEVEMENTS.map((achievement) => {
    const progressById = {
      first_wait: { current: metrics.successfulWaitDays, target: 1 },
      checklist_30: { current: metrics.compliantStrategySamples, target: 30 },
      journal_7: { current: ctx.stats.journalStreak || 0, target: 7 },
      clean_week: { current: ctx.stats.noViolationStreak || 0, target: 7 },
      quest_100: { current: ctx.stats.questStreak || 0, target: 100 },
      integrity_full: { current: Number(ctx.data.identity?.integrity) || 0, target: 100 },
    };
    const progress = progressById[achievement.id] || { current: 0, target: 1 };
    const done = unlockedIds.includes(achievement.id) || achievement.check(ctx.stats);
    return {
      ...achievement,
      desc: achievement.id === "integrity_full" ? "Integrity 回到 100%" : achievement.desc,
      ...progress,
      done,
      percent: done ? 100 : clampPercent(progress.current, progress.target),
    };
  });
  const activeAchievements = achievementProgress.filter(
    (item) => getAchievementCategory(item.id) === activeAchievementCategory
  );

  const resetAdvanceFlow = useCallback(() => {
    advanceSubmittingRef.current = false;
    setAdvanceAttempt(null);
    setAdvanceModalTargetKey(null);
  }, []);

  const openAdvanceConfirm = () => {
    if (!canAdvance || advanceSubmittingRef.current) return;
    advanceSubmittingRef.current = false;
    setAdvanceAttempt(null);
    setAdvanceModalTargetKey(targetStage.key);
  };

  const completeAdvance = () => {
    if (advanceSubmittingRef.current || !advanceModalTargetKey) return;

    const nextStage = getNextCharacterStage(currentStageKey);
    if (
      previewActive ||
      !canAdvance ||
      !nextStage ||
      nextStage.key !== advanceModalTargetKey ||
      eligibility.targetStage?.key !== advanceModalTargetKey
    ) {
      resetAdvanceFlow();
      ctx.showToast("晉階資格已更新｜請重新確認修煉進度", "info");
      return;
    }

    const attempt = {
      id: advanceAttemptSequenceRef.current + 1,
      fromStageKey: currentStageKey,
      targetStageKey: advanceModalTargetKey,
    };
    advanceAttemptSequenceRef.current = attempt.id;
    advanceSubmittingRef.current = true;
    setAdvanceAttempt(attempt);
    ctx.updateCharacterStage(attempt.fromStageKey, attempt.targetStageKey);
  };

  useEffect(() => {
    if (
      !advanceAttempt ||
      resolvedAdvanceAttemptRef.current === advanceAttempt.id
    ) {
      return;
    }

    resolvedAdvanceAttemptRef.current = advanceAttempt.id;
    const attemptedStage = CHARACTER_STAGES[advanceAttempt.targetStageKey];
    if (currentStageKey === advanceAttempt.targetStageKey) {
      ctx.showToast(`晉階完成｜${attemptedStage?.label || advanceAttempt.targetStageKey}`, "reward");
    } else {
      ctx.showToast("晉階資格已更新｜請重新確認修煉進度", "info");
    }
    resetAdvanceFlow();
  }, [advanceAttempt, currentStageKey, ctx.showToast, resetAdvanceFlow]);

  useEffect(() => {
    if (!advanceModalTargetKey) return;

    const nextStage = getNextCharacterStage(currentStageKey);
    const modalIsInvalid =
      previewActive ||
      eligibility.eligible !== true ||
      eligibility.targetStage?.key !== advanceModalTargetKey ||
      !nextStage ||
      nextStage.key !== advanceModalTargetKey ||
      nextStage.assetReady !== true ||
      nextStage.unlockEnabled !== true;

    if (modalIsInvalid) resetAdvanceFlow();
  }, [
    advanceModalTargetKey,
    currentStageKey,
    eligibility.eligible,
    eligibility.targetStage?.key,
    previewActive,
    resetAdvanceFlow,
  ]);

  return (
    <div className="min-w-0">
      <div className="mb-5">
        <div style={{ color: C.text, fontSize: 21, fontWeight: 900 }}>修煉者成長中心</div>
        <div className="mt-1" style={{ color: C.textDim, fontSize: 12.5 }}>辨識身份、所在階位與下一階的修煉距離</div>
      </div>

      <SectionLabel>當前修煉身份</SectionLabel>
      <SystemIdentityCard
        identity={ctx.data.identity}
        stage={displayStage}
        level={ctx.lvl}
        levelTitle={titleForLevel(ctx.lvl.level)}
        isPreview={previewActive}
      />

      <SectionLabel>五階段修煉進度</SectionLabel>
      <CultivationStageProgress currentStageKey={currentStageKey} />

      <SectionLabel>下一階段資格</SectionLabel>
      <StageEligibilityCard
        eligibility={eligibility}
        canAdvance={canAdvance}
        previewActive={previewActive}
        onAdvance={openAdvanceConfirm}
      />

      <SectionLabel>核心修煉紀錄</SectionLabel>
      <CultivationMetricsGrid metrics={metrics} accent={storedStage.accent} />

      <div className="mt-6">
        <CollapsibleHeader
          title="修煉成就"
          description="成就是長期執行留下的證明，不是增加交易次數的目標。"
          open={showAchievements}
          onToggle={() => setShowAchievements((value) => !value)}
        />
        {showAchievements && (
          <Card className="mt-3">
            <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="成就分類">
              {ACHIEVEMENT_CATEGORIES.map((category) => {
                const active = category === activeAchievementCategory;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveAchievementCategory(category)}
                    className="rounded-lg px-2 py-2 text-xs font-extrabold"
                    style={{ color: active ? C.gold : C.textDim, background: active ? "rgba(203,163,95,.1)" : C.raised, border: `1px solid ${active ? C.goldDim : C.hair}` }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-3">
              {activeAchievements.map((item) => <AchievementRow key={item.id} item={item} />)}
            </div>
          </Card>
        )}
      </div>

      <div className="mb-2 mt-6" style={{ color: C.textFaint, fontSize: 11, letterSpacing: 1.5 }}>系統設定</div>
      <CollapsibleHeader title="系統設定" open={showSettings} onToggle={() => setShowSettings((value) => !value)} />
      {showSettings && (
        <Card className="mt-3">
          <div style={{ color: C.textDim, fontSize: 12, lineHeight: 1.55, marginBottom: 10 }}>
            管理現有 AI Key，並為指定日期產生或重跑紀律分析。
          </div>
          <select
            value={mentorDate}
            onChange={(event) => setMentorDate(event.target.value)}
            className="mb-3 w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
            aria-label="AI 導師分析日期"
          >
            {historyDates.map((date) => <option key={date} value={date}>{date}</option>)}
          </select>
          {mentorSession ? (
            <AIMentorPanel
              date={mentorDate}
              session={mentorSession}
              onSave={(result) => ctx.updateHistoryDay(mentorDate, (day) => ({ ...day, aiMentor: result }))}
            />
          ) : (
            <div style={{ color: C.textFaint, fontSize: 12 }}>尚無可分析的修煉紀錄。</div>
          )}
        </Card>
      )}

      {advanceModalTargetStage && (
        <ConfirmModal
          title={`確認晉階為「${advanceModalTargetStage.label}」`}
          desc={"晉階代表你已累積足夠的完整修煉與零違規紀錄。\n這不代表你已經掌控市場，而是你的執行穩定度進入下一階段。"}
          confirmLabel="完成晉階"
          confirmButtonClassName="transition-[filter,transform] hover:brightness-110 active:translate-y-px active:brightness-90"
          confirmButtonStyle={{
            background: advanceModalTargetStage.identityAccent,
            boxShadow: `0 0 18px ${advanceModalTargetStage.identityGlow}`,
            color: "#081018",
          }}
          cancelLabel="繼續修煉"
          onCancel={resetAdvanceFlow}
          onConfirm={completeAdvance}
        />
      )}
    </div>
  );
}
