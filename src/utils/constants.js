import { C } from "../styles/theme.js";

export const TITLE_BANDS = [
  [1, "Apprentice", "見習者"],
  [10, "Executor", "執行者"],
  [20, "Disciplined", "自律者"],
  [30, "Consistent", "恆定者"],
  [40, "Detached", "無執者"],
  [50, "System Trader", "系統交易者"],
  [60, "Professional", "專業者"],
];

export const QUOTES = [
  "今天的工作不是賺錢,而是執行策略。",
  "你不需要證明什麼,你只需要完成系統。",
  "等待符合策略,比亂做決定更值得驕傲。",
  "紀律是你留給未來自己的禮物。",
  "結果會浮動,系統不會。",
  "今天,你只對得起自己的規則。",
  "情緒是天氣,系統是季節。你活在季節裡。",
];

export const BOSSES = [
  { id: "fomo", name: "FOMO", desc: "害怕錯過,忍不住追高殺低" },
  { id: "overconfidence", name: "Overconfidence", desc: "自信過頭,忽略風控" },
  { id: "revenge", name: "Revenge Trade", desc: "虧損後想立刻拿回來" },
  { id: "fear", name: "Fear", desc: "該執行時因恐懼而猶豫" },
  { id: "greed", name: "Greed", desc: "贏了還想贏更多,忘記計畫" },
  { id: "needtoberight", name: "Need To Be Right", desc: "不願承認判斷錯誤" },
  { id: "impatience", name: "Impatience", desc: "等不了,提早進場" },
];

export const VIOLATION_TYPES = [
  { id: "emotional_trade", label: "情緒交易", exp: -80, integrity: 8, bossId: "greed" },
  { id: "no_stop_loss", label: "沒有停損", exp: -150, integrity: 14, bossId: "overconfidence" },
  { id: "fomo", label: "FOMO 進場", exp: -60, integrity: 6, bossId: "fomo" },
  { id: "revenge_trade", label: "報復交易", exp: -120, integrity: 12, bossId: "revenge" },
];

export const EMOTION_TAGS = ["平靜", "自信", "焦慮", "恐懼", "貪婪", "興奮", "沮喪", "麻木"];

export const CHECKLIST_ITEMS = [
  { id: "signal", label: "訊號符合我的系統" },
  { id: "rr", label: "風險報酬比可接受" },
  { id: "stop", label: "已設定停損價位" },
];

export const JOURNAL_GAP_WARNING = 3; // 連續幾天沒寫 Journal 才在首頁提醒

export const RISK_REASON_LABEL = {
  consecutive_stoploss: "最近兩筆交易都虧損出場",
  high_frequency: "短時間內交易頻率偏高",
  high_emotion_score: "今天已出現情緒波動跡象",
  existing_violation_today: "今天已經出現過違規",
  above_average_volume: "今天交易次數已超過你的平常均值",
};

export const EVENING_REFLECTION_REASONS = [
  { id: "no_setup", label: "沒有符合策略" },
  { id: "did_not_watch_market", label: "今天沒有看盤" },
  { id: "fear_based_avoidance", label: "因害怕而沒有交易" },
  { id: "rest_day", label: "今天休息" },
];

export const ACHIEVEMENTS = [
  {
    id: "first_wait",
    name: "第一次成功等待",
    desc: "整天沒有交易,仍完成修練",
    rarity: "common",
    check: (s) => s.totalSuccessfulWaits >= 1,
  },
  {
    id: "checklist_30",
    name: "紀律之刃",
    desc: "累積 30 筆符合策略的交易",
    rarity: "rare",
    check: (s) => s.totalFollowedTrades >= 30,
  },
  {
    id: "journal_7",
    name: "誠實七日",
    desc: "連續 7 天完成 Decision Journal",
    rarity: "common",
    check: (s) => s.journalStreak >= 7,
  },
  {
    id: "clean_week",
    name: "無瑕的一週",
    desc: "連續 7 天沒有任何違規",
    rarity: "rare",
    check: (s) => s.noViolationStreak >= 7,
  },
  {
    id: "quest_100",
    name: "百日修行者",
    desc: "連續 100 天完成每日任務",
    rarity: "legendary",
    check: (s) => s.questStreak >= 100,
  },
  {
    id: "integrity_full",
    name: "完整無瑕",
    desc: "System Integrity 回到 100%",
    rarity: "rare",
    check: (s) => s.integrity >= 100,
  },
];

export const RARITY_COLOR = { common: C.sage, rare: C.violet, legendary: C.gold };
