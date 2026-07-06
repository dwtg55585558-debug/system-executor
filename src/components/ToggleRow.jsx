import React from "react";
import { C } from "../styles/theme.js";

export default function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span style={{ fontSize: 13, color: C.textDim }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="rounded-full relative"
        style={{
          width: 38,
          height: 21,
          background: value ? C.sageDim : C.raised2,
          border: `1px solid ${value ? C.sage : C.hair}`,
        }}
      >
        <div
          className="absolute rounded-full transition-all"
          style={{
            width: 15,
            height: 15,
            top: 2,
            left: value ? 19 : 2,
            background: value ? C.sage : C.textFaint,
          }}
        />
      </button>
    </div>
  );
}
