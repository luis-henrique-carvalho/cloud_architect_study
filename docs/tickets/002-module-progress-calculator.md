---
title: "Module Progress Calculator — pure function + unit tests"
status: "needs-triage"
type: "AFK"
parent: "docs/prd/phase-04-dashboard-e-catalogo.md"
blocked_by: []
user_stories: [12, 13, 14, 15]
---

## Parent

docs/prd/phase-04-dashboard-e-catalogo.md

## What to build

Add a `calculateModuleProgress` pure function to the existing `learner-state/progress` module. The function receives a `StudyModule` and a flat array of `ResourceProgress[]` (all rows for any module) and returns `{ completed: number; total: number; percent: number; isComplete: boolean }`.

Rules:

- Count only Required Study Resources.
- A resource is complete when its `ResourceProgress` row exists and `completedAt` is non-null.
- A resource with no row counts as incomplete.
- `percent` is `Math.round((completed / total) * 100)` or `0` when `total === 0`.
- `isComplete` is `true` when `total === 0` or `completed === total`.

Export the function and its return type from the existing `src/modules/learner-state/index.ts` barrel.

Write unit tests covering all formula branches.

## Acceptance criteria

- [ ] Function is exported from `src/modules/learner-state/index.ts`
- [ ] Returns `{ completed: 0, total: 0, percent: 0, isComplete: true }` for a module with no Required Study Resources
- [ ] Returns `isComplete: false` when at least one Required Study Resource has no `completedAt`
- [ ] Returns `isComplete: true` when all Required Study Resources have `completedAt` set
- [ ] Calculates `percent` correctly for partial completion (e.g. 2 of 4 → 50)
- [ ] Ignores Complementary Study Resources in all calculations
- [ ] Treats a `completedAt: null` row as incomplete
- [ ] All tests pass (`npm run test`)

## Blocked by

None — can start immediately.
