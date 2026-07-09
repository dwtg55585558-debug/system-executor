import React, { useState } from "react";
import { C, FONT_DISPLAY, FONT_BODY } from "../styles/theme.js";

export default function CultivatorNameModal({ initialName = "", onSave, onCancel }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("請輸入修煉者名稱。");
      return;
    }
    onSave(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.72)", color: C.text, fontFamily: FONT_BODY }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-sm"
        style={{
          border: `1px solid rgba(203,163,95,0.34)`,
          borderRadius: 18,
          padding: 22,
          background:
            "radial-gradient(circle at 18% 0%, rgba(203,163,95,0.18), transparent 36%), linear-gradient(155deg, rgba(19,20,25,0.98), rgba(10,11,14,0.99))",
          boxShadow: "0 28px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(203,163,95,0.12)",
        }}
      >
        <div style={{ color: C.textFaint, fontSize: 11, letterSpacing: 2 }} className="uppercase mb-3">
          Cultivator Identity
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, color: C.gold, fontSize: 24, lineHeight: 1.2 }}>
          建立你的修煉者身份
        </div>
        <div style={{ color: C.textDim, fontSize: 13, lineHeight: 1.65, marginTop: 12 }}>
          這個名稱會顯示在首頁角色卡，代表你在交易修練系統中的身份。
        </div>

        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError("");
          }}
          autoFocus
          placeholder="例如：執行者 Enzo"
          style={{
            width: "100%",
            marginTop: 18,
            border: `1px solid ${error ? C.ash : "rgba(203,163,95,0.26)"}`,
            borderRadius: 12,
            background: "rgba(7,8,11,0.72)",
            color: C.text,
            padding: "12px 13px",
            outline: "none",
            fontSize: 14,
          }}
        />
        {error && (
          <div style={{ color: C.ash, fontSize: 12, marginTop: 8 }}>
            {error}
          </div>
        )}

        <div className="flex gap-2 mt-5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl py-3 text-sm font-medium"
              style={{ background: C.raised, color: C.textDim }}
            >
              取消
            </button>
          )}
          <button
            type="submit"
            className="flex-1 rounded-xl py-3 text-sm font-medium"
            style={{ background: C.goldDim, color: C.text }}
          >
            開始修煉
          </button>
        </div>
      </form>
    </div>
  );
}
