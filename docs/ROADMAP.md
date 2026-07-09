# Roadmap

## Visual Direction

All roadmap work should move the product toward a Trading Cultivation RPG, not a minimal trading tool.

The target style is dark fantasy cultivation with a black and gold color system. Screens should feel like premium mobile RPG interfaces for disciplined martial training: layered dark cards, gold rank/progression emphasis, compact quest rows, cinematic headers, boss challenge panels, equipment/skill surfaces, and an achievement hall.

The mood should be mysterious, disciplined, premium, and focused. The app may use cultivation and martial arts language, but the practical trading behavior must remain clear. RPG framing should strengthen the process loop: calibrate identity, train, execute, resist bosses, reflect honestly, and grow.

Design guardrails:

- Prioritize black, charcoal, ink, and gold as the dominant visual system.
- Use muted bronze, ember, jade, crimson, violet, and ash only as supporting accents.
- Make progress feel like character growth, not account growth.
- Present tasks as training quests and system drills.
- Present behavioral failures as boss encounters or integrity damage.
- Present achievements as a hall of earned discipline.
- Avoid generic fintech dashboards, bright SaaS styling, arcade game tropes, and profit-first language.

## Sprint 1: Training Hall Home

### 1. Product goal

Transform the current Home tab from a simple daily dashboard into the player's Training Hall: the first screen should feel like entering the daily discipline space for a dark fantasy Trading Cultivation RPG while preserving the existing local-first behavior, EXP rewards, journal warning, and Daily Quest completion rules.

The sprint should be a presentation and information-architecture upgrade, not a domain-rule rewrite. Home should continue to answer the same practical questions:

- What day/session am I in?
- What is my identity today?
- What process task should I focus on?
- What quests are already complete?
- Is there an honest journal gap that needs attention?

### 2. UX changes

- Reframe the top of `HomeTab` as a Training Hall header while keeping the time-based greeting and date visible.
- Rename or visually evolve "Today's Mission" into a Training Hall mission panel that still communicates:
  - today's identity: `System Executor`
  - today's only job: execute the strategy
  - the non-performance reminder that the user does not need to prove themself today
- Keep the quote card, but present it as a compact cultivation/system prompt so the current `QUOTES` rotation remains unchanged.
- Keep the journal gap warning behavior exactly as-is: only show it when `journalGapDays(data.history) >= JOURNAL_GAP_WARNING` and today's journal is missing.
- Evolve "Daily Quest" into a Training Quest checklist without changing the underlying row completion conditions or EXP values.
- Make manual tasks feel like selectable training drills, but retain the current one-time completion behavior for:
  - morning calibration: +10 EXP
  - workout: +20 EXP
  - reading: +20 EXP
- Preserve the final nudge that sends users to Practice/Training for checklist, trade logging, or successful waiting, but update the language to match the Training Hall framing if the tab label remains unchanged.
- Avoid adding new navigation, new persisted fields, new reward rules, or new modals in this sprint.

### 3. Components to reuse

- `Card` for mission, quote, warning, and quest panels.
- `SectionLabel` for Training Quest section labeling.
- Existing `lucide-react` icons already available in the app, starting with `Sparkles` and `Check`; add icons only where they clarify the Training Hall hierarchy.
- Theme tokens from `src/styles/theme.js`:
  - `C.surface`, `C.raised`, `C.hair` for panel structure
  - `C.gold` and `C.goldDim` for identity, rank, progression, and premium emphasis
  - `C.violet` and `C.violetDim` only as a restrained system/training energy accent
  - `C.sage` and `C.sageDim` for completed quest state
  - `FONT_DISPLAY` for RPG identity moments
  - `FONT_MONO` for dates, EXP values, and compact system labels
- Existing `HomeTab` derived data:
  - `manualTasks`
  - `followedToday`
  - `gapDays`
  - `checklistRows`
  - `toggleManual`
  - `greet`

### 4. Smallest safe implementation steps

1. Add Training Hall copy and labels inside `HomeTab` only, keeping all current state reads, selectors, and handlers intact.
2. Rename visible section text before changing layout:
   - "Today's Mission" -> Training Hall / Today's Mission hybrid label
   - "Daily Quest" -> Training Quest
   - footer nudge -> Training Hall wording
3. Restructure the mission card visually with existing `Card`, theme tokens, and inline styles already used by the file. Do not introduce new components until duplication is real.
4. Add a compact status row or summary inside the Home layout only if it can be derived from existing `checklistRows` without new state. Example: completed quest count out of total.
5. Keep the checklist row mapping behavior unchanged:
   - manual rows remain clickable only when incomplete
   - non-manual rows remain read-only
   - completed rows still use the existing check icon, line-through text, and sage colors
6. Verify the journal warning still appears under the same condition and remains above the Training Quest checklist.
7. Run the existing build or lint command after implementation. If no lint script exists, run the Vite build as the smoke test.
8. Defer domain cleanup to a later sprint:
   - no reward extraction
   - no selector extraction
   - no `Card` prop-forwarding fix unless that specific bug is intentionally scheduled
   - no Practice tab behavior changes

### 5. Acceptance criteria

- Home presents as a Training Hall experience on first load after calibration.
- Existing Home behavior is preserved:
  - greeting and date still render
  - quote still rotates from `QUOTES`
  - journal gap warning uses the same threshold and condition
  - all Daily Quest/Training Quest rows show the same completion state as before
  - manual task clicks still award EXP once and show the same reward toast pattern
  - derived rows for checklist pass, followed-strategy trade, successful wait, stop loss, and journal remain read-only on Home
- No new persisted state fields are added.
- No EXP amounts, integrity rules, quest completion rules, or trade/journal logic are changed.
- The updated Home remains mobile-first and visually consistent with the new near-black and gold cultivation RPG direction, using violet only as a supporting accent.
- React source changes for this sprint are limited to the Home presentation unless a tiny supporting component reuse is clearly justified.
- A production build succeeds after implementation.

### 6. Files likely to change

- `src/pages/HomeTab.jsx`
  - Primary implementation file for Training Hall copy, layout, and derived quest summary.
- `src/styles/theme.js`
  - Only if a missing token is truly needed; prefer existing tokens for Sprint 1.
- `src/components/Card.jsx`
  - Not required for Sprint 1 unless implementation needs existing cards to receive additional DOM props. Avoid this unless deliberately fixing the known `Card` forwarding issue.
- `src/components/SectionLabel.jsx`
  - Not expected to change; reuse as-is unless the Training Hall label pattern needs a shared variant.
- `docs/FEATURE_MAP.md`
  - Update after implementation to rename/reframe Home behavior as Training Hall.
- `docs/ARCHITECTURE.md`
  - Update only if implementation changes component responsibilities or introduces new helpers.
- `docs/ROADMAP.md`
  - Track sprint scope and follow-up decisions.

## Sprint 1.1: Black Gold RPG Home Visual Upgrade

### 1. Product goal

Move `HomeTab` from a lightly themed Training Hall screen toward a premium black/gold mobile cultivation RPG home base. The first viewport should feel like the user's character and daily discipline session are being summoned into focus: identity, rank, quest progress, and training intent should be visually dominant before secondary cards appear.

This sprint remains a visual and information-hierarchy upgrade. It must not change reward rules, local-first data, journal warning logic, EXP values, integrity behavior, or trading-domain completion conditions. The Home tab should continue rewarding process and discipline only, never PnL.

### 2. UI direction

- Treat Home as the Training Hall landing screen for the current day.
- Make the hero identity area larger and more cinematic, using black surfaces, gold rank emphasis, and compact RPG status metadata.
- Reframe daily tasks as RPG quest cards or quest rows with clear completion state, EXP reward, and training meaning.
- Present the user's cultivation title/rank feeling more strongly, even if the initial implementation uses existing level/title/EXP/integrity data from the app context.
- Keep copy concise, in-world, and understandable for trading discipline:
  - "Training Hall"
  - "System Executor"
  - "Cultivation Rank"
  - "Training Quest"
  - "Discipline Record"
  - "Integrity"
- Preserve the current mobile-first density. The screen should feel rich, but still fast to scan during a trading day.
- Avoid bright SaaS cards, generic dashboard widgets, neon arcade color, profit language, or ornamental decoration that slows task completion.

### 3. Visual hierarchy

1. Hero identity card
   - A larger black/gold card should become the main first-screen anchor.
   - It should include the Training Hall label, greeting/date, System Executor identity, cultivation rank/title, and a compact EXP/integrity/progress readout if available from existing context.
   - Gold should carry rank, title, mastery, and completed-progress emphasis.
2. Quest progress summary
   - Show today's quest completion count as a small RPG status plate, not a generic dashboard stat.
   - Keep it derived from the existing `checklistRows` data.
3. Daily mission prompt
   - Keep "execute the strategy" and the non-performance reminder visible, but let it sit inside or directly under the hero identity card.
   - This should read like a ritual command, not a financial KPI.
4. System prompt / quote
   - Keep the existing quote rotation, but style it as a compact scroll, inscription, or cultivation prompt.
   - It should support the hero instead of competing with it.
5. Journal gap warning
   - Preserve the current condition and place it where it interrupts the flow enough to matter.
   - Use ash/crimson danger styling sparingly so it feels like integrity damage or a discipline warning.
6. Training quest list
   - Evolve rows toward RPG quest cards or dense quest items.
   - Manual tasks should feel like tappable drills.
   - Read-only rows should still be clearly locked to Practice, trade logging, successful waiting, or journaling.

### 4. Components to reuse

- `Card`
  - Reuse for the hero identity card, mission/quote surfaces, warning panel, and quest container.
  - Current `Card` already forwards DOM props, accepts `className`, and supports inline style overrides.
- `IdentityRing`
  - Consider reusing inside the hero if the available Home context already exposes the required level, title, EXP percent, and integrity percent.
  - Do not force new data plumbing solely to use it in this sprint.
- `SectionLabel`
  - Reuse for the Training Quest section unless the hero treatment makes the label redundant.
- `src/styles/theme.js`
  - Prefer existing tokens first:
    - `C.void`, `C.surface`, `C.raised`, `C.raised2`, `C.hair`
    - `C.gold`, `C.goldDim`
    - `C.text`, `C.textDim`, `C.textFaint`
    - `C.ash`, `C.ashDim`
    - `C.sage`, `C.sageDim`
    - `FONT_DISPLAY`, `FONT_MONO`
  - Use `C.violet` and `C.violetDim` only as restrained system-energy accents, not as the dominant look.
- Existing `HomeTab` data and handlers:
  - `manualTasks`
  - `followedToday`
  - `gapDays`
  - `checklistRows`
  - `completedQuestCount`
  - `toggleManual`
  - `greet`
- Existing icon library:
  - Use `lucide-react` icons only where they clarify quest status, rank, warning, or discipline state.

### 5. Smallest safe implementation steps

1. Inspect the current `ctx` shape from nearby tabs or app state before adding any hero status fields.
2. Keep all existing Home selectors, derived rows, and handlers intact.
3. Replace the current small top header plus separate mission card with one larger black/gold hero identity card.
4. Move greeting/date, Training Hall label, System Executor identity, mission command, and quest count into the new hero hierarchy.
5. Add `IdentityRing` only if its required props can be derived cleanly from existing state already available to Home.
6. Restyle the quote card as a smaller inscription/scroll surface under the hero.
7. Preserve the journal gap warning condition exactly:
   - `gapDays >= JOURNAL_GAP_WARNING && !day.journal`
8. Upgrade Training Quest rows visually without changing row completion logic:
   - manual rows remain clickable only while incomplete
   - non-manual rows remain read-only
   - EXP labels and completed states stay the same
9. Keep layout mobile-first and verify the first viewport does not become too tall or visually crowded.
10. Run the existing build or lint command after implementation.
11. Update product docs after implementation if visible vocabulary or feature framing changes beyond this planned scope.

### 6. Acceptance criteria

- Home reads immediately as a black/gold dark fantasy cultivation RPG Training Hall.
- The first viewport has a larger premium hero identity card, not a generic dashboard header.
- System Executor identity, cultivation rank/title feeling, current date/session, and quest progress are visually prominent.
- Training quests feel like RPG quest cards or disciplined drill rows while remaining practical and readable.
- The visual system is dominated by near-black, charcoal, ink, restrained gold, ash, and muted supporting accents.
- Existing behavior is unchanged:
  - quote still rotates from `QUOTES`
  - journal warning uses the same threshold and condition
  - all quest rows keep the same completion sources
  - manual completions still award EXP once
  - read-only Home rows remain read-only
  - no PnL-based rewards or rankings are introduced
- No new persisted state is added.
- The implementation remains scoped primarily to Home presentation.
- The production build succeeds.

### 7. Files likely to change

- `src/pages/HomeTab.jsx`
  - Primary file for the black/gold hero identity card, visual hierarchy, quest row styling, and Home copy.
- `src/styles/theme.js`
  - Only if a missing black/gold RPG token is clearly needed after trying existing tokens.
- `src/components/Card.jsx`
  - Not expected to change; reuse the current prop-forwarding and style override behavior.
- `src/components/IdentityRing.jsx`
  - Not expected to change; reuse only if current sizing and props work inside the Home hero.
- `docs/PRODUCT_VISION.md`
  - Update after implementation only if the sprint introduces new vocabulary or changes product framing.
- `docs/ROADMAP.md`
  - Keep the implementation checklist and follow-up decisions current.

## Sprint 2: RPG Character System

### 1. Product goal

Add the first version of the RPG Character System so the Home/Training Hall experience starts to feel like a cultivation character screen, not only a polished task dashboard. The user should see a visible System Executor character presence, current cultivation rank, behavior-based growth, and clear entrances into skills, bosses, and achievements.

This sprint should remain local-first and presentational. It should not introduce login, backend services, API calls, new reward rules, PnL-based status, or changes to trading and journal logic. The character should initially be derived from existing app state and should make discipline progress more legible without changing how progress is earned.

### 2. What should be added in v1

- Character panel
  - Add a prominent visual character area inside the Training Hall.
  - Use a silhouette, emoji/avatar placeholder, CSS-generated figure, or framed emblem as the first pass.
  - Present the user as `System Executor`, with current title/rank and discipline status.
- Cultivation rank
  - Surface the existing `level`, `title`, `totalExp`, and EXP progress as cultivation rank data.
  - Use gold hierarchy for rank/title and compact mono labels for system values.
- Attribute growth
  - Show behavior-based attributes derived from current state, such as discipline, patience, integrity, preparation, and reflection.
  - In v1, attributes can be simple visual bars or stat rows calculated from existing completion and history signals.
- Equipment/skills entry
  - Add a compact entry point for future equipment, skills, or technique slots.
  - In v1, this can be a locked/preview card or a small set of derived skill badges, with no new persisted inventory system.
- Boss challenge entry
  - Add a clear entry point for behavioral enemies such as fear, greed, revenge trading, boredom, and impulsive entries.
  - In v1, this should be a presentational challenge panel derived from today's discipline context, not a new combat system.
- Achievement hall entry
  - Add an achievement hall preview or entry point that frames repeatable discipline as earned plaques/medals.
  - In v1, use existing quest completion, streak-like history, or completed process actions where available.

### 3. UI hierarchy

1. Character identity panel
   - First-screen anchor below or within the Training Hall hero.
   - Shows character visual, `System Executor`, cultivation rank/title, total EXP/progress, and integrity.
2. Current cultivation status
   - Compact rank/progress strip using existing level, title, EXP, and integrity data.
   - Keep status process-based and avoid account-performance language.
3. Attribute growth
   - Dense RPG stat rows or small plaques that translate existing behavior into growth signals.
   - Suggested v1 attributes:
     - Discipline: today's quest completion ratio.
     - Integrity: existing integrity value.
     - Patience: successful waiting signal where available.
     - Preparation: checklist/morning calibration completion.
     - Reflection: journal completion or journal-gap state.
4. Training quests
   - Keep current quest checklist visible and behaviorally unchanged.
   - Position it as the active training loop feeding character growth.
5. Boss challenge entry
   - Compact panel for today's behavioral opponent or active risk.
   - May derive from incomplete process items, journal gap, or temptation-resistance context.
6. Equipment/skills entry
   - Small slots or skill cards that imply build progression without adding inventory mechanics.
7. Achievement hall entry
   - Preview plaque row or card that points toward earned discipline history.
   - Should feel aspirational but still grounded in existing local process data.

### 4. Data source strategy

- Use existing local app state only.
- Do not add login, backend storage, remote APIs, or network calls.
- Do not change reward calculations, EXP amounts, integrity rules, quest completion rules, trading logic, or journal logic.
- Derive character data from current fields where possible:
  - `level`
  - `title`
  - `totalExp`
  - `integrity`
  - existing EXP progress calculation used by `IdentityRing`
  - today's quest completion and `checklistRows`
  - `manualTasks`
  - `followedToday`
  - successful waiting signal if already available
  - `data.history`
  - today's journal state
  - `journalGapDays(data.history)`
- Treat new RPG fields as view-model data, not persisted domain data, for v1.
- If a derived stat is ambiguous, label it conservatively and keep the underlying trading meaning clear.
- Avoid storing character class, equipment, boss state, or achievement collections until a later sprint deliberately defines the domain model.

### 5. Components to reuse

- `Card`
  - Use for character frame, attribute panel, boss entry, equipment/skills entry, and achievement hall preview.
- `IdentityRing`
  - Reuse for rank/progress if the required props are already available cleanly.
  - Do not force new state plumbing solely for visual reuse.
- `SectionLabel`
  - Reuse for compact section labels such as Attributes, Boss Challenge, Skills, or Achievement Hall.
- Existing Home/Training Hall data and handlers
  - Preserve current selectors, derived quest rows, and manual task behavior.
- Existing theme tokens
  - `C.void`, `C.surface`, `C.raised`, `C.raised2`, `C.hair`
  - `C.gold`, `C.goldDim`
  - `C.text`, `C.textDim`, `C.textFaint`
  - `C.ash`, `C.ashDim`
  - `C.sage`, `C.sageDim`
  - muted ember/crimson/jade/violet accents only where state needs them
  - `FONT_DISPLAY` and `FONT_MONO`
- Existing `lucide-react` icons
  - Use only for clear RPG interface affordances such as rank, shield/integrity, target/boss, medal/achievement, or skill slots.

### 6. New components if needed

Prefer implementing v1 inside `HomeTab` with small local render helpers first. Add reusable components only if the UI becomes meaningfully clearer or if the same surface is needed outside Home.

Potential new components:

- `CharacterPanel`
  - Presents avatar/silhouette, identity, cultivation rank, EXP, and integrity.
  - Should accept derived props only.
- `AttributeGrowthPanel`
  - Renders behavior-based attributes as compact stat rows or bars.
  - Should not own reward or trading logic.
- `RpgEntryCard`
  - Small reusable entry card for Boss Challenge, Equipment/Skills, and Achievement Hall.
  - Useful only if those cards share enough layout and state treatment.

Do not add a full character model, equipment inventory, boss engine, achievement engine, or routing changes in Sprint 2 unless explicitly scheduled later.

### 7. Smallest safe implementation steps

1. Inspect current app context and Home data shape before adding any new props or helpers.
2. Define a local derived `characterView` or equivalent view-model inside the Home/Training Hall scope.
3. Map existing `level`, `title`, `totalExp`, integrity, quest completion, and today history into character/rank/status display fields.
4. Add a presentational character panel with a placeholder visual and existing rank/progress data.
5. Add a compact attribute-growth panel derived only from existing process signals.
6. Add three small entry surfaces:
   - Equipment/Skills
   - Boss Challenge
   - Achievement Hall
7. Keep Training Quest completion logic and manual task click behavior untouched.
8. Keep journal warning logic untouched.
9. Keep the first pass mobile-first and dense; avoid pushing the active quest loop too far below the first viewport.
10. Run the existing build or lint command after implementation.
11. Update docs after implementation if the sprint introduces new vocabulary, component responsibilities, or follow-up domain decisions.

### 8. Acceptance criteria

- Home/Training Hall includes a visible System Executor character presence.
- The first version clearly shows cultivation rank/title, total EXP/progress, and integrity from existing app state.
- Attribute growth is visible and derived from behavior/process data only.
- Equipment/skills, boss challenge, and achievement hall entries exist as presentational v1 surfaces.
- No new persisted character, equipment, boss, or achievement domain model is introduced.
- No login, backend, API calls, or remote dependencies are added.
- No reward rules, EXP values, integrity rules, trading logic, journal logic, or quest completion rules change.
- Character status never rewards or ranks the user by PnL.
- The interface remains mobile-first, dark fantasy cultivation RPG, premium black/gold, and readable during a trading day.
- Existing quest rows and manual completion behavior continue to work exactly as before.
- The production build succeeds after implementation.

### 9. Files likely to change

- `src/pages/HomeTab.jsx`
  - Primary file for deriving character view data and adding the v1 character panel, attributes, boss entry, skills entry, and achievement hall entry.
- `src/components/IdentityRing.jsx`
  - Reuse as-is if it fits. Change only if a small sizing or presentation adjustment is needed for the character panel.
- `src/components/Card.jsx`
  - Not expected to change; reuse current card behavior.
- `src/components/SectionLabel.jsx`
  - Not expected to change; reuse for compact RPG labels.
- `src/styles/theme.js`
  - Change only if existing tokens cannot support the character-system hierarchy.
- `src/components/CharacterPanel.jsx`
  - Add only if the character surface becomes too large to keep cleanly inside `HomeTab`.
- `src/components/AttributeGrowthPanel.jsx`
  - Add only if attribute rendering is reusable or too complex for a local helper.
- `src/components/RpgEntryCard.jsx`
  - Add only if Boss Challenge, Equipment/Skills, and Achievement Hall share a reusable card pattern.
- `docs/FEATURE_MAP.md`
  - Update after implementation if Home's visible feature set changes.
- `docs/ARCHITECTURE.md`
  - Update after implementation only if new components or derived view-model responsibilities need to be documented.
- `docs/ROADMAP.md`
  - Keep Sprint 2 scope and follow-up decisions current.
