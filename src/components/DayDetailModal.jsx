import React from "react";
import { X } from "lucide-react";
import Card from "./Card.jsx";
import SectionLabel from "./SectionLabel.jsx";
import JournalSummaryRow from "./JournalSummaryRow.jsx";
import AIMentorPanel from "./AIMentorPanel.jsx";
import { C, FONT_DISPLAY, FONT_MONO } from "../styles/theme.js";
import { BOSSES, VIOLATION_TYPES, RISK_REASON_LABEL, EVENING_REFLECTION_REASONS } from "../utils/constants.js";

export default function DayDetailModal({ date, session, expLog, integrityLog, onClose, onSaveMentor }) {
  const dayExp = expLog.filter((e) => e.date === date).reduce((s, e) => s + e.amount, 0);
  const dayIntegrityPoints = integrityLog.filter((p) => p.date === date);
  const integrityDelta =
    dayIntegrityPoints.length > 1
      ? dayIntegrityPoints[dayIntegrityPoints.length - 1].value - dayIntegrityPoints[0].value
      : null;
  const rows = [
    ["晨間校準", session.morning_plan ? "完成" : "—"],
    ["健身", session.workout ? "完成" : "—"],
    ["閱讀", session.reading ? "完成" : "—"],
    ["Checklist", session.checklist_pass ? "完成" : "—"],
    ["成功等待", session.successful_wait ? "是" : "—"],
  ];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-5"
      style={{ background: "rgba(0,0,0,0.72)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl p-5 w-full max-w-sm max-h-[80vh] overflow-y-auto"
        style={{ background: C.raised2, border: `1px solid ${C.hair}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17 }}>{date}</div>
          <button onClick={onClose}>
            <X size={16} color={C.textFaint} />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span style={{ fontSize: 12, color: C.textFaint }}>當日 EXP 淨變化</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 14, color: dayExp >= 0 ? C.violet : C.ash }}>
            {dayExp >= 0 ? "+" : ""}
            {dayExp}
          </span>
        </div>

        {integrityDelta !== null && (
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontSize: 12, color: C.textFaint }}>當日 Integrity 變化</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 14, color: integrityDelta >= 0 ? C.sage : C.ash }}>
              {integrityDelta >= 0 ? "+" : ""}
              {integrityDelta}%
            </span>
          </div>
        )}

        {session.identityStatement && (
          <>
            <SectionLabel>Morning Calibration</SectionLabel>
            <Card style={{ padding: 10 }}>
              <div style={{ fontSize: 12.5, color: C.text }}>{session.identityStatement}</div>
            </Card>
          </>
        )}

        <SectionLabel>任務</SectionLabel>
        <Card style={{ padding: 10 }}>
          {rows.map(([label, val]) => (
            <div key={label} className="flex items-center justify-between py-0.5" style={{ fontSize: 12.5 }}>
              <span style={{ color: C.textFaint }}>{label}</span>
              <span style={{ color: C.text }}>{val}</span>
            </div>
          ))}
        </Card>

        <SectionLabel>交易 ({session.trades.length})</SectionLabel>
        {session.trades.length === 0 ? (
          <div style={{ fontSize: 12, color: C.textFaint }}>沒有交易紀錄</div>
        ) : (
          <div className="space-y-1.5">
            {session.trades.map((t, i) => (
              <Card key={t.id || i} style={{ padding: 10 }}>
                <div className="flex items-center justify-between" style={{ fontSize: 12.5 }}>
                  <span>
                    {t.symbol} · {t.direction === "long" ? "多" : "空"}
                  </span>
                  <span style={{ color: t.followed_checklist ? C.sage : C.textFaint }}>
                    {t.followed_checklist ? "符合策略" : "未標記符合"}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>
                  {t.stop_loss_set ? "已設停損" : "未設停損"}
                  {t.r_value != null ? ` · R ${t.r_value}` : ""}
                  {t.pnl !== null && t.pnl !== undefined ? ` · 盈虧 ${t.pnl}` : ""}
                </div>
                {t.entry_reason && (
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>理由:{t.entry_reason}</div>
                )}
                {t.notes && <div style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>備註:{t.notes}</div>}
                {t.edited_at && (
                  <div style={{ fontSize: 10, color: C.violet, marginTop: 3 }}>
                    已編輯 · {new Date(t.edited_at).toLocaleString()}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <SectionLabel>違規 ({session.violations.length})</SectionLabel>
        {session.violations.length === 0 ? (
          <div style={{ fontSize: 12, color: C.sage }}>乾淨的一天</div>
        ) : (
          <div className="space-y-1">
            {session.violations.map((v, i) => {
              const vt = VIOLATION_TYPES.find((x) => x.id === v.id);
              const boss = vt && BOSSES.find((b) => b.id === vt.bossId);
              return (
                <div key={i} style={{ fontSize: 12.5, color: C.ash }}>
                  {vt ? vt.label : v.id}
                  {boss ? `(${boss.name})` : ""}
                </div>
              );
            })}
          </div>
        )}

        <SectionLabel>Boss</SectionLabel>
        {session.bossResists.length === 0 ? (
          <div style={{ fontSize: 12, color: C.textFaint }}>今天沒有記錄抵抗誘惑</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {session.bossResists.map((id) => {
              const b = BOSSES.find((x) => x.id === id);
              return (
                <span key={id} className="rounded-full px-2.5 py-1" style={{ fontSize: 11, background: C.sageDim, color: C.text }}>
                  擊退 {b?.name || id}
                </span>
              );
            })}
          </div>
        )}

        {session.riskEvents && session.riskEvents.length > 0 && (
          <>
            <SectionLabel>Decision Risk Monitor</SectionLabel>
            <div className="space-y-1.5">
              {session.riskEvents.map((e, i) => (
                <Card key={i} style={{ padding: 10 }}>
                  <div style={{ fontSize: 11.5, color: C.textFaint }}>
                    {e.reasons.map((r) => RISK_REASON_LABEL[r]).join(" · ")}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: e.response === "following_system" ? C.sage : C.ash,
                      marginTop: 3,
                    }}
                  >
                    回應:{e.response === "following_system" ? "我現在依照系統" : "我現在受到情緒影響"}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {session.eveningReflection && (
          <>
            <SectionLabel>Evening Reflection</SectionLabel>
            <Card style={{ padding: 10 }}>
              <div style={{ fontSize: 12.5, color: C.text }}>
                {EVENING_REFLECTION_REASONS.find((r) => r.id === session.eveningReflection.reason)?.label}
              </div>
            </Card>
          </>
        )}

        {session.journal && (
          <>
            <SectionLabel>Decision Journal</SectionLabel>
            <Card style={{ padding: 10 }}>
              <JournalSummaryRow label="忠於系統" value={session.journal.q1 ? "是" : "否"} />
              <JournalSummaryRow label="最大情緒" value={session.journal.emotion} />
              <JournalSummaryRow label="值得信任自己" value={session.journal.q5 ? "是" : "否"} />
              {session.journal.q3 && (
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 6 }}>學習:{session.journal.q3}</div>
              )}
              {session.journal.q4 && (
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>改善:{session.journal.q4}</div>
              )}
              {session.journal.edited_at && (
                <div style={{ fontSize: 10, color: C.violet, marginTop: 6 }}>
                  已編輯 · {new Date(session.journal.edited_at).toLocaleString()}
                </div>
              )}
            </Card>
          </>
        )}

        <SectionLabel>AI Mentor</SectionLabel>
        <AIMentorPanel date={date} session={session} onSave={onSaveMentor} />
      </div>
    </div>
  );
}
