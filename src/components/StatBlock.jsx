import React from "react";
import Card from "./Card.jsx";
import { C, FONT_MONO } from "../styles/theme.js";

export default function StatBlock({ label, value, color }) {
  return (
    <Card style={{ padding: "12px 8px", textAlign: "center" }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 18, color }}>{value}</div>
      <div style={{ fontSize: 10, color: C.textFaint, marginTop: 3 }}>{label}</div>
    </Card>
  );
}
