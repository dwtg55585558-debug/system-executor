const apprenticeIdle = new URL("../assets/characters/apprentice-idle.jpeg", import.meta.url).href;
const apprenticeActivated = new URL(
  "../assets/characters/apprentice-activated-temp.jpeg",
  import.meta.url
).href;
const cultivatorIdle = new URL("../assets/characters/cultivator-idle.jpeg", import.meta.url).href;
const cultivatorActivated = new URL(
  "../assets/characters/cultivator-activated.jpeg",
  import.meta.url
).href;

export const CHARACTER_STAGE_ORDER = [
  "apprentice",
  "cultivator",
  "executor",
  "awakened",
  "master",
];

const SHARED_IDLE_TOKENS = {
  idleBackground: "#090d13",
  idleBorder: "rgba(66, 82, 99, 0.58)",
};

export const CHARACTER_STAGES = {
  apprentice: {
    key: "apprentice",
    label: "見習者",
    order: 1,
    minLevel: 1,
    minClosedLoopDays: 0,
    minZeroViolationDays: 0,
    assetReady: true,
    unlockEnabled: true,
    idleImage: apprenticeIdle,
    activatedImage: apprenticeActivated,
    identityAccent: "#8FA2B5",
    identityAccentDim: "rgba(143, 162, 181, 0.16)",
    identityAccentBorder: "rgba(143, 162, 181, 0.42)",
    identityGlow: "rgba(143, 162, 181, 0.14)",
    accent: "#8295aa",
    accentDim: "rgba(91, 111, 132, 0.42)",
    ...SHARED_IDLE_TOKENS,
    activatedBackground: "linear-gradient(145deg, #101821 0%, #0c121a 58%, #090d13 100%)",
    activatedBorder: "rgba(112, 142, 169, 0.72)",
    activatedGlow: "rgba(103, 137, 168, 0.12)",
    activatedInnerBorder: "rgba(149, 174, 196, 0.12)",
  },
  cultivator: {
    key: "cultivator",
    label: "修煉者",
    order: 2,
    minLevel: 5,
    minClosedLoopDays: 7,
    minZeroViolationDays: 5,
    assetReady: true,
    unlockEnabled: true,
    idleImage: cultivatorIdle,
    activatedImage: cultivatorActivated,
    identityAccent: "#6F96C8",
    identityAccentDim: "rgba(111, 150, 200, 0.17)",
    identityAccentBorder: "rgba(111, 150, 200, 0.44)",
    identityGlow: "rgba(111, 150, 200, 0.15)",
    accent: "#7fa6c8",
    accentDim: "rgba(55, 91, 124, 0.48)",
    ...SHARED_IDLE_TOKENS,
    activatedBackground: "linear-gradient(145deg, #101923 0%, #0c131b 58%, #090d13 100%)",
    activatedBorder: "rgba(105, 145, 180, 0.74)",
    activatedGlow: "rgba(86, 128, 165, 0.12)",
    activatedInnerBorder: "rgba(145, 177, 204, 0.13)",
  },
  executor: {
    key: "executor",
    label: "執行者",
    order: 3,
    minLevel: 12,
    minClosedLoopDays: 30,
    minZeroViolationDays: 20,
    assetReady: false,
    unlockEnabled: false,
    idleImage: null,
    activatedImage: null,
    identityAccent: "#5FAF92",
    identityAccentDim: "rgba(95, 175, 146, 0.17)",
    identityAccentBorder: "rgba(95, 175, 146, 0.44)",
    identityGlow: "rgba(95, 175, 146, 0.15)",
    accent: "#cba35f",
    accentDim: "rgba(139, 103, 50, 0.46)",
    ...SHARED_IDLE_TOKENS,
    activatedBackground: "linear-gradient(145deg, #1b1710 0%, #12110e 58%, #090d13 100%)",
    activatedBorder: "rgba(203, 163, 95, 0.72)",
    activatedGlow: "rgba(203, 163, 95, 0.12)",
    activatedInnerBorder: "rgba(224, 194, 139, 0.13)",
  },
  awakened: {
    key: "awakened",
    label: "覺醒者",
    order: 4,
    minLevel: 25,
    minClosedLoopDays: 90,
    minZeroViolationDays: 60,
    assetReady: false,
    unlockEnabled: false,
    idleImage: null,
    activatedImage: null,
    identityAccent: "#9B7FD1",
    identityAccentDim: "rgba(155, 127, 209, 0.17)",
    identityAccentBorder: "rgba(155, 127, 209, 0.44)",
    identityGlow: "rgba(155, 127, 209, 0.15)",
    accent: "#9a83c9",
    accentDim: "rgba(103, 78, 151, 0.46)",
    ...SHARED_IDLE_TOKENS,
    activatedBackground: "linear-gradient(145deg, #171321 0%, #111019 58%, #090d13 100%)",
    activatedBorder: "rgba(154, 131, 201, 0.72)",
    activatedGlow: "rgba(154, 131, 201, 0.12)",
    activatedInnerBorder: "rgba(190, 171, 225, 0.13)",
  },
  master: {
    key: "master",
    label: "掌控者",
    order: 5,
    minLevel: 45,
    minClosedLoopDays: 180,
    minZeroViolationDays: 120,
    assetReady: false,
    unlockEnabled: false,
    idleImage: null,
    activatedImage: null,
    identityAccent: "#D2AE68",
    identityAccentDim: "rgba(210, 174, 104, 0.17)",
    identityAccentBorder: "rgba(210, 174, 104, 0.46)",
    identityGlow: "rgba(210, 174, 104, 0.16)",
    accent: "#c7b27a",
    accentDim: "rgba(129, 107, 58, 0.46)",
    ...SHARED_IDLE_TOKENS,
    activatedBackground: "linear-gradient(145deg, #1d1a12 0%, #14130f 58%, #090d13 100%)",
    activatedBorder: "rgba(199, 178, 122, 0.74)",
    activatedGlow: "rgba(199, 178, 122, 0.12)",
    activatedInnerBorder: "rgba(224, 209, 166, 0.13)",
  },
};

const LEGACY_STAGE_MAP = {
  apprentice: "apprentice",
  cultivator: "cultivator",
  executor: "executor",
  awakened: "awakened",
  master: "master",
  見習者: "apprentice",
  修煉者: "cultivator",
  執行者: "executor",
  覺醒者: "awakened",
  掌控者: "master",
  修煉初期: "apprentice",
};

export function isValidCharacterStageKey(value) {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(CHARACTER_STAGES, value);
}

export function mapLegacyCharacterStage(value) {
  return typeof value === "string" ? LEGACY_STAGE_MAP[value] || null : null;
}

export function resolveStoredCharacterStageKey(identity = {}) {
  if (isValidCharacterStageKey(identity?.characterStage)) return identity.characterStage;
  return mapLegacyCharacterStage(identity?.stage) || "apprentice";
}

export function migrateCharacterStage(identity = {}) {
  return {
    ...identity,
    characterStage: resolveStoredCharacterStageKey(identity),
  };
}

export function getCharacterStagePreviewKey(options = {}) {
  const isDev = options.isDev ?? Boolean(import.meta.env?.DEV);
  if (!isDev) return null;

  const search =
    options.search ??
    (typeof window !== "undefined" && window.location ? window.location.search : "");
  const override = new URLSearchParams(search).get("characterStage");
  return isValidCharacterStageKey(override) ? override : null;
}

export function resolveStoredCharacterStage(identity = {}) {
  const key = resolveStoredCharacterStageKey(identity);
  return CHARACTER_STAGES[key] || CHARACTER_STAGES.apprentice;
}

export function resolvePreviewCharacterStage(identity = {}, options = {}) {
  const key = getCharacterStagePreviewKey(options) || resolveStoredCharacterStageKey(identity);
  return CHARACTER_STAGES[key] || CHARACTER_STAGES.apprentice;
}

export function resolveCharacterStage(identity = {}) {
  return resolveStoredCharacterStage(identity);
}

export function getStageRequirements(stageKey) {
  const stage = CHARACTER_STAGES[stageKey];
  if (!stage) return null;
  return {
    stageKey: stage.key,
    minLevel: stage.minLevel,
    minClosedLoopDays: stage.minClosedLoopDays,
    minZeroViolationDays: stage.minZeroViolationDays,
    unlockEnabled: stage.unlockEnabled,
    assetReady: stage.assetReady,
  };
}

export function getNextCharacterStage(stageKey) {
  const currentIndex = CHARACTER_STAGE_ORDER.indexOf(stageKey);
  if (currentIndex < 0 || currentIndex >= CHARACTER_STAGE_ORDER.length - 1) return null;
  return CHARACTER_STAGES[CHARACTER_STAGE_ORDER[currentIndex + 1]];
}

function numericRequirement(currentValue, targetValue) {
  const current = Number.isFinite(Number(currentValue)) ? Number(currentValue) : 0;
  const target = Number.isFinite(Number(targetValue)) ? Number(targetValue) : 0;
  const complete = current >= target;
  const progress = target <= 0 ? 100 : Math.max(0, Math.min(100, Math.round((current / target) * 100)));
  return {
    current,
    target,
    remaining: Math.max(0, target - current),
    complete,
    progress,
  };
}

function booleanRequirement(currentValue) {
  const complete = currentValue === true;
  return {
    current: complete,
    target: true,
    remaining: complete ? 0 : 1,
    complete,
    progress: complete ? 100 : 0,
  };
}

export function getNextStageProgress(currentStageKey, level, metrics = {}) {
  const currentStage = CHARACTER_STAGES[currentStageKey] || CHARACTER_STAGES.apprentice;
  const targetStage = getNextCharacterStage(currentStage.key);
  if (!targetStage) {
    return {
      currentStage,
      targetStage: null,
      requirements: null,
      eligible: false,
    };
  }

  const requirements = {
    level: numericRequirement(level, targetStage.minLevel),
    closedLoopDays: numericRequirement(metrics.closedLoopDays, targetStage.minClosedLoopDays),
    zeroViolationClosedLoopDays: numericRequirement(
      metrics.zeroViolationClosedLoopDays,
      targetStage.minZeroViolationDays
    ),
    unlockEnabled: booleanRequirement(targetStage.unlockEnabled),
    assetReady: booleanRequirement(targetStage.assetReady),
  };
  const eligible = Object.values(requirements).every((requirement) => requirement.complete);

  return {
    currentStage,
    targetStage,
    requirements,
    eligible,
  };
}

export function getStageEligibility(currentStageKey, level, metrics = {}) {
  return getNextStageProgress(currentStageKey, level, metrics);
}
