import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAppState } from "./hooks/useAppState.js";
import { useToast } from "./hooks/useToast.js";
import BottomNav from "./components/BottomNav.jsx";
import Toast from "./components/Toast.jsx";
import BossCardOverlay from "./components/BossCardOverlay.jsx";
import AchievementModal from "./components/AchievementModal.jsx";
import DayDetailModal from "./components/DayDetailModal.jsx";
import MorningCalibration from "./components/MorningCalibration.jsx";
import HomeTab from "./pages/HomeTab.jsx";
import PracticeTab from "./pages/PracticeTab.jsx";
import JournalTab from "./pages/JournalTab.jsx";
import SystemTab from "./pages/SystemTab.jsx";
import InsightTab from "./pages/InsightTab.jsx";
import { C, FONT_BODY } from "./styles/theme.js";

export default function App() {
  const [tab, setTab] = useState("home");
  const [bossCard, setBossCard] = useState(null);
  const [reviewDate, setReviewDate] = useState(null);
  const { toast, showToast } = useToast();
  const {
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
    clearUnlockedAchievement,
  } = useAppState(showToast);

  if (loading || !data) {
    return (
      <div
        style={{ background: C.void, color: C.textDim, fontFamily: FONT_BODY }}
        className="w-full h-full min-h-screen flex items-center justify-center"
      >
        <Loader2 className="animate-spin mr-2" size={18} />
        <span className="text-sm">載入身份資料中…</span>
      </div>
    );
  }

  const ctx = {
    data,
    day,
    today,
    lvl,
    stats,
    addExp,
    addReward,
    adjustIntegrity,
    updateDay,
    showToast,
    setBossCard,
    setReviewDate,
    updateHistoryDay,
  };

  if (!day.calibration_done) {
    return <MorningCalibration onContinue={() => updateDay((d) => ({ ...d, calibration_done: true }))} />;
  }

  return (
    <div style={{ background: C.void, color: C.text, fontFamily: FONT_BODY }} className="w-full min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-6 max-w-md mx-auto w-full">
        {tab === "home" && <HomeTab ctx={ctx} />}
        {tab === "practice" && <PracticeTab ctx={ctx} />}
        {tab === "journal" && <JournalTab ctx={ctx} />}
        {tab === "system" && <SystemTab ctx={ctx} onReset={resetProgress} />}
        {tab === "insight" && <InsightTab ctx={ctx} />}
      </div>

      <BottomNav tab={tab} setTab={setTab} />

      {toast && <Toast toast={toast} />}
      {bossCard && <BossCardOverlay boss={bossCard} onClose={() => setBossCard(null)} />}
      {unlockedAchievement && <AchievementModal achievement={unlockedAchievement} onClose={clearUnlockedAchievement} />}
      {reviewDate && data.history[reviewDate] && (
        <DayDetailModal
          date={reviewDate}
          session={data.history[reviewDate]}
          expLog={data.expLog}
          integrityLog={data.integrityLog}
          onClose={() => setReviewDate(null)}
          onSaveMentor={(result) => updateHistoryDay(reviewDate, (d) => ({ ...d, aiMentor: result }))}
        />
      )}
    </div>
  );
}
