import React from "react";
import { C, FONT_MONO } from "../styles/theme.js";

export default function StatMini({ label, value, color }) {
  return (
    <div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 15, color: color || C.text }}>{value}</div>
      <div style={{ fontSize: 10, color: C.textFaint }}>{label}</div>
    </div>
  );
}
