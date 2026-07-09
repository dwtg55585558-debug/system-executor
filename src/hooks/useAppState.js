import { useState, useEffect, useMemo, useCallback } from "react";
import { loadState, saveState, clearState } from "../utils/storage.js";
import { emptyDay, defaultState, todayStr, computeStats, uid } from "../utils/helpers.js";
import { computeLevel } from "../utils/levels.js";
import { ACHIEVEMENTS } from "../utils/constants.js";
import { INITIAL_CHARACTER_STATS } from "../data/character.js";

function migrateIdentity(identity = {}) {
  return {
    ...identity,
    totalExp: identity.totalExp ?? 0,
    integrity: identity.integrity ?? 100,
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
          identity: migrateIdentity(parsed.identity),
        };
        Object.values(migrated.history || {}).forEach((s) => {
          (s.trades || []).forEach((t) => {
            if (!t.id) t.id = uid();
          });
          if (!s.riskEvents) s.riskEvents = [];
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

  const resetProgress = useCallback(() => {
    if (window.confirm("確定要重置所有進度嗎?此動作無法復原。")) {
      const fresh = defaultState();
      setData(fresh);
      saveState(fresh);
      showToast && showToast("已重置身份系統", "info");
    }
  }, [showToast]);

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
    updateDay,
    updateHistoryDay,
    resetProgress,
    unlockedAchievement,
    clearUnlockedAchievement: () => setUnlockedAchievement(null),
  };
}
