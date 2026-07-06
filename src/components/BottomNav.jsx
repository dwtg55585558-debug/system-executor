import React from "react";
import { Home as HomeIcon, Target, BookOpen, Shield, BarChart3 } from "lucide-react";
import { C } from "../styles/theme.js";

const ITEMS = [
  { id: "home", icon: HomeIcon, label: "首頁" },
  { id: "practice", icon: Target, label: "修練" },
  { id: "journal", icon: BookOpen, label: "日誌" },
  { id: "system", icon: Shield, label: "系統" },
  { id: "insight", icon: BarChart3, label: "洞察" },
];

export default function BottomNav({ tab, setTab }) {
  return (
    <div
      style={{
        background: "rgba(19,20,25,0.92)",
        borderTop: `1px solid ${C.hair}`,
        backdropFilter: "blur(10px)",
      }}
      className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-2 pb-safe z-30"
    >
      {ITEMS.map((it) => {
        const active = tab === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors"
            style={{ color: active ? C.gold : C.textFaint }}
          >
            <it.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
            <span style={{ fontSize: 10, letterSpacing: 0.3 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
