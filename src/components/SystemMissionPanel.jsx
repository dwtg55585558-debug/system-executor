import { AlertTriangle, Check } from "lucide-react";
import Card from "./Card.jsx";
import { C, FONT_DISPLAY, FONT_MONO } from "../styles/theme.js";

export default function SystemMissionPanel({ nodes, accent }) {
  return (
    <section className="mt-4" aria-label="每日系統任務軌道">
      <div className="mb-2 flex items-center justify-between">
        <div style={{ color: C.text, fontFamily: FONT_DISPLAY, fontSize: 17 }}>每日系統任務</div>
        <div style={{ color: C.textFaint, fontSize: 9.5, letterSpacing: .5 }}>只看執行</div>
      </div>
      <Card style={{ padding: "8px 12px", borderColor: C.hair, background: "linear-gradient(180deg,#11141a,#0d1015)" }}>
        {nodes.map((node, index) => {
          const emphasized = node.state === "active";
          const ongoing = node.state === "ongoing-neutral";
          const color = node.state === "warning" ? "#c96660" : emphasized ? accent : node.state === "completed" ? C.sage : ongoing ? C.textDim : C.textFaint;
          const paddingY = emphasized ? 16 : node.state === "completed" ? 11.5 : ongoing || node.state === "warning" ? 10 : 10.5;
          return <div key={node.key} className="relative flex items-center gap-3" style={{ padding: `${paddingY}px 0`, borderTop: index ? `1px solid ${C.hair}` : "none", opacity: node.state === "completed" ? .68 : 1, background: emphasized ? `${accent}08` : "transparent" }}>
            <div className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 24, height: 24, color, border: `1px solid ${color}88`, background: emphasized ? `${accent}16` : "transparent", fontFamily: FONT_MONO, fontSize: 9 }}>
              {node.state === "completed" ? <Check size={12} /> : node.state === "warning" ? <AlertTriangle size={12} /> : String(index + 1).padStart(2, "0")}
            </div>
            <div className="min-w-0 flex-1">
              <div style={{ color, fontSize: 12.5, fontWeight: emphasized ? 800 : 650, lineHeight: 1.4 }}>{node.label}</div>
              {node.state === "active" && <div className="mt-1" style={{ color: C.textDim, fontSize: 11.5, lineHeight: 1.45 }}>{node.detail}</div>}
            </div>
            <div className="shrink-0 self-center" style={{ color, fontSize: 9.5 }}>{node.state === "completed" ? "完成" : node.state === "warning" ? "警示" : ongoing ? "維持中" : node.state === "active" ? "進行中" : "待命"}</div>
          </div>;
        })}
      </Card>
    </section>
  );
}
