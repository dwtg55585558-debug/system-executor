import React from "react";
import { C } from "../styles/theme.js";

export default function YesNo({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          onClick={() => onChange(v)}
          className="flex-1 rounded-lg py-2 text-sm"
          style={{
            background: value === v ? C.violetDim : C.raised,
            border: `1px solid ${value === v ? C.violet : C.hair}`,
            color: C.text,
          }}
        >
          {v ? "YES" : "NO"}
        </button>
      ))}
    </div>
  );
}
