import React from "react";
import { C } from "../styles/theme.js";

export default function JournalSummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span style={{ fontSize: 12.5, color: C.textFaint }}>{label}</span>
      <span style={{ fontSize: 12.5, color: C.text }}>{value}</span>
    </div>
  );
}
