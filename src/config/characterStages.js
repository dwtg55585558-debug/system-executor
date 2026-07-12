import apprenticeIdle from "../assets/characters/apprentice-idle.jpeg";
import apprenticeActivated from "../assets/characters/apprentice-activated-temp.jpeg";
import cultivatorIdle from "../assets/characters/cultivator-idle.jpeg";
import cultivatorActivated from "../assets/characters/cultivator-activated.jpeg";

export const CHARACTER_STAGES = {
  apprentice: {
    key: "apprentice",
    label: "見習者",
    idleImage: apprenticeIdle,
    activatedImage: apprenticeActivated,
    accent: "#8295aa",
    accentDim: "rgba(91, 111, 132, 0.42)",
    idleBackground: "#090d13",
    idleBorder: "rgba(66, 82, 99, 0.58)",
    activatedBackground: "linear-gradient(145deg, #101821 0%, #0c121a 58%, #090d13 100%)",
    activatedBorder: "rgba(112, 142, 169, 0.72)",
    activatedGlow: "rgba(103, 137, 168, 0.12)",
    activatedInnerBorder: "rgba(149, 174, 196, 0.12)",
  },
  cultivator: {
    key: "cultivator",
    label: "修煉者",
    idleImage: cultivatorIdle,
    activatedImage: cultivatorActivated,
    accent: "#7fa6c8",
    accentDim: "rgba(55, 91, 124, 0.48)",
    idleBackground: "#090d13",
    idleBorder: "rgba(66, 82, 99, 0.58)",
    activatedBackground: "linear-gradient(145deg, #101923 0%, #0c131b 58%, #090d13 100%)",
    activatedBorder: "rgba(105, 145, 180, 0.74)",
    activatedGlow: "rgba(86, 128, 165, 0.12)",
    activatedInnerBorder: "rgba(145, 177, 204, 0.13)",
  },
};

export function resolveCharacterStage(identity = {}) {
  const storedKey = identity.characterStage || identity.stage;
  const devKey = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get("characterStage")
    : null;
  return CHARACTER_STAGES[devKey] || CHARACTER_STAGES[storedKey] || CHARACTER_STAGES.apprentice;
}
