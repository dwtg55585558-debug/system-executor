import React from "react";
import { X } from "lucide-react";
import Card from "./Card.jsx";
import SectionLabel from "./SectionLabel.jsx";
import MentorRow from "./MentorRow.jsx";
import { C, FONT_DISPLAY } from "../styles/theme.js";

function getExecutionSummary(session, counts) {
  const { totalTrades, deviatedTrades, emotionAffectedTrades, violationCount } = counts;

  if (totalTrades === 0 && session.successful_wait === true) {
    return "今日未進入市場，完成成功等待。";
  }

  if (totalTrades === 0 && session.eveningReflection?.reason) {
    const summaries = {
      no_setup: "今日沒有符合策略的機會，未進入市場。",
      did_not_watch_market: "今日未看盤。",
      rest_day: "今日為休息日。",
      fear_based_avoidance: "今日未交易；紀錄顯示受到恐懼影響。",
    };
    return summaries[session.eveningReflection.reason] || "今日無交易紀錄。";
  }

  if (totalTrades === 0) return "今日無交易紀錄。";
  if (violationCount > 0) return `今日 ${totalTrades} 筆交易，發生 ${violationCount} 次違規。`;
  if (deviatedTrades > 0) return `今日 ${totalTrades} 筆交易，其中 ${deviatedTrades} 筆偏離策略。`;
  if (emotionAffectedTrades > 0) {
    return `今日 ${totalTrades} 筆交易皆符合策略，其中 ${emotionAffectedTrades} 筆受到情緒影響，無違規。`;
  }
  return `今日 ${totalTrades} 筆交易皆符合策略，未受情緒影響，無違規。`;
}

export default function DayDetailModal({ date, session, onClose }) {
  const trades = session.trades || [];
  const counts = {
    totalTrades: trades.length,
    followedTrades: trades.filter((trade) => trade.followed_checklist === true).length,
    deviatedTrades: trades.filter((trade) => trade.followed_checklist === false).length,
    emotionAffectedTrades: trades.filter((trade) => trade.emotion_affected === true).length,
    violationCount: session.violations?.length || 0,
  };
  const needsCorrection = counts.deviatedTrades > 0 || counts.violationCount > 0;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4 py-6 pb-24"
      style={{ background: "rgba(0,0,0,0.76)" }}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm max-h-[78vh] overflow-hidden rounded-xl"
        style={{ background: C.raised2, border: `1px solid ${C.hair}` }}
        role="dialog"
        aria-modal="true"
        aria-label={`${date} 歷史復盤`}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${C.hair}` }}>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17 }}>{date}</div>
            <div className="flex items-center gap-2 mt-1" style={{ fontSize: 11.5 }}>
              <span style={{ color: session.journal ? C.sage : C.textFaint }}>
                {session.journal ? "復盤完成" : "尚未復盤"}
              </span>
              {needsCorrection && <span style={{ color: C.gold }}>需要修正</span>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2" aria-label="關閉歷史復盤">
            <X size={17} color={C.textFaint} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 pt-3 pb-7" style={{ maxHeight: "calc(78vh - 66px)" }}>
          <SectionLabel>今日執行摘要</SectionLabel>
          <div style={{ color: C.text, fontSize: 13, lineHeight: 1.65 }}>{getExecutionSummary(session, counts)}</div>
          {session.successful_wait === true && session.successful_wait_reason?.label && (
            <div className="mt-2 rounded-lg px-3 py-2.5" style={{ background: C.sageDim, border: `1px solid rgba(107,154,126,0.24)`, fontSize: 12.5, lineHeight: 1.6 }}>
              <div style={{ color: C.textDim }}>等待原因：{session.successful_wait_reason.label}</div>
              {session.successful_wait_reason.code === "other" && session.successful_wait_reason.note && (
                <div className="mt-1" style={{ color: C.textFaint }}>補充：{session.successful_wait_reason.note}</div>
              )}
            </div>
          )}

          {session.journal && (
            <>
              <SectionLabel>核心反思</SectionLabel>
              <div style={{ color: session.journal.q3 ? C.text : C.textFaint, fontSize: 13, lineHeight: 1.65 }}>
                {session.journal.q3 || "未留下核心反思"}
              </div>
            </>
          )}

          <SectionLabel>下一次執行</SectionLabel>
          <div
            className="rounded-lg px-3 py-3"
            style={{ border: `1px solid ${C.goldDim}`, color: session.journal?.q4 ? C.text : C.textFaint, fontSize: 14, lineHeight: 1.65 }}
          >
            {session.journal?.q4 || "尚未留下下一次執行指令"}
          </div>

          {trades.length > 0 && (
            <>
              <SectionLabel>必要交易摘要</SectionLabel>
              <div className="space-y-2">
                {trades.slice(0, 3).map((trade, index) => (
                  <Card key={trade.id || index} style={{ padding: 10 }}>
                    <div className="flex items-center justify-between gap-2" style={{ fontSize: 12.5 }}>
                      <span style={{ color: C.text }}>第 {index + 1} 筆 · {(trade.symbol || "未記錄").toUpperCase()} · {trade.direction === "long" ? "多" : "空"}</span>
                      <span style={{ color: trade.followed_checklist ? C.sage : C.gold }}>
                        {trade.followed_checklist ? "符合策略" : "偏離策略"}
                      </span>
                    </div>
                    <div style={{ color: C.textFaint, fontSize: 11.5, marginTop: 4 }}>
                      {trade.emotion_affected === true ? "受情緒影響" : "未受情緒影響"}
                    </div>
                  </Card>
                ))}
              </div>
              {trades.length > 3 && <div className="mt-2" style={{ color: C.textFaint, fontSize: 12 }}>另有 {trades.length - 3} 筆交易</div>}
            </>
          )}

          {session.aiMentor && (
            <>
              <SectionLabel>AI 導師結論</SectionLabel>
              <Card style={{ padding: 11, borderColor: C.goldDim }}>
                <MentorRow label="是否忠於系統" value={session.aiMentor.followed_system} />
                <MentorRow label="最大心理模式" value={session.aiMentor.dominant_pattern} />
                <MentorRow label="最大偏差" value={session.aiMentor.biggest_deviation} />
                <MentorRow label="下一次唯一改善" value={session.aiMentor.one_improvement} highlight />
              </Card>
            </>
          )}

          <button type="button" onClick={onClose} className="w-full rounded-lg py-2.5 mt-5 text-sm" style={{ color: C.textDim, border: `1px solid ${C.hair}` }}>
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
