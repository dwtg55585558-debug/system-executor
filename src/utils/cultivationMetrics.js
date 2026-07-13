function safeTrades(day) {
  return Array.isArray(day?.trades) ? day.trades : [];
}

function safeViolations(day) {
  return Array.isArray(day?.violations) ? day.violations : [];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isMeaningfulSessionDay(day) {
  if (!day || typeof day !== "object") return false;
  return (
    day.morning_plan === true ||
    Boolean(day.journal) ||
    safeTrades(day).length > 0 ||
    day.successful_wait === true ||
    safeViolations(day).length > 0 ||
    day.stopLossMode === true
  );
}

export function isClosedLoopDay(day) {
  if (!day || typeof day !== "object") return false;
  const trades = safeTrades(day);
  const hasValidWaitCompletion =
    day.successful_wait === true && trades.length === 0;
  const hasValidTradeCompletion = trades.some(
    (trade) => trade?.followed_checklist === true
  );
  const hasValidCompletion =
    hasValidWaitCompletion || hasValidTradeCompletion;
  return day.morning_plan === true && Boolean(day.journal) && hasValidCompletion;
}

export function isZeroViolationClosedLoopDay(day) {
  return isClosedLoopDay(day) && safeViolations(day).length === 0;
}

export function isCompleteTradeRecord(trade) {
  if (!trade || typeof trade !== "object") return false;
  return (
    hasText(trade.accountType) &&
    hasText(trade.symbol) &&
    hasText(trade.direction) &&
    hasText(trade.entry_reason) &&
    typeof trade.followed_checklist === "boolean" &&
    trade.stop_loss_set === true &&
    Number.isFinite(trade.r_value) &&
    Number.isFinite(trade.pnl)
  );
}

function historyEntries(history) {
  if (!history || typeof history !== "object" || Array.isArray(history)) return [];
  return Object.entries(history).sort(([dateA], [dateB]) => dateA.localeCompare(dateB));
}

export function computeCultivationMetrics(history, options = {}) {
  const entries = historyEntries(history);
  const todayKey =
    typeof options?.todayKey === "string" ? options.todayKey : null;
  let meaningfulSessionDays = 0;
  let closedLoopDays = 0;
  let zeroViolationClosedLoopDays = 0;
  let compliantStrategySamples = 0;
  let completeTradeRecords = 0;
  let successfulWaitDays = 0;
  let journalDays = 0;
  let longestDisciplineStreak = 0;
  let runningDisciplineStreak = 0;

  for (const [, day] of entries) {
    const trades = safeTrades(day);
    const meaningful = isMeaningfulSessionDay(day);
    const closedLoop = isClosedLoopDay(day);
    const zeroViolationClosedLoop = isZeroViolationClosedLoopDay(day);

    if (meaningful) meaningfulSessionDays += 1;
    if (closedLoop) closedLoopDays += 1;
    if (zeroViolationClosedLoop) zeroViolationClosedLoopDays += 1;
    compliantStrategySamples += trades.filter(
      (trade) => trade?.followed_checklist === true
    ).length;
    completeTradeRecords += trades.filter(isCompleteTradeRecord).length;
    if (day?.successful_wait === true) successfulWaitDays += 1;
    if (day?.journal) journalDays += 1;

    if (!meaningful) continue;
    if (zeroViolationClosedLoop) {
      runningDisciplineStreak += 1;
      longestDisciplineStreak = Math.max(
        longestDisciplineStreak,
        runningDisciplineStreak
      );
    } else {
      runningDisciplineStreak = 0;
    }
  }

  let currentDisciplineStreak = 0;
  const meaningfulEntries = entries.filter(([, day]) => isMeaningfulSessionDay(day));
  let currentIndex = meaningfulEntries.length - 1;
  const latestMeaningfulEntry = meaningfulEntries[currentIndex];
  if (latestMeaningfulEntry?.[0] === todayKey) {
    const today = latestMeaningfulEntry[1];
    const todayIsStillOpen = !today?.journal && safeViolations(today).length === 0;
    if (todayIsStillOpen) currentIndex -= 1;
  }

  for (let index = currentIndex; index >= 0; index -= 1) {
    if (!isZeroViolationClosedLoopDay(meaningfulEntries[index][1])) break;
    currentDisciplineStreak += 1;
  }

  return {
    meaningfulSessionDays,
    closedLoopDays,
    zeroViolationClosedLoopDays,
    compliantStrategySamples,
    completeTradeRecords,
    successfulWaitDays,
    journalDays,
    currentDisciplineStreak,
    longestDisciplineStreak,
  };
}
