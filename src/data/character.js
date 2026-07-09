export const INITIAL_CHARACTER_STATS = {
  focus: 10,
  discipline: 10,
  mindset: 10,
  execution: 10,
  observation: 10,
  insight: 10
};

export const initialCharacter = {
  id: "char_001",

  name: "執行者 Enzo",

  title: "初探者",

  level: 1,

  exp: 0,

  nextLevelExp: 100,

  stage: "修煉初期",

  energy: 40,

  maxEnergy: 40,

  stats: INITIAL_CHARACTER_STATS,

  currency: {
    gold: 0,
    crystal: 0
  },

  streak: {
    login: 0,
    strategy: 0
  }
};
