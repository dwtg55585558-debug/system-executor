# System Executor Agent Guide

## Project Direction

System Executor is evolving from a minimal trading discipline tool into a Trading Cultivation RPG. Future work should preserve the original product rule: the app rewards process, discipline, journaling, and identity growth, never trading PnL.

The product should feel like a dark fantasy cultivation companion for a trader who is training a system-executor identity. It should be premium, cinematic, mysterious, and disciplined rather than decorative, noisy, or playful.

## Visual Direction

Use this direction for future design and implementation tasks:

- Theme: dark fantasy cultivation RPG, martial arts progression, disciplined training hall, boss challenges, achievement hall.
- Color system: near-black foundations with restrained gold hierarchy. Gold is the primary prestige/progression color; muted ash, ink, bronze, ember, jade, and deep crimson may support state and risk.
- UI language: mobile RPG cards, compact panels, quest rows, equipment slots, skill cards, boss challenge panels, achievement plaques, cultivation-rank progress displays.
- Mood: premium, cinematic, mysterious, focused, ritualistic, and disciplined.
- Avoid: minimal trading-terminal aesthetics, bright SaaS dashboards, generic finance widgets, cute game styling, neon arcade palettes, and performance-first profit language.

## Product Metaphor

Map existing product concepts into the cultivation RPG frame without changing domain rules unless explicitly requested:

- Home: Training Hall for the current session.
- Practice: Training quests, system drills, trade execution, successful waiting, and temptation resistance.
- Journal: Reflection scroll or discipline record.
- System: Character sheet, cultivation rank, integrity, equipment/skills, boss codex, and achievement hall.
- Insight: Cultivation analytics, pattern reading, and long-term discipline review.
- Bosses: named behavioral enemies such as fear, greed, revenge trading, boredom, and impulsive entries.
- Achievements: hall plaques or medals earned through repeatable discipline.

## Implementation Rules

- Keep the app local-first unless a task explicitly changes architecture.
- Do not reward or rank users by PnL. EXP, integrity, achievements, and progression must remain behavior/process based.
- Prefer mobile-first layouts with dense but readable RPG cards.
- Use existing project patterns, tokens, and components before adding new abstractions.
- Keep copy concise and in-world, but never obscure core trading discipline meaning.
- When asked to change only documentation, do not modify React source code.

## Documentation Expectations

When future work changes feature framing, progression vocabulary, or visual direction, update the relevant docs in `docs/` so product intent remains explicit for later Codex tasks.
