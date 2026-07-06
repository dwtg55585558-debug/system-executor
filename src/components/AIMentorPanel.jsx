import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import Card from "./Card.jsx";
import MentorRow from "./MentorRow.jsx";
import { C } from "../styles/theme.js";

const KEY_STORAGE = "system-executor-anthropic-key";

function getSavedKey() {
  try {
    return window.localStorage.getItem(KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

export default function AIMentorPanel({ date, session, onSave }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(getSavedKey());
  const [showKeyInput, setShowKeyInput] = useState(!getSavedKey());

  const saveKey = () => {
    try {
      window.localStorage.setItem(KEY_STORAGE, apiKey.trim());
    } catch {
      /* ignore */
    }
    setShowKeyInput(false);
  };

  const runAnalysis = async () => {
    if (!apiKey.trim()) {
      setShowKeyInput(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const sanitized = {
        date,
        morning_plan: session.morning_plan,
        workout: session.workout,
        reading: session.reading,
        checklist_pass: session.checklist_pass,
        successful_wait: session.successful_wait,
        trades: session.trades.map((t) => ({
          direction: t.direction,
          followed_checklist: t.followed_checklist,
          stop_loss_set: t.stop_loss_set,
          entry_reason: t.entry_reason,
          r_value: t.r_value,
          notes: t.notes,
        })),
        violations: session.violations.map((v) => v.id),
        boss_resists: session.bossResists,
        risk_events: session.riskEvents,
        evening_reflection: session.eveningReflection?.reason || null,
        journal: session.journal
          ? {
              followed_system: session.journal.q1,
              emotion: session.journal.emotion,
              learning: session.journal.q3,
              improvement_note: session.journal.q4,
              trusted_self: session.journal.q5,
            }
          : null,
      };

      const systemPrompt =
        "你是一位專業交易教練(Professional Trading Coach)。你絕對不評論盈虧、金額或報酬率,因為你完全看不到這些資料。你只分析:1) 這個人今天是否忠於自己的系統 2) 今天最大的心理模式 3) 今天最大的偏差 4) 明天唯一該改善的一件事(只能一件,不要給清單)。請用繁體中文回答,語氣冷靜、專業、不說教。只回傳合法 JSON,不要任何前言或 markdown 符號,格式為:{\"followed_system\":\"...\",\"dominant_pattern\":\"...\",\"biggest_deviation\":\"...\",\"one_improvement\":\"...\"}";

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey.trim(),
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: JSON.stringify(sanitized) }],
        }),
      });
      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(errBody);
      }
      const data = await response.json();
      const text = (data.content || []).map((b) => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const result = { ...parsed, generated_at: Date.now() };
      onSave(result);
    } catch (e) {
      console.error(e);
      setError("分析暫時無法完成,請確認 API Key 是否正確,或稍後再試一次。");
    } finally {
      setLoading(false);
    }
  };

  if (showKeyInput) {
    return (
      <Card style={{ padding: 12 }}>
        <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8, lineHeight: 1.5 }}>
          AI Mentor 需要你自己的 Anthropic API Key(僅儲存在你這台裝置的瀏覽器裡,不會上傳到任何伺服器)。
        </div>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-2"
          style={{ background: C.raised, color: C.text, border: `1px solid ${C.hair}` }}
        />
        <button onClick={saveKey} className="w-full rounded-lg py-2 text-sm font-medium" style={{ background: C.violetDim, color: C.text }}>
          儲存 Key
        </button>
      </Card>
    );
  }

  if (session.aiMentor) {
    return (
      <Card style={{ padding: 12, borderColor: C.violetDim }}>
        <MentorRow label="是否忠於系統" value={session.aiMentor.followed_system} />
        <MentorRow label="今天最大的心理模式" value={session.aiMentor.dominant_pattern} />
        <MentorRow label="今天最大的偏差" value={session.aiMentor.biggest_deviation} />
        <MentorRow label="明天唯一改善" value={session.aiMentor.one_improvement} highlight />
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowKeyInput(true)}
            className="rounded-lg py-2 px-3 text-xs"
            style={{ background: C.raised, color: C.textFaint, border: `1px solid ${C.hair}` }}
          >
            變更 Key
          </button>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="flex-1 rounded-lg py-2 text-xs"
            style={{ background: C.raised, color: C.textFaint, border: `1px solid ${C.hair}` }}
          >
            {loading ? "重新分析中…" : "重新分析"}
          </button>
        </div>
        {error && <div style={{ fontSize: 11, color: C.ash, marginTop: 6 }}>{error}</div>}
      </Card>
    );
  }

  return (
    <Card style={{ padding: 12 }}>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 10, lineHeight: 1.5 }}>
        AI Mentor 只分析你是否忠於系統、心理模式與偏差,不評論盈虧。
      </div>
      <button
        onClick={runAnalysis}
        disabled={loading}
        className="w-full rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-1.5"
        style={{ background: C.violetDim, color: C.text }}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? "分析中…" : "產生今日分析"}
      </button>
      {error && <div style={{ fontSize: 11, color: C.ash, marginTop: 8 }}>{error}</div>}
    </Card>
  );
}
