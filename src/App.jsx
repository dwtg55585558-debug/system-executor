import React, { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAppState } from "./hooks/useAppState.js";
import { useToast } from "./hooks/useToast.js";
import BottomNav from "./components/BottomNav.jsx";
import Toast from "./components/Toast.jsx";
import BossCardOverlay from "./components/BossCardOverlay.jsx";
import AchievementModal from "./components/AchievementModal.jsx";
import DayDetailModal from "./components/DayDetailModal.jsx";
import MorningCalibration from "./components/MorningCalibration.jsx";
import CultivatorNameModal from "./components/CultivatorNameModal.jsx";
import SuccessfulWaitModal from "./components/SuccessfulWaitModal.jsx";
import HomeTab from "./pages/HomeTab.jsx";
import PracticeTab from "./pages/PracticeTab.jsx";
import JournalTab from "./pages/JournalTab.jsx";
import SystemTab from "./pages/SystemTab.jsx";
import InsightTab from "./pages/InsightTab.jsx";
import { C, FONT_BODY } from "./styles/theme.js";
import { resolveCharacterStage } from "./config/characterStages.js";

export default function App() {
  const [tab, setTab] = useState("home");
  const [navigationTarget, setNavigationTarget] = useState(null);
  const [bossCard, setBossCard] = useState(null);
  const [reviewDate, setReviewDate] = useState(null);
  const [showCalibration, setShowCalibration] = useState(true);
  const [showSuccessfulWait, setShowSuccessfulWait] = useState(false);
  const successfulWaitSubmittingRef = useRef(false);
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
    updateIdentityName,
    spendEnergy,
    updateDay,
    updateHistoryDay,
    resetTodayToBaseline,
    resetAllData,
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

  const stage = resolveCharacterStage(data.identity);
  const canCompleteSuccessfulWait =
    day.morning_plan === true &&
    day.trades.length === 0 &&
    day.checklist_pass !== true &&
    day.successful_wait !== true &&
    day.claimedRewards?.successful_wait !== true &&
    !day.journal &&
    day.stopLossMode !== true;

  const openSuccessfulWaitModal = () => {
    if (!canCompleteSuccessfulWait) return;
    successfulWaitSubmittingRef.current = false;
    setShowSuccessfulWait(true);
  };

  const logSuccessfulWait = (reason) => {
    if (!canCompleteSuccessfulWait || successfulWaitSubmittingRef.current) return false;
    successfulWaitSubmittingRef.current = true;
    updateDay((currentDay) => {
      if (currentDay.successful_wait === true || currentDay.claimedRewards?.successful_wait === true) return currentDay;
      return {
        ...currentDay,
        successful_wait: true,
        successful_wait_reason: reason,
        claimedRewards: { ...(currentDay.claimedRewards || {}), successful_wait: true },
      };
    });
    addReward({ exp: 50, label: "成功等待", statKey: "discipline" });
    showToast("成功等待完成｜EXP +50｜紀律 +1", "reward");
    setShowSuccessfulWait(false);
    setNavigationTarget("home-top");
    setTab("home");
    return true;
  };

  const ctx = {
    data,
    day,
    today,
    lvl,
    stats,
    addExp,
    addReward,
    adjustIntegrity,
    spendEnergy,
    updateDay,
    showToast,
    setTab,
    navigationTarget,
    setNavigationTarget,
    updateIdentityName,
    setBossCard,
    setReviewDate,
    updateHistoryDay,
    resetTodayToBaseline,
    resetAllData,
    openSuccessfulWaitModal,
  };

  const needsNameSetup = !data.identity.name || data.identity.name.trim() === "";

  if (needsNameSetup) {
    return (
      <>
        <CultivatorNameModal onSave={updateIdentityName} />
        {toast && <Toast toast={toast} />}
      </>
    );
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
      {showCalibration && <MorningCalibration onContinue={() => setShowCalibration(false)} />}
      {bossCard && <BossCardOverlay boss={bossCard} onClose={() => setBossCard(null)} />}
      {unlockedAchievement && <AchievementModal achievement={unlockedAchievement} onClose={clearUnlockedAchievement} />}
      <SuccessfulWaitModal
        open={showSuccessfulWait}
        accent={stage.accent}
        accentDim={stage.accentDim}
        disabled={!canCompleteSuccessfulWait}
        onClose={() => setShowSuccessfulWait(false)}
        onSubmit={logSuccessfulWait}
      />
      {reviewDate && data.history[reviewDate] && (
        <DayDetailModal
          date={reviewDate}
          session={data.history[reviewDate]}
          onClose={() => setReviewDate(null)}
        />
      )}
    </div>
  );
}
