import React from "react";
import { C } from "../styles/theme.js";

export default function SectionLabel({ children }) {
  return (
    <div
      style={{ color: C.textFaint, fontSize: 11, letterSpacing: 1.5 }}
      className="uppercase mb-2 mt-6 first:mt-0"
    >
      {children}
    </div>
  );
}
