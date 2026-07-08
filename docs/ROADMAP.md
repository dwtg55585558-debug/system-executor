## Sprint 1: Training Hall Home

### 1. Product goal

Transform the current Home tab from a simple daily dashboard into the player's Training Hall: the first screen should feel like entering the daily discipline space for a Trading Cultivation RPG while preserving the existing local-first behavior, EXP rewards, journal warning, and Daily Quest completion rules.

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
  - morning plan: +10 EXP
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
  - `C.violet` and `C.violetDim` for system/training energy
  - `C.gold` and `C.goldDim` for identity/progression emphasis
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
- The updated Home remains mobile-first and visually consistent with the existing near-black, violet, gold, ash, and sage identity system.
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
