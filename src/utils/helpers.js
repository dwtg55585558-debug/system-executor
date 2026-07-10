import { VIOLATION_TYPES } from "./constants.js";
import { INITIAL_CHARACTER_STATS } from "../data/character.js";

export function todayStr(d = new Date()) {
  const y = d.getFullYear(),
    m = String(d.getMonth() + 1).padStart(2, "0"),
    day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyDay(date) {
  return {
    date,
    calibration_done: false,
    morning_plan: false,
    workout: false,
    reading: false,
    checklist_pass: false,
    checklistChecks: {},
    trades: [],
    stopLossMode: false,
    successful_wait: false,
    violations: [],
    bossResists: [],
    journal: null,
    riskEvents: [],
    eveningReflection: null,
    aiMentor: null,
  };
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

export function dailyBaselineSnapshot(data, date = todayStr()) {
  const day = data.history?.[date] || emptyDay(date);
  const snapshotDay = {
    date: day.date || date,
    calibration_done: day.calibration_done,
    morning_plan: day.morning_plan,
    identityStatement: day.identityStatement,
    workout: day.workout,
    reading: day.reading,
    checklist_pass: day.checklist_pass,
    checklistChecks: cloneValue(day.checklistChecks || {}),
    trades: cloneValue(day.trades || []),
    strategy_trade: day.strategy_trade,
    successful_wait: day.successful_wait,
    violations: cloneValue(day.violations || []),
    bossResists: cloneValue(day.bossResists || []),
    journal: cloneValue(day.journal || null),
    riskEvents: cloneValue(day.riskEvents || []),
    eveningReflection: cloneValue(day.eveningReflection || null),
    aiMentor: cloneValue(day.aiMentor || null),
    stopLossMode: day.stopLossMode,
  };

  if (day.claimedRewards !== undefined) {
    snapshotDay.claimedRewards = cloneValue(day.claimedRewards);
  }

  return {
    date,
    createdAt: Date.now(),
    day: snapshotDay,
    identity: {
      totalExp: data.identity.totalExp,
      integrity: data.identity.integrity,
      energy: data.identity.energy,
      maxEnergy: data.identity.maxEnergy,
      energyDate: data.identity.energyDate,
      stats: cloneValue(data.identity.stats),
    },
    expLog: cloneValue(data.expLog || []),
    integrityLog: cloneValue(data.integrityLog || []),
    achievementsUnlocked: cloneValue(data.achievementsUnlocked || []),
  };
}

export function defaultState() {
  const today = todayStr();

  const state = {
    identity: {
      name: "",
      totalExp: 0,
      integrity: 100,
      energy: 40,
      maxEnergy: 40,
      energyDate: today,
      stats: INITIAL_CHARACTER_STATS,
    },
    history: { [today]: emptyDay(today) },
    expLog: [],
    integrityLog: [{ date: today, value: 100 }],
    achievementsUnlocked: [],
    dailySnapshots: {},
  };

  state.dailySnapshots[today] = dailyBaselineSnapshot(state, today);
  return state;
}

/* Decision Risk Monitor: five-condition detector, replaces a fixed "Nth trade" rule */
export function detectRiskConditions(day, history) {
  const reasons = [];
  const trades = day.trades;

  // 1. 連續兩筆停損(以虧損出場為代理指標)
  if (trades.length >= 2) {
    const lastTwo = trades.slice(-2);
    if (lastTwo.every((t) => t.pnl != null && t.pnl < 0)) {
      reasons.push("consecutive_stoploss");
    }
  }

  // 2. 短時間大量交易(15 分鐘內 2 筆以上)
  if (trades.length >= 2) {
    const lastTwoTs = trades.slice(-2).map((t) => t.ts);
    if (lastTwoTs[1] - lastTwoTs[0] < 15 * 60 * 1000) {
      reasons.push("high_frequency");
    }
  }

  // 3. 情緒分數偏高(以今天違規+抵抗誘惑次數做代理)
  const emotionScore = day.violations.length * 2 + day.bossResists.length;
  if (emotionScore >= 2) {
    reasons.push("high_emotion_score");
  }

  // 4. 今天已出現違規
  if (day.violations.length > 0) {
    reasons.push("existing_violation_today");
  }

  // 5. 今天交易次數超過平常均值(至少要有 3 天歷史紀錄才計算)
  const pastDays = Object.values(history).filter((s) => s.date !== day.date && s.trades.length > 0);
  if (pastDays.length >= 3) {
    const avg = pastDays.reduce((s, d) => s + d.trades.length, 0) / pastDays.length;
    if (trades.length + 1 > avg * 1.5) {
      reasons.push("above_average_volume");
    }
  }

  return reasons;
}

export function journalGapDays(history) {
  const dates = Object.keys(history).sort();
  if (dates.length === 0) return 0;
  const earliest = dates[0];
  let count = 0;
  let cursor = new Date();
  cursor.setDate(cursor.getDate() - 1); // start from yesterday
  for (let i = 0; i < 30; i++) {
    const key = todayStr(cursor);
    if (key < earliest) break;
    const s = history[key];
    if (s && s.journal) break;
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function computeStats(data) {
  if (!data)
    return {
      integrity: 100,
      totalSuccessfulWaits: 0,
      totalFollowedTrades: 0,
      journalStreak: 0,
      noViolationStreak: 0,
      questStreak: 0,
    };
  const dates = Object.keys(data.history).sort();
  let totalSuccessfulWaits = 0;
  let totalFollowedTrades = 0;
  for (const d of dates) {
    const s = data.history[d];
    if (s.successful_wait) totalSuccessfulWaits++;
    totalFollowedTrades += s.trades.filter((t) => t.followed_checklist).length;
  }
  const rev = [...dates].reverse();
  const dayComplete = (s) =>
    s.morning_plan &&
    s.workout &&
    s.reading &&
    s.checklist_pass &&
    !!s.journal &&
    (s.successful_wait || s.trades.some((t) => t.followed_checklist));
  let journalStreak = 0,
    noViolationStreak = 0,
    questStreak = 0;
  for (const d of rev) {
    if (data.history[d].journal) journalStreak++;
    else break;
  }
  for (const d of rev) {
    if (data.history[d].violations.length === 0) noViolationStreak++;
    else break;
  }
  for (const d of rev) {
    if (dayComplete(data.history[d])) questStreak++;
    else break;
  }
  return {
    integrity: data.identity.integrity,
    totalSuccessfulWaits,
    totalFollowedTrades,
    journalStreak,
    noViolationStreak,
    questStreak,
  };
}

export function violationBoss(violationId) {
  return VIOLATION_TYPES.find((v) => v.id === violationId);
}
