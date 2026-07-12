import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { C, FONT_DISPLAY } from "../styles/theme.js";

export const SUCCESSFUL_WAIT_REASONS = [
  { code: "no_valid_setup", label: "沒有符合策略的機會" },
  { code: "unclear_structure", label: "未出現明確結構" },
  { code: "protective_no_trade", label: "風險或自身狀態不適合，主動不交易" },
  { code: "other", label: "其他原因" },
];

export default function SuccessfulWaitModal({ open, accent, accentDim, disabled = false, onClose, onSubmit }) {
  const [selectedCode, setSelectedCode] = useState("");
  const [note, setNote] = useState("");
  const [confirmedClose, setConfirmedClose] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSelectedCode("");
    setNote("");
    setConfirmedClose(false);
    setSubmitting(false);
  }, [open]);

  if (!open) return null;

  const selectedReason = SUCCESSFUL_WAIT_REASONS.find((reason) => reason.code === selectedCode);
  const canSubmit = !!selectedReason && (selectedCode !== "other" || note.trim() !== "") && confirmedClose && !disabled && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const completed = await onSubmit({
      code: selectedReason.code,
      label: selectedReason.label,
      note: selectedReason.code === "other" ? note.trim() : "",
    });
    if (!completed) setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4 sm:py-6" style={{ background: "rgba(0,0,0,0.78)" }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="successful-wait-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[min(88dvh,680px)] w-full max-w-sm flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
        style={{ background: C.raised2, border: `1px solid ${C.hair}` }}
      >
        <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4" style={{ borderBottom: `1px solid ${C.hair}` }}>
          <div className="min-w-0">
            <div id="successful-wait-title" style={{ color: C.text, fontFamily: FONT_DISPLAY, fontSize: 19 }}>完成等待任務</div>
            <div className="mt-2" style={{ color: C.textDim, fontSize: 12.5, lineHeight: 1.6 }}>
              這會結束今天的交易流程。<br />選擇今天不出手的主要原因。
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} className="shrink-0 rounded-lg p-2" aria-label="關閉完成等待任務">
            <X size={18} color={C.textFaint} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          <div className="space-y-2.5">
            {SUCCESSFUL_WAIT_REASONS.map((reason) => {
              const selected = reason.code === selectedCode;
              return (
                <button
                  key={reason.code}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSelectedCode(reason.code)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left outline-none"
                  onFocus={(event) => { event.currentTarget.style.boxShadow = `0 0 0 2px ${accent}`; }}
                  onBlur={(event) => { event.currentTarget.style.boxShadow = "none"; }}
                  style={{ background: selected ? accentDim : C.raised, border: `1px solid ${selected ? accent : C.hair}`, color: selected ? C.text : C.textDim }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ border: `1.5px solid ${selected ? accent : C.textFaint}` }}>
                    {selected && <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />}
                  </span>
                  <span style={{ fontSize: 13.5, lineHeight: 1.45, fontWeight: 700 }}>{reason.label}</span>
                </button>
              );
            })}
          </div>

          {selectedCode === "other" && (
            <textarea
              autoFocus
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="輸入今天選擇等待的原因"
              rows={3}
              className="mt-3 w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: C.raised, border: `1px solid ${accentDim}`, color: C.text, caretColor: accent }}
              onFocus={(event) => { event.currentTarget.style.boxShadow = `0 0 0 2px ${accent}`; }}
              onBlur={(event) => { event.currentTarget.style.boxShadow = "none"; }}
            />
          )}

          <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl px-3 py-3" style={{ background: C.raised, border: `1px solid ${confirmedClose ? accent : C.hair}` }}>
            <input
              type="checkbox"
              checked={confirmedClose}
              onChange={(event) => setConfirmedClose(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 outline-none"
              style={{ accentColor: accent }}
              onFocus={(event) => { event.currentTarget.style.boxShadow = `0 0 0 2px #090d13, 0 0 0 4px ${accent}`; }}
              onBlur={(event) => { event.currentTarget.style.boxShadow = "none"; }}
            />
            <span style={{ color: confirmedClose ? C.text : C.textDim, fontSize: 12.5, lineHeight: 1.5, fontWeight: 700 }}>
              我確認今天不再取得新的出手許可
            </span>
          </label>
        </div>

        <div className="sticky bottom-0 shrink-0 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3" style={{ borderTop: `1px solid ${C.hair}`, background: C.raised2 }}>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className="w-full rounded-xl px-4 py-3 text-sm font-bold outline-none disabled:cursor-not-allowed"
            style={{ minHeight: 48, color: canSubmit ? "#071018" : "#737b84", background: canSubmit ? accent : "#252a30", boxShadow: canSubmit ? `0 7px 16px -10px ${accent}` : "none" }}
            onFocus={(event) => { event.currentTarget.style.outline = `2px solid ${accent}`; event.currentTarget.style.outlineOffset = "2px"; }}
            onBlur={(event) => { event.currentTarget.style.outline = "none"; }}
          >
            結束今日交易並完成等待
          </button>
        </div>
      </div>
    </div>
  );
}
