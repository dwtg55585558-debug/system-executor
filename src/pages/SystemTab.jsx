import React from "react";
import Card from "../components/Card.jsx";
import SectionLabel from "../components/SectionLabel.jsx";
import { C, FONT_MONO } from "../styles/theme.js";
import { initialCharacter } from "../data/character.js";

function StatRadar({ stats }) {
  const items = [
    ["專注", stats.focus],
    ["洞察", stats.insight],
    ["觀察", stats.observation],
    ["執行", stats.execution],
    ["心態", stats.mindset],
    ["紀律", stats.discipline],
  ];

  const size = 240;
  const center = size / 2;
  const maxRadius = 82;
  const maxValue = 100;

  const point = (index, value) => {
    const angle = -90 + index * 60;
    const rad = (Math.PI / 180) * angle;
    const radius = (value / maxValue) * maxRadius;
    return [
      center + Math.cos(rad) * radius,
      center + Math.sin(rad) * radius,
    ];
  };

  const outerPoint = (index, radius = maxRadius) => {
    const angle = -90 + index * 60;
    const rad = (Math.PI / 180) * angle;
    return [
      center + Math.cos(rad) * radius,
      center + Math.sin(rad) * radius,
    ];
  };

  const polygon = items.map(([, value], i) => point(i, value).join(",")).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[1, 0.75, 0.5, 0.25].map((scale) => (
          <polygon
            key={scale}
            points={items.map((_, i) => outerPoint(i, maxRadius * scale).join(",")).join(" ")}
            fill="none"
            stroke={C.hair}
            strokeWidth="1"
          />
        ))}

        {items.map((_, i) => {
          const [x, y] = outerPoint(i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke={C.hair}
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={polygon}
          fill="rgba(213, 184, 135, 0.28)"
          stroke={C.gold}
          strokeWidth="2"
        />

        {items.map(([label, value], i) => {
          const [x, y] = outerPoint(i, 108);
          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={C.text}
              fontSize="12"
              fontWeight="700"
            >
              {label}
              <tspan x={x} dy="16" fill={C.gold} fontSize="13">
                {value}
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function SystemTab() {
  const character = initialCharacter;
  const expPercent = (character.exp / character.nextLevelExp) * 100;

  return (
    <div>
      <div style={{ color: C.textDim, fontSize: 13 }} className="mb-3">
        角色
      </div>

      <Card className="flex items-center gap-4">
        <div
          className="rounded-full shrink-0 flex items-center justify-center"
          style={{
            width: 72,
            height: 72,
            border: `2px solid ${C.gold}`,
            background: C.raised2,
            color: C.gold,
            fontSize: 28,
          }}
        >
          ⚔️
        </div>

        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>
            {character.name}
          </div>

          <div style={{ color: C.textDim, fontSize: 13, marginTop: 4 }}>
            等級 {character.level}・{character.title}・{character.stage}
          </div>

          <div className="mt-4">
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: C.raised }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${expPercent}%`,
                  background: C.gold,
                }}
              />
            </div>

            <div
              className="mt-2 flex justify-between"
              style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.textFaint }}
            >
              <span>
                {character.exp} / {character.nextLevelExp} EXP
              </span>
              <span>0日目</span>
            </div>
          </div>
        </div>
      </Card>

      <SectionLabel>核心屬性</SectionLabel>
      <Card>
        <StatRadar stats={character.stats} />
      </Card>

      <SectionLabel>今日成長</SectionLabel>
      <Card>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div style={{ color: C.textFaint, fontSize: 12 }}>EXP</div>
            <div style={{ color: C.gold, fontSize: 24, fontWeight: 800 }}>
              +0
            </div>
          </div>

          <div>
            <div style={{ color: C.textFaint, fontSize: 12 }}>Integrity</div>
            <div style={{ color: C.gold, fontSize: 24, fontWeight: 800 }}>
              +0
            </div>
          </div>

          <div>
            <div style={{ color: C.textFaint, fontSize: 12 }}>連續天數</div>
            <div style={{ color: C.gold, fontSize: 24, fontWeight: 800 }}>
              {character.streak.strategy}
            </div>
          </div>
        </div>
      </Card>

      <SectionLabel>修練資源</SectionLabel>
      <Card>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span style={{ color: C.textDim, fontSize: 13 }}>Energy</span>
              <span style={{ color: C.gold, fontFamily: FONT_MONO, fontSize: 13 }}>
                {character.energy} / {character.maxEnergy}
              </span>
            </div>

            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: C.raised }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(character.energy / character.maxEnergy) * 100}%`,
                  background: C.gold,
                }}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <span style={{ color: C.textDim, fontSize: 13 }}>Gold</span>
            <span style={{ color: C.gold, fontFamily: FONT_MONO }}>
              {character.currency.gold}
            </span>
          </div>

          <div className="flex justify-between">
            <span style={{ color: C.textDim, fontSize: 13 }}>Crystal</span>
            <span style={{ color: C.gold, fontFamily: FONT_MONO }}>
              {character.currency.crystal}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}