import { useState, useEffect, useMemo, useCallback } from "react";
import { loadState, saveState, clearState } from "../utils/storage.js";
import {
  emptyDay,
  defaultState,
  todayStr,
  computeStats,
  uid,
  dailyBaselineSnapshot,
} from "../utils/helpers.js";
import { computeLevel } from "../utils/levels.js";
import { ACHIEVEMENTS } from "../utils/constants.js";
import { INITIAL_CHARACTER_STATS } from "../data/character.js";

const DAILY_MAX_ENERGY = 40;

function restoreTodayFromBaseline(prev, date, baseline) {
  const empty = emptyDay(date);
  const baselineDay = baseline.day || {};
  const nextDay = {
    ...empty,
    calibration_done: baselineDay.calibration_done ?? empty.calibration_done,
    morning_plan: baselineDay.morning_plan ?? empty.morning_plan,
    workout: baselineDay.workout ?? empty.workout,
    reading: baselineDay.reading ?? empty.reading,
    checklist_pass: baselineDay.checklist_pass ?? empty.checklist_pass,
    checklistChecks: { ...(baselineDay.checklistChecks || empty.checklistChecks) },
    trades: baselineDay.trades ? [...baselineDay.trades] : empty.trades,
    strategy_trade: baselineDay.strategy_trade,
    successful_wait: baselineDay.successful_wait ?? empty.successful_wait,
    violations: baselineDay.violations ? [...baselineDay.violations] : empty.violations,
    bossResists: baselineDay.bossResists ? [...baselineDay.bossResists] : empty.bossResists,
    journal: baselineDay.journal ?? empty.journal,
    riskEvents: baselineDay.riskEvents ? [...baselineDay.riskEvents] : empty.riskEvents,
    eveningReflection: baselineDay.eveningReflection ?? empty.eveningReflection,
    aiMentor: baselineDay.aiMentor ?? empty.aiMentor,
    stopLossMode: baselineDay.stopLossMode ?? empty.stopLossMode,
  };

  if (baselineDay.identityStatement !== undefined) {
    nextDay.identityStatement = baselineDay.identityStatement;
  } else {
    delete nextDay.identityStatement;
  }

  if (baselineDay.claimedRewards !== undefined) {
    nextDay.claimedRewards = { ...baselineDay.claimedRewards };
  } else {
    delete nextDay.claimedRewards;
  }

  return {
    ...prev,
    identity: {
      ...prev.identity,
      totalExp: baseline.identity?.totalExp ?? prev.identity.totalExp,
      integrity: baseline.identity?.integrity ?? prev.identity.integrity,
      energy: baseline.identity?.energy ?? prev.identity.energy,
      maxEnergy: baseline.identity?.maxEnergy ?? prev.identity.maxEnergy,
      energyDate: baseline.identity?.energyDate ?? date,
      stats: {
        ...INITIAL_CHARACTER_STATS,
        ...(baseline.identity?.stats || prev.identity.stats || {}),
      },
    },
    history: {
      ...prev.history,
      [date]: nextDay,
    },
    expLog: baseline.expLog ? [...baseline.expLog] : prev.expLog,
    integrityLog: baseline.integrityLog ? [...baseline.integrityLog] : prev.integrityLog,
    achievementsUnlocked: baseline.achievementsUnlocked
      ? [...baseline.achievementsUnlocked]
      : prev.achievementsUnlocked,
  };
}

function migrateIdentity(identity = {}, today = todayStr()) {
  const isToday = identity.energyDate === today;
  const energy = isToday ? identity.energy ?? DAILY_MAX_ENERGY : DAILY_MAX_ENERGY;

  return {
    ...identity,
    name: identity.name ?? "執行者",
    totalExp: identity.totalExp ?? 0,
    integrity: identity.integrity ?? 100,
    energy,
    maxEnergy: DAILY_MAX_ENERGY,
    energyDate: today,
    stats: {
      ...INITIAL_CHARACTER_STATS,
      ...(identity.stats || {}),
    },
  };
}

export function useAppState(showToast) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [unlockedAchievement, setUnlockedAchievement] = useState(null);
  const today = todayStr();

  // load once on mount
  useEffect(() => {
    (async () => {
      const parsed = await loadState();
      if (parsed) {
        const migrated = {
          ...parsed,
          identity: migrateIdentity(parsed.identity, today),
          dailySnapshots: parsed.dailySnapshots || {},
        };
        Object.values(migrated.history || {}).forEach((s) => {
          (s.trades || []).forEach((t) => {
            if (!t.id) t.id = uid();
          });
          if (!s.riskEvents) s.riskEvents = [];
          if (s.stopLossMode === undefined) s.stopLossMode = false;
          if (s.eveningReflection === undefined) s.eveningReflection = null;
          if (s.calibration_done === undefined) s.calibration_done = true; // don't retroactively force calibration on old days
          if (s.aiMentor === undefined) s.aiMentor = null;
        });
        setData(migrated);
      } else {
        setData(defaultState());
      }
      setLoading(false);
    })();
  }, []);

  // persist on change (debounced)
  useEffect(() => {
    if (loading || !data) return;
    const t = setTimeout(() => {
      saveState(data);
    }, 250);
    return () => clearTimeout(t);
  }, [data, loading]);

  // ensure today's session exists
  useEffect(() => {
    if (!data) return;
    if (!data.history[today]) {
      setData((prev) => ({
        ...prev,
        history: { ...prev.history, [today]: emptyDay(today) },
        dailySnapshots: {
          ...(prev.dailySnapshots || {}),
          [today]: dailyBaselineSnapshot(
            { ...prev, history: { ...prev.history, [today]: emptyDay(today) } },
            today
          ),
        },
      }));
    }
  }, [data, today]);

  const day = data ? data.history[today] || emptyDay(today) : emptyDay(today);
  const lvl = data ? computeLevel(data.identity.totalExp) : computeLevel(0);
  const stats = useMemo(() => computeStats(data), [data]);

  // achievement check
  useEffect(() => {
    if (!data) return;
    const toUnlock = ACHIEVEMENTS.filter(
      (a) => !data.achievementsUnlocked.includes(a.id) && a.check(stats)
    );
    if (toUnlock.length > 0) {
      setData((prev) => ({
        ...prev,
        achievementsUnlocked: [...prev.achievementsUnlocked, ...toUnlock.map((a) => a.id)],
      }));
      setUnlockedAchievement(toUnlock[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  const addExp = useCallback(
    (amount, label) => {
      setData((prev) => {
        const newTotal = Math.max(0, prev.identity.totalExp + amount);
        const expLog = [
          ...prev.expLog,
          { date: today, amount, label, total: newTotal, ts: Date.now() },
        ];
        return { ...prev, identity: { ...prev.identity, totalExp: newTotal }, expLog };
      });
    },
    [today]
  );

  const addReward = useCallback(
    ({ exp, label, statKey, statAmount = 1 }) => {
      setData((prev) => {
        const identity = migrateIdentity(prev.identity);
        const newTotal = Math.max(0, identity.totalExp + exp);
        const nextStats = statKey
          ? {
              ...identity.stats,
              [statKey]: (identity.stats[statKey] ?? 0) + statAmount,
            }
          : identity.stats;
        const expLog = [
          ...prev.expLog,
          { date: today, amount: exp, label, total: newTotal, ts: Date.now() },
        ];
        return {
          ...prev,
          identity: { ...identity, totalExp: newTotal, stats: nextStats },
          expLog,
        };
      });
    },
    [today]
  );

  const adjustIntegrity = useCallback(
    (delta) => {
      setData((prev) => {
        const value = Math.max(0, Math.min(100, prev.identity.integrity + delta));
        return {
          ...prev,
          identity: { ...prev.identity, integrity: value },
          integrityLog: [...prev.integrityLog, { date: today, value }],
        };
      });
    },
    [today]
  );

  const updateIdentityName = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    setData((prev) => ({
      ...prev,
      identity: { ...prev.identity, name: trimmed },
    }));
    return true;
  }, []);

  const spendEnergy = useCallback(
    (amount) => {
      setData((prev) => {
        const identity = migrateIdentity(prev.identity, today);
        return {
          ...prev,
          identity: { ...identity, energy: identity.energy - amount },
        };
      });
    },
    [today]
  );

  const updateDay = useCallback(
    (mutator) => {
      setData((prev) => {
        const d = { ...(prev.history[today] || emptyDay(today)) };
        const next = mutator(d) || d;
        return { ...prev, history: { ...prev.history, [today]: next } };
      });
    },
    [today]
  );

  const updateHistoryDay = useCallback((date, mutator) => {
    setData((prev) => {
      const s = { ...(prev.history[date] || emptyDay(date)) };
      const next = mutator(s) || s;
      return { ...prev, history: { ...prev.history, [date]: next } };
    });
  }, []);

  const resetTodayToBaseline = useCallback(() => {
    const hasBaseline = !!data?.dailySnapshots?.[today];

    setData((prev) => {
      const snapshots = prev.dailySnapshots || {};
      const baseline = snapshots[today];

      if (!baseline) {
        const next = {
          ...prev,
          dailySnapshots: {
            ...snapshots,
            [today]: dailyBaselineSnapshot(prev, today),
          },
        };
        saveState(next);
        return next;
      }

      const next = restoreTodayFromBaseline(prev, today, baseline);
      saveState(next);
      return next;
    });

    showToast &&
      showToast(hasBaseline ? "今日已重置為開始狀態" : "已建立今日起始快照", "info");
  }, [data, showToast, today]);

  const resetAllData = useCallback(() => {
    const fresh = defaultState();
    clearState();
    setData(fresh);
    saveState(fresh);
    showToast && showToast("角色已重置", "info");
  }, [showToast]);

  const resetProgress = useCallback(() => {
    if (window.confirm("確定要重置所有進度嗎?此動作無法復原。")) {
      resetAllData();
    }
  }, [resetAllData]);

  return {
    loading,
    data,
    today,
    day,
    lvl,
    stats,
    addExp,
    addReward,
    adjustIntegrity,
    updateIdentityName,
    spendEnergy,
    updateDay,
    updateHistoryDay,
    resetTodayToBaseline,
    resetAllData,
    resetProgress,
    unlockedAchievement,
    clearUnlockedAchievement: () => setUnlockedAchievement(null),
  };
}
