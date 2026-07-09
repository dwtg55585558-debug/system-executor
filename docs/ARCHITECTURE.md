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
6. If today has not completed `calibration_done`, `App` renders `MorningCalibration`.
7. Otherwise, `App` renders one of five page components based on the selected tab:
   - `HomeTab`
   - `PracticeTab`
   - `JournalTab`
   - `SystemTab`
   - `InsightTab`
8. `App` renders shared overlays outside the active page:
   - `BottomNav`
   - `Toast`
   - `BossCardOverlay`
   - `AchievementModal`
   - `DayDetailModal`

## State Model

The persisted root state is created by `defaultState()` in `src/utils/helpers.js`.

```text
state
  identity
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
      successful_wait
      violations
      bossResists
      journal
      riskEvents
      eveningReflection
      aiMentor
  expLog
  integrityLog
  achievementsUnlocked
```

The active day is derived with `todayStr()` and read as `data.history[today]`. If a missing day is detected, `useAppState` inserts `emptyDay(today)`.

`identity.energy` is daily trading decision energy. `maxEnergy` is fixed at 40. On app load, missing energy fields are migrated, and a stale `energyDate` resets energy to 40 for the current date. Same-day loads preserve the existing energy value, including negative values.

### Persistence

`src/utils/storage.js` wraps browser `localStorage` under the key `system-executor-state`.

`useAppState` writes changes with a 250 ms debounce. Storage functions are async by signature, but currently perform synchronous localStorage operations.

### Mutation API

`useAppState` exposes:

- `addExp(amount, label)`
- `adjustIntegrity(delta)`
- `spendEnergy(amount)`
- `updateDay(mutator)`
- `updateHistoryDay(date, mutator)`
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

It derives completion state from today's day object. Manual task completion for morning plan, workout, and reading is handled inline and awards EXP directly from the page.

### `PracticeTab`

Practice is the largest feature module. It owns:

- morning plan input and completion
- pre-trade checklist toggles and completion
- trade form local state
- trade creation and editing
- new trade energy spending
- trade edit history diffing
- system validation for followed-strategy trades
- decision risk monitor trigger
- risk check response logging
- successful wait logging
- boss resistance logging
- violation confirmation and penalty logging
- evening reflection for no-trade days

This page mixes view layout, form state, validation, reward logic, penalty logic, edit-history generation, and risk flow orchestration.

### `JournalTab`

Journal renders the five-question daily journal and today's trading summary. It owns:

- local journal form state
- journal required-field validation
- journal creation and update
- journal edit-history diffing
- journal EXP award
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
- 28-day streak heatmap

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
- `StreakHeatmap`

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

`StreakHeatmap` uses native `<button>` elements and should still trigger day review correctly.

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

- manual daily task rewards in `HomeTab`
- checklist, morning plan, followed-strategy, waiting, boss resistance, and violation rules in `PracticeTab`
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
   - complete morning plan
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
