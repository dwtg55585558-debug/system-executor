import React from "react";
import Card from "../components/Card.jsx";
import SectionLabel from "../components/SectionLabel.jsx";
import { C, FONT_MONO } from "../styles/theme.js";
import { initialCharacter } from "../data/character.js";

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
