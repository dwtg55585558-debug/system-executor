import { TITLE_BANDS } from "./constants.js";

export const thresholdFor = (level) => 100 + (level - 1) * 45;

export const LEVEL_CUM = (() => {
  const arr = [0, 0];
  for (let l = 2; l <= 61; l++) arr[l] = arr[l - 1] + thresholdFor(l - 1);
  return arr;
})();

export function computeLevel(totalExp) {
  const exp = Math.max(0, totalExp);
  let level = 1;
  for (let l = 1; l <= 60; l++) {
    if (exp >= LEVEL_CUM[l]) level = l;
    else break;
  }
  const into = exp - LEVEL_CUM[level];
  const need = level >= 60 ? 0 : thresholdFor(level);
  return { level, expInto: into, expToNext: need };
}

export function titleForLevel(level) {
  let t = TITLE_BANDS[0];
  for (const band of TITLE_BANDS) if (band[0] <= level) t = band;
  return t[2];
}
