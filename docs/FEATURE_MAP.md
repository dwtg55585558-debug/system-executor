# System Executor Feature Map

## Product Summary

System Executor is an identity-based trading discipline system. The core loop is:

1. Calibrate identity at the start of the day.
2. Complete daily process tasks.
3. Record trades, waits, temptations, and violations honestly.
4. Reflect in a decision journal.
5. Review identity growth, integrity, behavioral patterns, and historical days.

The app intentionally avoids performance-based reinforcement. EXP is awarded for process behavior, while PnL is only stored as optional trade context.

## App Shell

### Entry Points

- `src/main.jsx`
  - Mounts React into `#root`.
  - Imports global CSS.
- `src/App.jsx`
  - Owns tab navigation state.
  - Loads app state through `useAppState`.
  - Creates the shared `ctx` object passed to pages.
  - Shows loading state.
  - Gates the main app behind daily `MorningCalibration`.
  - Renders global overlays.

### Navigation

Implemented by `BottomNav` and local `tab` state in `App.jsx`.

Tabs:

- `home`
- `practice`
- `journal`
- `system`
- `insight`

There is no URL routing.

## Data and Persistence Features

### Local State

Implemented in:

- `src/hooks/useAppState.js`
- `src/utils/helpers.js`
- `src/utils/storage.js`

Behavior:

- Load saved state from `localStorage`.
- Create default state when no saved state exists.
- Ensure today exists in `history`.
- Lightly migrate older day records by adding missing fields.
- Save state with a 250 ms debounce.
- Reset all progress after browser confirmation.

### Identity

Stored at `data.identity`.

Fields:

- `totalExp`
- `name`
- `integrity`
- `energy`
- `maxEnergy`
- `energyDate`

Mutations:

- `addExp(amount, label)`
- `updateIdentityName(name)`
- `adjustIntegrity(delta)`
- `spendEnergy(amount)`

Energy is daily trading decision energy. It has a fixed maximum of 40, resets to 40 on a new app load day, and decreases by 10 only after a new trade record is successfully created. Energy may go below 0 and must not be used as a PnL reward or penalty.

Logs:

- `expLog`
- `integrityLog`

### Daily Session

Created by `emptyDay(date)`.

Fields:

- `date`
- `calibration_done`
- `morning_plan`
- `workout`
- `reading`
- `checklist_pass`
- `checklistChecks`
- `trades`
- `stopLossMode`
- `successful_wait`
- `violations`
- `bossResists`
- `journal`
- `riskEvents`
- `eveningReflection`
- `aiMentor`
- `claimedRewards`

### Daily Baselines

Stored under `dailySnapshots[YYYY-MM-DD]`.

Purpose:

- Preserve the daily start baseline for the Home reset-today control.

Captured fields:

- full active day state, including quests, calibration, trades, journal, risk events, reflections, violations, and boss resists
- `stopLossMode`
- `claimedRewards`
- identity EXP, Integrity, Energy, Energy date, max Energy, and stats
- `expLog` and `integrityLog`
- `achievementsUnlocked`

Reset-today restores these captured fields while preserving the cultivator name, character creation state, and prior-date history. Today's trades and journal return to the daily start snapshot, so they are cleared when the snapshot had none.

## Feature Areas

## Startup Identity And Calibration

Files:

- `src/App.jsx`
- `src/components/MorningCalibration.jsx`
- `src/components/CultivatorNameModal.jsx`

Purpose:

- If `data.identity.name` is missing or blank, show the first-time cultivator naming overlay before the app.
- Save the trimmed name through `updateIdentityName`, changing only `identity.name`.
- On every app load, show a random cultivation calibration message before normal interaction.

Notes:

- Older saved states without `identity.name` are migrated to `執行者`.
- The startup calibration is app-load based, not daily-session based.

## Home

File:

- `src/pages/HomeTab.jsx`

Purpose:

- Present the current day, mission, quote, journal warning, and daily quest checklist.

Inputs:

- `ctx.day`
- `ctx.data`
- `ctx.today`
- `ctx.addReward`
- `ctx.updateDay`
- `ctx.showToast`
- `ctx.setTab`

Features:

- Time-based greeting.
- Daily quote from `QUOTES`.
- Journal gap warning using `journalGapDays`.
- Daily quest checklist.
- Morning calibration status summary:
  - reads `day.morning_plan`
  - links incomplete users to Practice
  - does not complete calibration or award EXP from Home
- Manual task completion:
  - workout: +20 EXP
  - reading: +20 EXP
- Derived checklist state for:
  - checklist pass
  - followed-strategy trade
  - successful wait
  - stop loss set
  - journal complete

Duplicated Responsibilities:

- Workout and reading rewards are completed from Home; morning calibration is completed from Practice.
- Daily quest completion is derived inline rather than through a selector.

## Practice

File:

- `src/pages/PracticeTab.jsx`

Purpose:

- Main behavior logging screen for process execution.

Inputs:

- `ctx.day`
- `ctx.data`
- `ctx.updateDay`
- `ctx.addExp`
- `ctx.adjustIntegrity`
- `ctx.showToast`
- `ctx.setBossCard`

Features:

- Morning plan.
- Pre-trade checklist.
- Trade creation and editing.
- New trade creation spends 10 Energy after the trade is committed.
- System validation for followed-strategy trades.
- Decision Risk Monitor.
- Successful wait logging.
- Evening reflection for no-trade evenings.
- Boss resistance logging.
- Violation logging.

### Morning Calibration

State:

- local `goal`
- persisted as `day.identityStatement`
- completion stored as `day.morning_plan`

Reward:

- +10 EXP

### Pre-Trade Checklist

Constants:

- `CHECKLIST_ITEMS`

State:

- `day.checklistChecks`
- `day.checklist_pass`

Reward:

- +20 EXP after all checklist items are checked.

### Trade Logging

Trade fields:

- `id`
- `accountType`
- `symbol`
- `direction`
- `followed_checklist`
- `emotion_affected`
- `stop_loss_set`
- `entry_reason`
- `r_value`
- `notes`
- `pnl`
- `ts`
- `edit_history`
- `edited_at`

Rules:

- `accountType` is stored on each trade as `exam` or `funded`. Missing legacy values fall back to `exam`.
- `symbol`, `entry_reason`, explicit yes/no `followed_checklist`, checked `stop_loss_set`, numeric `r_value`, and numeric `pnl` are required before a trade can be recorded.
- `notes` is optional.
- `followed_checklist === false` is valid and records an honest non-strategy trade.
- `emotion_affected` is optional, defaults to `false`, and marks that the trade was affected by emotion without blocking the trade record.
- Incomplete required fields show the toast `請完成所有必填交易欄位` and do not spend Energy or award EXP/stats.
- If `followed_checklist` has not been selected, the toast `請選擇是否符合策略` is shown and the trade is not recorded.
- New trade records spend 10 Energy regardless of PnL or whether the trade followed the checklist.
- Normal-mode trade record rewards are capped daily: the first new trade record grants +40 EXP and execution +1, the second through fourth each grant +10 EXP, and the fifth and later grant no trade-record reward.
- Trade record reward progress is stored in `day.claimedRewards.trade_record_rewards` as `count`, `exp`, and `executionGranted`.
- Trade record rewards are only granted on new trade creation. Editing does not grant rewards; deleting does not refund or lower the reward counter.
- `followed_checklist` no longer grants EXP or execution. It is a quality marker used for the strategy-trade task, calendar completion, review, future achievements, and statistics.
- `followed_checklist === false` can still receive trade-record rewards in normal mode when the daily trade-record reward cap has not been reached, but it does not complete the strategy-trade task or make the training calendar green.
- Account protection is derived separately for `exam` and `funded` trades.
- Protection activates for an account type when any same-day trade for that account has `pnl < 0`, that account's same-day cumulative P&L is below 0, or any same-day trade for that account has `emotion_affected === true`.
- Protection only affects the matching account type and requires the four-item protection confirmation before each later trade form for that account is shown.
- Protection does not block recording trades or spending Energy after confirmation.
- `stopLossMode` remains the higher-priority reward gate: trades can still be recorded and spend Energy, but new trades do not grant trade-record rewards and do not complete the strategy-trade quality task while stop-loss mode is active.
- Editing a trade appends field-level edit history.

Notes:

- PnL is required for trade logging so account protection can activate from negative values. PnL does not directly affect EXP.

### Decision Risk Monitor

Files:

- `src/pages/PracticeTab.jsx`
- `src/components/SystemCheckModal.jsx`
- `src/utils/helpers.js`

Detector:

- `detectRiskConditions(day, history)`

Risk reasons:

- recent consecutive negative PnL trades
- high frequency
- high emotion score
- existing violation today
- above average daily trade volume

Behavior:

- New trades can trigger a `SystemCheckModal`.
- User response is stored in `day.riskEvents`.
- Choosing `我現在依照系統` commits the pending trade through the normal trade path.
- Choosing `我現在受到情緒影響` does not commit the trade. It closes the modal and requires the four-item protection confirmation before the trade form is available again.

### Successful Wait

State:

- `day.successful_wait`

Reward:

- +50 EXP

### Evening Reflection

Constants:

- `EVENING_REFLECTION_REASONS`

Condition:

- Current hour is 18 or later.
- No trades recorded today.

State:

- `day.eveningReflection`

Reward:

- None.

### Boss Resistance

Constants:

- `BOSSES`

State:

- `day.bossResists`

Reward:

- +30 EXP once per boss per day.

### Violation Logging

Constants:

- `VIOLATION_TYPES`
- `BOSSES`

State:

- append to `day.violations`

Effects:

- add negative EXP from violation config
- reduce integrity by violation config
- show `BossCardOverlay`

## Journal

File:

- `src/pages/JournalTab.jsx`

Purpose:

- Capture daily decision reflection and show recent history.

Inputs:

- `ctx.day`
- `ctx.data`
- `ctx.today`
- `ctx.updateDay`
- `ctx.addExp`
- `ctx.showToast`
- `ctx.setReviewDate`

Features:

- Daily trade summary.
- Five-question journal.
- Required validation for questions 1, 2, and 5.
- Journal creation.
- Journal editing with field-level edit history.
- Journal deletion after confirmation.
- Recent history list.

Journal fields:

- `q1`
- `emotion`
- `q3`
- `q4`
- `q5`
- `linked_trade_ids`
- `ts`
- `edit_history`
- `edited_at`

Reward:

- +20 EXP on first journal completion.
- No additional EXP for edits.
- No EXP rollback on deletion.
- `day.claimedRewards.journal` and existing `expLog` entries prevent duplicate journal rewards after editing, deleting, or recreating today's journal.

Components:

- `YesNo`
- `StatMini`
- `HistoryList`

Known Issue:

- `HistoryList` passes `onClick` to `Card`, but `Card` does not forward that prop. Recent history rows may not open the day detail modal.

## System

File:

- `src/pages/SystemTab.jsx`

Purpose:

- Show identity progression, integrity, bosses, achievements, and reset control.

Inputs:

- `ctx.data`
- `ctx.lvl`
- `onReset`

Features:

- Identity ring.
- EXP progress to next level.
- System Integrity value.
- Title growth path.
- Integrity trend chart.
- Integrity reason/recovery messaging.
- Boss stats.
- Achievement wall.
- Reset progress button.

Derived Data:

- integrity chart from `data.integrityLog`
- boss encountered/defeated counts from history
- journal gap via `journalGapDays`
- achievement unlock state from `data.achievementsUnlocked`

Components:

- `IdentityRing`
- `Card`
- `SectionLabel`
- Recharts line chart

## Insight

File:

- `src/pages/InsightTab.jsx`

Purpose:

- Provide non-performance analytics on behavior and process quality.

Inputs:

- `ctx.data`
- `ctx.setReviewDate`

Features:

- Strategy adherence rate.
- Violation rate.
- Successful wait rate.
- Cumulative EXP growth chart.
- Decision quality trend.
- Emotion distribution.
- Boss frequency.
- Training calendar for monthly review.

Derived Metrics:

- total trades
- followed-strategy trades
- days with violations
- wait days
- emotion counts
- boss violation counts
- daily quality score
- cumulative EXP by day

Components:

- `StatBlock`
- `TrainingCalendar`
- Recharts area, line, and bar charts

Notes:

- Decision quality scoring is inline in this page and should become a selector if reused elsewhere.
- The training calendar marks a day red when violations exist. Otherwise it marks a day green only when the trading-training loop is complete: morning plan, checklist pass, journal, and either successful waiting or a followed-checklist trade. Workout and reading do not affect calendar completion.

## Day Replay

Files:

- `src/App.jsx`
- `src/components/DayDetailModal.jsx`
- `src/components/AIMentorPanel.jsx`
- `src/components/JournalSummaryRow.jsx`
- `src/components/MentorRow.jsx`

Purpose:

- Review a specific historical day.

Entry Points:

- `TrainingCalendar` in Insight.
- Intended from `HistoryList` in Journal, though currently affected by the `Card` prop forwarding issue.

Features:

- EXP net change for the selected day.
- Integrity delta when available.
- Morning calibration statement.
- Task completion summary.
- Trade list.
- Violation list.
- Boss resistance list.
- Decision risk events.
- Evening reflection.
- Decision journal summary.
- AI Mentor analysis.

## AI Mentor

File:

- `src/components/AIMentorPanel.jsx`

Purpose:

- Generate a behavioral review for a historical day using the user's Anthropic API key.

Storage:

- API key stored in localStorage under `system-executor-anthropic-key`.

Request:

- Browser `fetch` to `https://api.anthropic.com/v1/messages`.
- Uses `anthropic-dangerous-direct-browser-access`.
- Model string: `claude-sonnet-4-6`.

Payload Sanitization:

- Sends tasks, checklist, trades, violations, boss resists, risk events, evening reflection, and journal summary.
- Omits trade `pnl`.

Saved Output:

- `session.aiMentor.followed_system`
- `session.aiMentor.dominant_pattern`
- `session.aiMentor.biggest_deviation`
- `session.aiMentor.one_improvement`
- `session.aiMentor.generated_at`

Architecture Note:

- API key storage, request construction, network call, response parsing, and UI state are currently in one component.

## Achievements

Files:

- `src/utils/constants.js`
- `src/hooks/useAppState.js`
- `src/components/AchievementModal.jsx`
- `src/pages/SystemTab.jsx`

Achievement checks use aggregate stats from `computeStats(data)`.

Current achievements:

- first successful wait
- 30 followed-strategy trades
- 7-day journal streak
- 7-day no-violation streak
- 100-day quest streak
- integrity back to 100%

Unlock Flow:

1. `useAppState` recomputes stats.
2. It filters locked achievements whose `check(stats)` returns true.
3. It appends unlocked ids to `data.achievementsUnlocked`.
4. It exposes the first newly unlocked achievement.
5. `App` renders `AchievementModal`.

## Reusable Components

General reusable components:

- `Card`
- `SectionLabel`
- `ToggleRow`
- `YesNo`
- `StatMini`
- `StatBlock`
- `ConfirmModal`
- `Toast`
- `BottomNav`

Reusable but domain-specific components:

- `IdentityRing`
- `TrainingCalendar`
- `HistoryList`
- `JournalSummaryRow`
- `MentorRow`

Feature-specific components:

- `MorningCalibration`
- `SystemCheckModal`
- `BossCardOverlay`
- `AchievementModal`
- `DayDetailModal`
- `AIMentorPanel`

## Domain Rule Locations

| Rule | Current Location |
| --- | --- |
| Day shape | `helpers.emptyDay` |
| Default state | `helpers.defaultState` |
| Level thresholds | `levels.js` |
| Title lookup | `levels.js`, `constants.TITLE_BANDS` |
| Achievement stats | `helpers.computeStats` |
| Achievement definitions | `constants.ACHIEVEMENTS` |
| Journal gap | `helpers.journalGapDays` |
| Risk detection | `helpers.detectRiskConditions` |
| Morning calibration reward | `PracticeTab` |
| Workout/reading rewards | `HomeTab` |
| Checklist reward | `PracticeTab` |
| Followed-strategy trade reward | `PracticeTab` |
| Successful wait reward | `PracticeTab` |
| Boss resistance reward | `PracticeTab` |
| Violation penalty | `PracticeTab` |
| Journal reward | `JournalTab` |
| Decision quality score | `InsightTab` |
| Boss stats | `SystemTab`, `InsightTab` |

## Recommended Feature Ownership

If the application grows, split feature ownership like this:

```text
domain/
  rewards.js       all EXP/integrity rule application
  trades.js        trade creation, validation, edit history
  journals.js      journal validation, save/update, edit history
  risk.js          risk condition detection and labels
  selectors.js     derived data for pages and charts
  achievements.js  achievement stats and unlock checks
  day.js           day shape, daily completion, migrations
services/
  aiMentor.js      API key, sanitized payload, network call
```

Pages should then mostly:

- read selectors
- hold temporary form state
- dispatch domain commands through `updateDay`
- render UI

## Current Implementation Status

The app is coherent and functional as a local-first personal tool. The main maintenance concern is duplicated domain logic in pages, not the absence of infrastructure. The safest next step is extracting pure domain helpers and adding tests around those helpers before introducing new product features.
