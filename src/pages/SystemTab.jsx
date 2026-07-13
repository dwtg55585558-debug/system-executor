import React, { useState } from "react";
import Card from "../components/Card.jsx";
import SectionLabel from "../components/SectionLabel.jsx";
import AIMentorPanel from "../components/AIMentorPanel.jsx";
import { C, FONT_MONO } from "../styles/theme.js";
import { ACHIEVEMENTS, TITLE_BANDS } from "../utils/constants.js";
import { Award, Lock, Shield, Sparkles, Trophy } from "lucide-react";

const MYSTIC = "#8F7AD1";
const MYSTIC_DIM = "rgba(143,122,209,0.28)";

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

function ProgressBar({ value, color = MYSTIC }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.raised2 }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </div>
  );
}

function StatRow({ label, value, last = false }) {
  return (
    <div
      className="flex justify-between items-center py-2.5"
      style={{ borderBottom: last ? "none" : `1px solid rgba(42,44,54,0.62)` }}
    >
      <span style={{ color: C.textDim, fontSize: 13 }}>{label}</span>
      <span style={{ color: C.gold, fontFamily: FONT_MONO, fontSize: 13 }}>{value}</span>
    </div>
  );
}

function MilestoneRow({ item, unlocked = false }) {
  const Icon = unlocked ? (item.id === "integrity_full" ? Shield : Trophy) : Lock;

  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: unlocked ? "rgba(203,163,95,0.055)" : C.raised,
        border: `1px solid ${unlocked ? C.goldDim : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`${unlocked ? "rounded-full" : "rounded-md"} flex items-center justify-center shrink-0`}
          style={{
            width: 30,
            height: 30,
            color: unlocked ? C.gold : C.textFaint,
            background: unlocked ? "rgba(203,163,95,0.12)" : C.raised2,
            border: `1px solid ${unlocked ? C.goldDim : C.hair}`,
          }}
          aria-hidden="true"
        >
          <Icon size={15} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-3">
            <div style={{ color: C.text, fontWeight: 800, fontSize: 13.5 }}>{item.name}</div>
            <div
              className="shrink-0 rounded-full px-2 py-0.5"
              style={{
                color: unlocked ? C.gold : C.textDim,
                background: unlocked ? "rgba(203,163,95,0.1)" : "transparent",
                fontFamily: FONT_MONO,
                fontSize: 11,
              }}
            >
              {unlocked ? "已完成" : `${item.current} / ${item.target}`}
            </div>
          </div>
          <div style={{ color: C.textFaint, fontSize: 11.5, marginTop: 3 }}>{item.desc}</div>
          {!unlocked && (
            <div className="mt-3">
              <ProgressBar value={item.percent} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AchievementRow({ item }) {
  const color = item.done ? C.gold : C.textFaint;
  const Icon = item.done ? Trophy : Lock;

  return (
    <div className="rounded-lg p-3" style={{ background: C.raised, border: `1px solid ${item.done ? C.goldDim : C.hair}` }}>
      <div className="flex justify-between gap-3">
        <div className="min-w-0">
          <div style={{ color: item.done ? C.gold : C.text, fontWeight: 800, fontSize: 13.5 }}>{item.name}</div>
          <div style={{ color: C.textFaint, fontSize: 11.5, marginTop: 3 }}>{item.desc}</div>
        </div>
        <div className="flex items-center gap-1.5" style={{ color, fontSize: 11.5, whiteSpace: "nowrap" }}>
          <Icon size={13} strokeWidth={1.8} aria-hidden="true" />
          {item.done ? "已解鎖" : "未解鎖"}
        </div>
      </div>
      {!item.done && (
        <div className="mt-3">
          <ProgressBar value={item.percent} />
          <div className="mt-1 text-right" style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 10.5 }}>
            {item.current} / {item.target}
          </div>
        </div>
      )}
    </div>
  );
}

function RewardRow({ name, reward, growth, last = false }) {
  return (
    <div
      className="py-2.5"
      style={{ borderBottom: last ? "none" : `1px solid rgba(42,44,54,0.62)` }}
    >
      <div style={{ color: C.text, fontSize: 12.5 }}>
        <span style={{ fontWeight: 700 }}>{name}</span>
        <span style={{ color: C.textFaint }}>｜</span>
        <span style={{ color: C.textDim }}>{reward}</span>
        {growth && <><span style={{ color: C.textFaint }}>｜</span><span style={{ color: C.gold }}>{growth}</span></>}
      </div>
    </div>
  );
}

export default function SystemTab({ ctx }) {
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [activeAchievementCategory, setActiveAchievementCategory] = useState("交易修煉");
  const [showRewards, setShowRewards] = useState(false);
  const historyDates = Object.keys(ctx.data.history).sort().reverse();
  const [mentorDate, setMentorDate] = useState(ctx.today);
  const mentorSession = ctx.data.history[mentorDate];
  const sessions = Object.values(ctx.data.history);
  const totalTrades = sessions.reduce((sum, session) => sum + session.trades.length, 0);
  const totalFollowedTrades = sessions.reduce(
    (sum, session) => sum + session.trades.filter((trade) => trade.followed_checklist).length,
    0
  );
  const totalSuccessfulWaits = sessions.reduce((sum, session) => sum + (session.successful_wait ? 1 : 0), 0);
  const totalJournalDays = sessions.reduce((sum, session) => sum + (session.journal ? 1 : 0), 0);
  const unlockedIds = ctx.data.achievementsUnlocked || [];
  const currentTitleBand =
    [...TITLE_BANDS].reverse().find(([level]) => level <= ctx.lvl.level) || TITLE_BANDS[0];
  const nextTitleBand = TITLE_BANDS.find(([level]) => level > ctx.lvl.level);
  const totalAchievementsCount = ACHIEVEMENTS.length;
  const totalTitlesCount = TITLE_BANDS.length;
  const unlockedTitlesCount = TITLE_BANDS.filter(([level]) => level <= ctx.lvl.level).length;
  const nextTitleLevel = nextTitleBand?.[0];

  const character = {
    title: currentTitleBand[2],
    level: ctx.lvl.level,
    integrity: ctx.data.identity.integrity,
  };
  const achievementProgress = ACHIEVEMENTS.map((achievement) => {
    const progressById = {
      first_wait: { current: totalSuccessfulWaits, target: 1 },
      checklist_30: { current: totalFollowedTrades, target: 30 },
      journal_7: { current: ctx.stats.journalStreak, target: 7 },
      clean_week: { current: ctx.stats.noViolationStreak, target: 7 },
      quest_100: { current: ctx.stats.questStreak, target: 100 },
      integrity_full: { current: character.integrity, target: 100 },
    };
    const progress = progressById[achievement.id] || { current: 0, target: 1 };
    const done = unlockedIds.includes(achievement.id) || achievement.check(ctx.stats);

    return {
      ...achievement,
      desc: achievement.id === "integrity_full" ? "Integrity 回到 100%" : achievement.desc,
      ...progress,
      done,
      remaining: Math.max(0, progress.target - progress.current),
      percent: done ? 100 : clampPercent(progress.current, progress.target),
    };
  });
  const unlockedAchievementsCount = achievementProgress.filter((item) => item.done).length;
  const nextUnlocks = achievementProgress
    .filter((item) => !item.done)
    .sort((a, b) => b.percent - a.percent || a.remaining - b.remaining)
    .slice(0, 2);
  const recentUnlocks = unlockedIds
    .slice()
    .reverse()
    .map((id) => achievementProgress.find((item) => item.id === id))
    .filter(Boolean)
    .slice(0, 3);
  const activeCategoryAchievements = achievementProgress.filter(
    (item) => getAchievementCategory(item.id) === activeAchievementCategory
  );
  const activeCategoryUnlockedCount = activeCategoryAchievements.filter((item) => item.done).length;

  return (
    <div>
      <div className="mb-5">
        <div style={{ color: C.text, fontSize: 21, fontWeight: 900 }}>成就</div>
        <div style={{ color: C.textDim, fontSize: 12.5, marginTop: 5 }}>稱號、成就與修煉里程碑</div>
      </div>

      <SectionLabel>修煉總覽</SectionLabel>
      <Card>
        <div className="grid grid-cols-3 text-center">
          <div className="px-2 py-1.5" style={{ borderRight: `1px solid ${C.hair}` }}>
            <Trophy size={18} color={C.gold} className="mx-auto mb-1.5" aria-hidden="true" />
            <div style={{ color: C.textFaint, fontSize: 10.5 }}>成就</div>
            <div style={{ color: C.gold, fontFamily: FONT_MONO, fontSize: 15, fontWeight: 800, marginTop: 3 }}>
              {unlockedAchievementsCount} / {totalAchievementsCount}
            </div>
          </div>
          <div className="px-2 py-1.5" style={{ borderRight: `1px solid ${C.hair}` }}>
            <Award size={18} color={C.gold} className="mx-auto mb-1.5" aria-hidden="true" />
            <div style={{ color: C.textFaint, fontSize: 10.5 }}>稱號</div>
            <div style={{ color: C.gold, fontFamily: FONT_MONO, fontSize: 15, fontWeight: 800, marginTop: 3 }}>
              {unlockedTitlesCount} / {totalTitlesCount}
            </div>
          </div>
          <div className="px-2 py-1.5">
            <Sparkles size={18} color={C.gold} className="mx-auto mb-1.5" aria-hidden="true" />
            <div style={{ color: C.textFaint, fontSize: 10.5 }}>里程碑</div>
            <div style={{ color: C.gold, fontFamily: FONT_MONO, fontSize: 15, fontWeight: 800, marginTop: 3 }}>
              {nextTitleLevel ? `Lv.${nextTitleLevel}` : "已完成"}
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 flex justify-between" style={{ borderTop: `1px solid ${C.hair}`, fontSize: 12 }}>
          <span style={{ color: C.textFaint }}>目前稱號：{character.title}</span>
        </div>
      </Card>

      <SectionLabel>最近解鎖</SectionLabel>
      <Card>
        <div className="space-y-3">
          {recentUnlocks.map((item) => <MilestoneRow key={item.id} item={item} unlocked />)}
          {recentUnlocks.length === 0 && (
            <div className="rounded-lg p-3" style={{ background: C.raised, border: `1px dashed ${C.goldDim}`, color: C.textDim, fontSize: 12 }}>
              尚未收錄成就徽章。
            </div>
          )}
          {recentUnlocks.length < 3 && (
            <div style={{ color: C.textFaint, fontSize: 11.5 }}>
              新的稱號與里程碑會在完成修煉後出現在這裡。
            </div>
          )}
        </div>
      </Card>

      <SectionLabel>接近完成</SectionLabel>
      <Card>
        <div className="space-y-3">
          {nextUnlocks.length > 0 ? (
            nextUnlocks.map((item) => <MilestoneRow key={item.id} item={item} />)
          ) : (
            <div style={{ color: C.textDim, fontSize: 13 }}>目前所有里程碑皆已完成。</div>
          )}
        </div>
      </Card>

      <SectionLabel>修煉統計</SectionLabel>
      <Card>
        <StatRow label="累積交易紀錄" value={totalTrades} />
        <StatRow label="累積符合策略交易" value={totalFollowedTrades} />
        <StatRow label="累積成功等待" value={totalSuccessfulWaits} />
        <StatRow label="累積日誌天數" value={totalJournalDays} />
        <StatRow label="連續無違規天數" value={ctx.stats.noViolationStreak} last />
      </Card>

      <SectionLabel>AI 導師設定</SectionLabel>
      <Card>
        <div style={{ color: C.textDim, fontSize: 12, lineHeight: 1.55, marginBottom: 10 }}>
          在此管理 API Key，並為指定日期產生或重跑紀律分析。
        </div>
        <select
          value={mentorDate}
          onChange={(event) => setMentorDate(event.target.value)}
          className="w-full rounded-lg px-3 py-2 mb-3 text-sm outline-none"
          style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
          aria-label="AI 導師分析日期"
        >
          {historyDates.map((date) => <option key={date} value={date}>{date}</option>)}
        </select>
        {mentorSession && (
          <AIMentorPanel
            date={mentorDate}
            session={mentorSession}
            onSave={(result) => ctx.updateHistoryDay(mentorDate, (day) => ({ ...day, aiMentor: result }))}
          />
        )}
      </Card>

      <button
        type="button"
        onClick={() => setShowAllAchievements((value) => !value)}
        className="w-full rounded-lg px-3 py-2.5 text-sm mt-4"
        style={{ background: C.raised2, border: `1px solid ${C.goldDim}`, color: C.text }}
      >
        {showAllAchievements ? "收合圖鑑" : "查看全部成就圖鑑"}
      </button>

      {showAllAchievements && (
        <Card className="mt-3">
          <div className="mb-4 grid grid-cols-2 gap-2" role="tablist" aria-label="成就分類">
            {["交易修煉", "紀律連續", "復盤日誌", "心魔抵抗"].map((category) => {
              const active = category === activeAchievementCategory;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveAchievementCategory(category)}
                  className="rounded-md px-3 py-2 text-xs font-extrabold transition-colors cursor-pointer"
                  style={{
                    color: active ? C.gold : C.textDim,
                    background: active ? "rgba(203,163,95,0.12)" : C.raised,
                    border: `1px solid ${active ? C.goldDim : C.hair}`,
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>
          <div className="mb-3">
            <div style={{ color: C.text, fontSize: 14, fontWeight: 900 }}>{activeAchievementCategory}</div>
            <div style={{ color: C.gold, fontFamily: FONT_MONO, fontSize: 11.5, marginTop: 3 }}>
              {activeCategoryUnlockedCount} / {activeCategoryAchievements.length} 已解鎖
            </div>
          </div>
          <div className="space-y-3">
            {activeCategoryAchievements.map((item) => <AchievementRow key={item.id} item={item} />)}
            {activeCategoryAchievements.length === 0 && (
              <div
                className="rounded-lg p-3"
                style={{ background: C.raised, border: `1px dashed ${C.hair}`, color: C.textDim, fontSize: 12 }}
              >
                此分類尚無成就。
              </div>
            )}
          </div>
        </Card>
      )}

      <button
        type="button"
        onClick={() => setShowRewards((value) => !value)}
        className="w-full rounded-lg px-3 py-2.5 text-sm mt-3"
        style={{ background: C.raised2, border: `1px solid ${MYSTIC_DIM}`, color: C.text }}
      >
        {showRewards ? "收合修煉獎勵" : "查看修煉獎勵圖鑑"}
      </button>

      {showRewards && (
        <Card className="mt-3">
          <RewardRow name="晨間校準" reward="EXP +10" growth="專注 +1" />
          <RewardRow name="交易前 Checklist" reward="EXP +20" growth="紀律 +1" />
          <RewardRow name="交易紀錄" reward="每日最高 EXP +70" growth="執行 +1" />
          <RewardRow name="成功等待" reward="EXP +50" growth="紀律 +1" />
          <RewardRow name="Decision Journal" reward="EXP +20" growth="觀察 +1" />
          <RewardRow name="抵抗 Boss" reward="EXP +30" last />
        </Card>
      )}
    </div>
  );
}
