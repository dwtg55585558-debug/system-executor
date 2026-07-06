import React from "react";
import { C } from "../styles/theme.js";

export default function MentorRow({ label, value, highlight }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10.5, color: C.textFaint }}>{label}</div>
      <div style={{ fontSize: 12.5, color: highlight ? C.gold : C.text, marginTop: 2, lineHeight: 1.5 }}>
        {typeof value === "boolean" ? (value ? "是" : "否") : value}
      </div>
    </div>
  );
}
