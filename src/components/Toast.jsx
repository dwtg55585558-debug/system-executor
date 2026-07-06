import React from "react";
import { C } from "../styles/theme.js";

export default function Toast({ toast }) {
  const color = toast.kind === "penalty" ? C.ash : toast.kind === "reward" ? C.sage : C.violet;
  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl z-50 text-sm max-w-xs text-center shadow-lg"
      style={{ background: C.raised2, border: `1px solid ${color}`, color: C.text }}
    >
      {toast.msg}
    </div>
  );
}
