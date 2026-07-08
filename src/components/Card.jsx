import React from "react";
import { C } from "../styles/theme.js";

export default function Card({ children, style, className = "", ...props }) {
  return (
    <div
      {...props}
      className={`rounded-2xl p-4 ${className}`}
      style={{ background: C.surface, border: `1px solid ${C.hair}`, ...style }}
    >
      {children}
    </div>
  );
}
