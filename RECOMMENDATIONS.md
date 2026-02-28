# AI Lab Tycoon — Codebase Enhancement Recommendations

## Project Overview

| Attribute | Value |
|-----------|-------|
| Stack | React 19 + TypeScript 5.9 + Zustand 5 + Vite 7 + Tailwind 4 |
| Total source files | ~47 (`.ts`/`.tsx`) |
| Total lines of code | ~14,160 |
| Test files | 2 (`App.test.tsx`, `gameStore.test.ts`) |
| CI/CD | None configured |

---

## 1. Architecture: Split the Monolithic Game Store

**Problem:** `gameStore.ts` is 2,069 lines — a single Zustand store containing all game
state, financial logic, project management, research trees, competitions, events, save/load,
and more. This makes it hard to navigate, test, and extend.

**Recommendation:** Break the store into domain-specific slices using Zustand's `slice` pattern:

```
src/store/
  gameStore.ts        → Thin orchestration layer, re-exports combined store
  slices/
    financeSlice.ts   → money, revenue, expenses, calculateDailyFinance
    projectSlice.ts   → project CRUD, updateProjectsForDay, completion logic
    employeeSlice.ts  → hiring, firing, morale, training, burnout
    researchSlice.ts  → research tree, node unlocking
    officeSlice.ts    → rooms, upgrades, layout management
    competitionSlice.ts → competitor AI, market share
    saveSlice.ts      → save/load, localStorage interaction
```

Each slice exports its own types, pure helper functions, and the slice creator.
The main `gameStore.ts` composes them with `create((...a) => ({ ...financeSlice(...a), ...projectSlice(...a), ... }))`.

**Impact:** High — enables focused testing, parallel development, and easier onboarding.

---

## 2. Extract Game Balance Constants

**Problem:** 30+ magic numbers are scattered across `gameStore.ts`, `officeLayouts.ts`, and
various components. Examples:
- `0.5`, `0.3` — skill calculation multipliers
- `40` — morale threshold
- `0.85` — low morale penalty
- `0.12` — quality increase cap
- `1000` — base revenue multiplier

**Recommendation:** Create a `src/config/gameBalance.ts` file:

```ts
export const GAME_BALANCE = {
  project: {
    baseRevenueMultiplier: 1000,
    teamSizeBonus: 0.05,
    qualityIncreaseCap: 0.12,
    skillWeights: { development: 0.7, management: 0.3 },
  },
  morale: {
    lowThreshold: 40,
    lowPenalty: 0.85,
    burnoutReductionCap: 0.8,
  },
  office: {
    computerBonusMultiplier: 0.1,
  },
  // ... etc
} as const;
```

**Impact:** Medium — makes game balance tuning trivial and self-documenting, enables
future UI for live balance tweaking.

---

## 3. Eliminate Duplicated localStorage Access

**Problem:** The pattern `JSON.parse(localStorage.getItem('aiLabTycoonSave') || '{}')`
appears **31 times** in `achievements.ts` alone, plus additional occurrences in `events.ts`.

**Recommendation:** Create a shared utility:

```ts
// src/utils/saveData.ts
const SAVE_KEY = 'aiLabTycoonSave';

export function getSaveData(): Record<string, unknown> {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
  } catch {
    return {};
  }
}
```

Note: `events.ts` already has a local `getSaveData()` helper — promote it to a shared
utility and use it everywhere.

**Impact:** Medium — reduces 31 duplicate lines to 1 import, adds error handling in one place.

---

## 4. Improve Type Safety — Eliminate `any`

**Problem:** 11 instances of `any` type across the codebase:
- `achievements.ts`: `(r: any)` used in 10+ array callbacks
- `ParticleEffects.tsx` / `NotificationToast.tsx`: `as any` for custom event types
- `TutorialOverlay.tsx`: `gameState as any` in condition check

**Recommendation:**
1. In `achievements.ts`, import the proper `Room` / `ResearchNode` types and replace
   `(r: any)` with `(r: ResearchNode)` etc.
2. For custom DOM events, define typed event helpers:
   ```ts
   // src/utils/customEvents.ts
   export function dispatchCustomEvent<T>(name: string, detail: T) {
     window.dispatchEvent(new CustomEvent(name, { detail }));
   }
   ```
3. For `TutorialOverlay.tsx`, use a proper type guard instead of `as any`.

**Impact:** Medium — prevents runtime bugs, improves IDE autocompletion, catches errors at
compile time.

---

## 5. Drastically Expand Test Coverage

**Problem:** Only 2 test files exist:
- `App.test.tsx` — 1 smoke test ("renders without crashing")
- `gameStore.test.ts` — ~368 lines covering store actions

No component tests, no data module tests, no integration tests, no end-to-end tests.
Critical game logic (project completion, finance calculation, achievement unlocking) has
minimal coverage.

**Recommendation:**
1. **Unit tests for pure functions** — extract and test helpers from `gameStore.ts`:
   - `calculateRoomBonuses()` — already exported
   - `calculateDailyFinance()` — already exported
   - `computeCombinedBonuses()` — already exported
   - `evolveCompetitors()` — already exported
   - Achievement condition checkers

2. **Component tests** — use `vitest` + `@testing-library/react`:
   - `TopBar` — renders money/day/reputation correctly
   - `ProjectsPanel` — team assignment logic
   - `EventModal` — event choices trigger correct state changes

3. **Integration tests** — test multi-day game progression:
   - Start game → hire employees → assign to project → advance days → project completes
   - Save game → modify state → load game → verify restoration

4. **Add `@testing-library/react`** as a dev dependency (currently missing).

**Impact:** High — prevents regressions, enables confident refactoring of the store split.

---

## 6. Add Error Boundaries and Save Data Validation

**Problem:**
- No React error boundaries — a rendering error in one component crashes the entire app.
- `loadGame()` has a try-catch that logs and returns `false`, but doesn't validate the
  shape of the loaded data. Corrupted localStorage could cause subtle bugs.

**Recommendation:**
1. Add a top-level `<ErrorBoundary>` component wrapping `<GameScreen>` that shows a
   recovery UI with a "Reset Game" option.
2. Add a schema validator for save data (a simple runtime type check or use a library like
   `zod` — lightweight at ~13KB):
   ```ts
   function validateSaveData(data: unknown): data is GameState {
     return (
       typeof data === 'object' && data !== null &&
       typeof (data as any).money === 'number' &&
       Array.isArray((data as any).employees)
       // ...key fields
     );
   }
   ```

**Impact:** Medium — prevents white-screen crashes and corrupted save states.

---

## 7. Break Down Large Components

**Problem:** Several components exceed 700 lines:

| Component | Lines | Issue |
|-----------|-------|-------|
| `OfficeView.tsx` | 1,052 | Embedded styles, animation logic, upgrade slots, room rendering |
| `TitleScreen.tsx` | 879 | Full panorama engine with 3D calculations |
| `ProjectsPanel.tsx` | 761 | Team assignment + project list + progress bars |
| `IsometricGrid.tsx` | 731 | Grid logic + rendering + interaction handling |
| `EmployeesPanel.tsx` | 547 | Employee list + details + hiring + training |

**Recommendation:** Extract sub-components and custom hooks:
- `OfficeView` → `UpgradeSlot`, `RoomTile`, `useOfficeInteraction`
- `ProjectsPanel` → `ProjectCard`, `TeamAssigner`, `ProgressBar`
- `TitleScreen` → `PanoramaRenderer`, `BuildingScene`, `MenuOverlay`
- `EmployeesPanel` → `EmployeeCard`, `HiringModal`, `useEmployeeFilters`

**Impact:** Medium — improves readability, reusability, and render performance
(smaller components = more granular React memoization).

---

## 8. Add CI/CD Pipeline

**Problem:** No CI/CD configuration exists (no `.github/workflows/`, no build verification).

**Recommendation:** Add a GitHub Actions workflow:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

**Impact:** Medium — catches broken builds before merge, enforces lint/type/test standards.

---

## 9. Performance: Optimize Re-renders

**Problem:** The Zustand store is one large object. Any state change (e.g., money updating)
causes all subscribing components to re-render, even if they only care about unrelated state.

**Recommendation:**
1. Use **Zustand selectors** everywhere:
   ```tsx
   // Instead of:
   const { money, day } = useGameStore();
   // Use:
   const money = useGameStore(s => s.money);
   const day = useGameStore(s => s.day);
   ```
2. Use `useShallow` from `zustand/react/shallow` for multi-value selections:
   ```tsx
   const { money, day } = useGameStore(useShallow(s => ({ money: s.money, day: s.day })));
   ```
3. After the store split (Recommendation 1), components naturally subscribe to narrower
   state slices.

**Impact:** Medium — reduces unnecessary re-renders, especially in the game loop where
state updates every tick.

---

## 10. Improve Developer Experience

**Problem:** Missing tooling that modern React projects benefit from.

**Recommendations:**

| Tool | Purpose | Effort |
|------|---------|--------|
| **Prettier** | Consistent code formatting | Low — add `.prettierrc`, one `npx prettier --write .` run |
| **Husky + lint-staged** | Pre-commit hooks for lint/format | Low |
| **Path aliases** | Replace `../../../data/` with `@/data/` | Low — already using Vite |
| **Storybook** (optional) | Component isolation/documentation | Medium |
| **React DevTools Profiler guidance** | Document how to profile game loop perf | Low |

---

## 11. Accessibility

**Problem:** As a game, accessibility may not be the top priority, but basic improvements
help:

- Keyboard shortcuts exist (`KeyboardShortcuts.tsx`) but no visible shortcut legend in-game.
- No ARIA labels on interactive game elements.
- Color-dependent status indicators without text alternatives.

**Recommendation:**
1. Add a keyboard shortcut overlay/help panel (accessible via `?` key).
2. Add `aria-label` to key interactive elements (buttons, panels).
3. Ensure sufficient color contrast in the UI theme.

**Impact:** Low — incremental improvement, good practice.

---

## 12. Save System Robustness

**Problem:** The save system uses raw `localStorage` with a single key. Risks include:
- No versioning — schema changes break old saves
- No migration path
- No backup/export feature
- 5MB localStorage limit could be hit with large game states

**Recommendation:**
1. Add a `saveVersion` field to the save data.
2. Implement a migration system:
   ```ts
   const MIGRATIONS: Record<number, (data: any) => any> = {
     1: (data) => ({ ...data, newField: defaultValue }),
     2: (data) => { /* transform */ return data; },
   };
   ```
3. Add an export/import save feature (download/upload JSON).
4. Consider IndexedDB for larger saves (via `idb-keyval` — 1KB library).

**Impact:** Medium — critical for players who invest time in long game sessions.

---

## Summary — Priority Matrix

| # | Recommendation | Impact | Effort | Priority |
|---|----------------|--------|--------|----------|
| 1 | Split monolithic game store | High | High | P1 |
| 5 | Expand test coverage | High | Medium | P1 |
| 2 | Extract game balance constants | Medium | Low | P1 |
| 3 | Deduplicate localStorage access | Medium | Low | P1 |
| 4 | Eliminate `any` types | Medium | Low | P2 |
| 8 | Add CI/CD pipeline | Medium | Low | P2 |
| 6 | Error boundaries + save validation | Medium | Medium | P2 |
| 9 | Optimize re-renders with selectors | Medium | Medium | P2 |
| 7 | Break down large components | Medium | High | P3 |
| 10 | Developer experience tooling | Low | Low | P3 |
| 12 | Save system robustness | Medium | Medium | P3 |
| 11 | Accessibility improvements | Low | Low | P3 |

**Recommended starting order:** 3 → 2 → 4 → 5 → 1 → 8 (low-effort wins first, then the
big architectural refactor backed by tests).
