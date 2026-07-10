# System Executor Architecture Review

## Scope

This review covers the current React + Vite application under `src/`. It is based on a full read of:

- `src/pages/*`
- `src/components/*`
- `src/hooks/*`
- `src/utils/*`
- `src/styles/*`
- `src/App.jsx` and `src/main.jsx`

No source code changes were made as part of this review.

## High-Level Shape

System Executor is a local-first, mobile-first discipline tracker for trading behavior. It is intentionally centered on identity, process, journaling, and self-review rather than trading PnL.

The app is a single React tree with manual tab routing. There is no React Router, backend service, server state, or global state library. All persistent product data is stored in browser `localStorage`.

```text
src/
  main.jsx              React mount point
  App.jsx               App shell, tab selection, global overlays
  hooks/
    useAppState.js      Persistent app state and core mutations
    useToast.js         Toast state/timer
  pages/                Five top-level tab screens
  components/           Shared UI and feature-specific panels/modals
  utils/                Domain constants, state helpers, storage, levels
  styles/               Tailwind entry and design tokens
```

## Runtime Flow

1. `src/main.jsx` mounts `<App />` inside `React.StrictMode`.
2. `App.jsx` initializes local UI state:
   - active tab
   - active boss overlay
   - selected review date
   - toast state through `useToast`
3. `App.jsx` calls `useAppState(showToast)`.
4. `useAppState` loads saved state from `localStorage`, performs light migration for older day records, ensures today exists, computes stats and level, checks achievements, and returns the current app context.
5. If app state is loading, `App` renders a loading screen.
6. If `data.identity.name` is missing or blank, `App` renders the first-time cultivator naming overlay.
7. `App` renders one of five page components based on the selected tab:
   - `HomeTab`
   - `PracticeTab`
   - `JournalTab`
   - `SystemTab`
   - `InsightTab`
8. On every app load, `App` renders `MorningCalibration` as a startup overlay until the user confirms calibration.
9. `App` renders shared overlays outside the active page:
   - `BottomNav`
   - `Toast`
   - `MorningCalibration`
   - `BossCardOverlay`
   - `AchievementModal`
   - `DayDetailModal`

## State Model

The persisted root state is created by `defaultState()` in `src/utils/helpers.js`.

```text
state
  identity
    name
    totalExp
    integrity
    energy
    maxEnergy
    energyDate
    stats
  history
    YYYY-MM-DD
      date
      calibration_done
      morning_plan
      workout
      reading
      checklist_pass
      checklistChecks
      trades
        accountType
      stopLossMode
      successful_wait
      violations
      bossResists
      journal
      riskEvents
      eveningReflection
      aiMentor
      claimedRewards
  dailySnapshots
    YYYY-MM-DD
      day
      identity
      expLog
      achievementsUnlocked
  expLog
  integrityLog
  achievementsUnlocked
```

The active day is derived with `todayStr()` and read as `data.history[today]`. If a missing day is detected, `useAppState` inserts `emptyDay(today)`.

`dailySnapshots[date]` stores the daily start baseline for reset-today behavior. It captures the full active day state, claimed reward flags, identity EXP, Integrity, Energy, stats, EXP/integrity logs, and unlocked achievements as they were at day initialization. Resetting today restores those baseline fields while preserving identity name, character creation state, and all prior-date history.

`identity.name` is the cultivator display name shown on the Home character card. New default state leaves it empty so first-time users must create an identity name. Older saved states without `identity.name` are migrated to `執行者`.

`identity.energy` is daily trading decision energy. `maxEnergy` is fixed at 40. On app load, missing energy fields are migrated, and a stale `energyDate` resets energy to 40 for the current date. Same-day loads preserve the existing energy value, including negative values.

### Persistence

`src/utils/storage.js` wraps browser `localStorage` under the key `system-executor-state`.

`useAppState` writes changes with a 250 ms debounce. Storage functions are async by signature, but currently perform synchronous localStorage operations.

### Mutation API

`useAppState` exposes:

- `addExp(amount, label)`
- `adjustIntegrity(delta)`
- `updateIdentityName(name)`
- `spendEnergy(amount)`
- `updateDay(mutator)`
- `updateHistoryDay(date, mutator)`
- `resetTodayToBaseline()`
- `resetAllData()`
- `resetProgress()`
- `clearUnlockedAchievement()`

This is the main boundary between feature UI and persisted state. Most feature pages receive these functions through a broad `ctx` prop.

## Page Responsibilities

### `HomeTab`

Home is the daily dashboard. It renders:

- greeting and date
- mission card
- quote
- journal gap warning
- daily quest checklist
- low-emphasis reset controls for today's baseline and full character data

It derives completion state from today's day object. Home shows morning calibration as a status summary and routes incomplete users to Practice. Manual task completion for workout and reading is handled inline and awards EXP directly from the page.

### `PracticeTab`

Practice is the largest feature module. It owns:

- morning calibration input, boundary checks, reminder, and completion
- pre-trade checklist toggles and completion
- trade form local state
- trade creation and editing
- new trade energy spending
- trade edit history diffing
- required-field validation for trade logging
- account protection state derived per account type from today's trades
- trade record rewards tracked with `claimedRewards.trade_record_rewards`
- decision risk monitor trigger
- risk check response logging
- successful wait logging
- boss resistance logging
- violation confirmation and penalty logging
- evening reflection for no-trade days

This page mixes view layout, form state, validation, reward logic, penalty logic, edit-history generation, and risk flow orchestration.

Morning calibration is completed once per day and is the entry gate for all normal daily trading activity. The pre-trade Checklist is an execution-permission flow that is locked until morning calibration is complete and must then be completed before every normal-mode new trade. A normal trade requires both `day.morning_plan === true` and `day.checklist_pass === true`. `day.checklist_pass` stores whether permission for the next trade is currently valid, while `day.claimedRewards.checklist` stores that the Checklist has been completed at least once today and its daily reward has been claimed. The first completion each day grants the existing +20 EXP and discipline +1 reward; later completions only renew execution permission. Every successfully created non-stop-loss-mode trade clears `checklist_pass` and `checklistChecks`. Editing an existing trade and recording a trade in manual stop-loss mode remain exceptions and do not require or clear this permission.

The new-trade form is collapsed by default and is opened deliberately for each trade through the `Execute trade N` entry, where N is today's trade count plus one. Checklist completion unlocks this entry but does not open the form. The selected account remains available while collapsed so account protection can be evaluated before the form opens. When protection is active, opening a trade shows the existing protection confirmation first and reveals the form only after confirmation. Decision Risk Check remains a post-submit check. Editing opens the populated form directly, while successful creation, successful editing, and cancellation collapse it again. This open/collapsed state is local UI state and is not persisted.

Trade logging rewards honest recordkeeping rather than profitability or strategy quality. In normal mode, the first new trade record of a day grants +40 EXP and execution +1, the second through fourth new trade records grant +10 EXP each, and later records grant no trade-record reward. `claimedRewards.trade_record_rewards` stores the rewarded count, total rewarded EXP, and whether execution has already been granted so editing or deleting trades cannot re-award the same day. `followed_checklist` is a required yes/no quality mark, not an EXP source.

Account protection is automatic and local to `PracticeTab`. Each trade stores `accountType` as `exam` or `funded`; missing legacy values are treated as `exam`. Each trade may also store `emotion_affected`; missing legacy values are treated as `false`. The page derives protection state separately for each account type by summing today's P&L and checking whether any same-day trade for that account has `pnl < 0` or `emotion_affected === true`. If a negative trade exists, cumulative P&L is below 0, or an emotion-affected trade exists, that account type enters protection. Protection shows an account-specific card and requires the four-item protection confirmation before each later trade form for that same account is available. Protection does not block trade recording or Energy spending after confirmation. Manual `stopLossMode` remains the higher-priority reward restriction: trades are still recorded through the normal path and spend Energy, but trade-record rewards and the strategy-trade quality task are not granted by trades added while stop-loss mode is active.

### `JournalTab`

Journal renders the five-question daily journal and today's trading summary. It owns:

- local journal form state
- journal required-field validation
- journal creation and update
- journal deletion
- journal edit-history diffing
- journal EXP award and claimed-reward guard
- recent history list construction

### `SystemTab`

System shows identity and progression. It derives:

- level and title display
- EXP progress
- integrity trend data
- integrity explanation/recovery text
- boss encounter/resistance stats
- achievement wall state

It also exposes reset progress through `onReset`, which is provided by `App`.

### `InsightTab`

Insight is analytics-focused and computes:

- strategy adherence rate
- violation rate
- successful wait rate
- emotion distribution
- boss violation frequency
- decision quality trend
- cumulative EXP growth
- training calendar

Most insight calculations are inline selectors inside the component.

## Component Layers

### Reusable UI Primitives

These components are broadly reusable:

- `Card`
- `SectionLabel`
- `ToggleRow`
- `YesNo`
- `StatMini`
- `StatBlock`
- `Toast`
- `ConfirmModal`
- `BottomNav`

### Reusable Visualization Components

- `IdentityRing`
- `TrainingCalendar`

### Feature-Specific Components

These components are tied to product workflows:

- `MorningCalibration`
- `SystemCheckModal`
- `BossCardOverlay`
- `AchievementModal`
- `DayDetailModal`
- `AIMentorPanel`
- `HistoryList`
- `JournalSummaryRow`
- `MentorRow`

### Notable Component Contract Issue

`HistoryList` passes `onClick` into `Card`, but `Card` does not forward unknown props to its root `<div>`. As written, history rows appear clickable but the `onSelect` handler is likely not invoked from `HistoryList`.

`TrainingCalendar` uses native `<button>` elements and should still trigger day review correctly.
Its completion color is based on the trading-training loop: morning plan, checklist pass, journal, and either successful waiting or a followed-checklist trade. Workout and reading are not part of this calendar status.

## Utilities and Domain Rules

### `constants.js`

Holds static domain vocabulary and product configuration:

- title bands
- quotes
- bosses
- violation types
- emotion tags
- checklist items
- journal gap warning threshold
- risk reason labels
- evening reflection reasons
- achievements
- rarity colors

### `helpers.js`

Holds mixed utility and domain logic:

- date formatting
- clamping
- id generation
- empty day/default state factories
- decision risk condition detection
- journal gap detection
- aggregate stats for achievements
- violation lookup helper

### `levels.js`

Owns level threshold math and title lookup.

### `storage.js`

Owns localStorage read/write/delete.

## Duplicated or Scattered Responsibilities

### Reward and Penalty Rules

EXP and integrity rules are currently distributed across feature pages:

- workout and reading daily task rewards in `HomeTab`
- checklist, morning calibration, followed-strategy, waiting, boss resistance, and violation rules in `PracticeTab`
- journal completion reward in `JournalTab`

The state hook provides `addExp` and `adjustIntegrity`, but the domain rules deciding when and why to call them live in pages.

### Trade and Journal Edit History

`PracticeTab` and `JournalTab` both implement field comparison and append edit history records. The fields differ, but the responsibility is the same.

### Derived Analytics

Stats are calculated in multiple places:

- achievement stats in `computeStats`
- insight metrics in `InsightTab`
- boss stats in `SystemTab`
- daily review summaries in `DayDetailModal`
- home quest completion in `HomeTab`

This is manageable today, but more reports or more reward rules will increase duplication risk.

### Modal Shells

Several overlay components repeat fixed-position backdrop, centering, rounded panel, and border styling:

- `ConfirmModal`
- `BossCardOverlay`
- `AchievementModal`
- `SystemCheckModal`
- `DayDetailModal`

A generic modal shell would reduce visual drift.

### Form Controls and Inline Styling

Inputs and buttons repeat similar inline style blocks across pages. Theme tokens are centralized, but component-level form primitives are not.

### AI Mentor Boundary

`AIMentorPanel` combines:

- API key persistence
- request payload construction
- Anthropic browser request
- response parsing
- error state
- display state

This is acceptable for a local-only tool, but it is the clearest candidate for extraction if the app becomes multi-user or deployable.

## Architectural Strengths

- The app is easy to run and reason about because it has one state hook and no backend.
- Product constants are centralized enough to understand the domain vocabulary quickly.
- EXP is structurally separated from PnL; PnL is recorded but not used for rewards.
- AI Mentor sanitizes the session payload and intentionally omits PnL.
- The UI is broken into readable tabs that match product workflows.
- The local-first model is appropriate for personal journaling and sensitive trading behavior.

## Architectural Risks

- The broad `ctx` prop makes page dependencies implicit. A page can reach most app capabilities whether it needs them or not.
- Business rules are implemented in UI components, especially `PracticeTab`.
- Derived metrics are not consistently centralized, making future changes easy to apply in one screen but miss in another.
- There is no test coverage for domain rules such as EXP awards, risk detection, journal streaks, edit history, or insight calculations.
- Local migrations are ad hoc inside `useAppState`; future schema changes will make the hook harder to maintain.
- Direct browser calls to Anthropic require users to store an API key in localStorage. The README correctly documents this as local-only and not suitable for public deployment.

## Recommended Architecture

The current architecture is reasonable for the app size. A large rewrite is not needed. The best path is incremental extraction around domain rules and selectors.

### Proposed Structure

```text
src/
  app/
    App.jsx
    routes.js or tabs.js
  domain/
    stateShape.js
    rewards.js
    trades.js
    journals.js
    achievements.js
    risk.js
    selectors.js
    migrations.js
  services/
    storage.js
    aiMentor.js
  hooks/
    useAppState.js
    useToast.js
  components/
    ui/
      Card.jsx
      Modal.jsx
      Button.jsx
      TextInput.jsx
      SectionLabel.jsx
    feature/
      ...
  pages/
    HomeTab.jsx
    PracticeTab.jsx
    JournalTab.jsx
    SystemTab.jsx
    InsightTab.jsx
```

### Priority Refactors

1. Extract domain commands for user actions:
   - complete morning calibration
   - complete checklist
   - add/update trade
   - log successful wait
   - resist boss
   - log violation
   - save journal
2. Extract selectors for repeated derived data:
   - daily quest completion
   - boss stats
   - insight metrics
   - day detail summary
   - quality score
3. Extract edit-history helpers for trades and journals.
4. Add a reusable `Modal` shell and allow `Card` to forward DOM props.
5. Move AI Mentor request/key handling into a service or hook.
6. Add focused tests around pure domain modules once extracted.

## Testing Recommendations

The highest-value tests would target pure functions, not rendered UI:

- `computeLevel`
- `computeStats`
- `detectRiskConditions`
- `journalGapDays`
- reward command behavior
- violation/integrity behavior
- trade edit history generation
- journal edit history generation
- insight metric selectors
- AI Mentor payload sanitization, especially PnL omission

## Conclusion

System Executor is currently a pragmatic local-first React app with a clear product model and centralized persistence. Its main architectural issue is not file organization; it is that feature pages carry too much domain logic. The recommended direction is to keep the simple app shell but move business rules and derived metrics into pure domain modules, leaving pages responsible for layout and interaction orchestration.
