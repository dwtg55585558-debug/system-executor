import React from "react";
import { C, FONT_DISPLAY } from "../styles/theme.js";

export default function ConfirmModal({
  title,
  desc,
  onCancel,
  onConfirm,
  confirmLabel = "確定記錄",
  cancelLabel = "取消",
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="rounded-2xl p-5 w-full max-w-xs" style={{ background: C.raised2, border: `1px solid ${C.hair}` }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: C.textDim, marginBottom: 16, lineHeight: 1.6, whiteSpace: "pre-line" }}>
          {desc}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-lg py-2 text-sm" style={{ background: C.raised, color: C.textDim }}>
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-lg py-2 text-sm" style={{ background: C.ashDim, color: C.text }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
