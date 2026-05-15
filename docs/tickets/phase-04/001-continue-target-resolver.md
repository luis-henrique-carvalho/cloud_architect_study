---
title: "Continue Target Resolver — pure function + unit tests"
status: "needs-triage"
type: "AFK"
parent: "docs/prd/phase-04-dashboard-e-catalogo.md"
blocked_by: []
user_stories: [1, 2, 3, 4, 18]
---

## Parent

docs/prd/phase-04-dashboard-e-catalogo.md

## What to build

Create a new `learner-state/continue-target` module that exports a pure function resolving the Continue Target from pre-fetched Learner State data. No database access inside the function — the caller passes in collections of `StudyModule[]`, `ResourceVisit[]`, and `ResourceProgress[]`.

Algorithm:

1. Find the most recent `ResourceVisit` whose corresponding resource has `completedAt === null` in `ResourceProgress`.
2. If none, find the first Required Study Resource in module order that has no completed `ResourceProgress` row.
3. If all Required Study Resources across all modules are complete, return `null`.

The function returns `{ moduleSlug: string; resourceKey: string } | null`.

Export the function and its return type from the existing `src/modules/learner-state/index.ts` barrel.

Write unit tests covering all algorithm branches.

## Acceptance criteria

- [ ] Function is exported from `src/modules/learner-state/index.ts`
- [ ] Returns `null` when `modules` array is empty
- [ ] Returns `null` when all Required Study Resources across all modules are complete
- [ ] Returns the most recent incomplete visited resource when one exists
- [ ] Ignores a recent visit whose resource already has `completedAt` set
- [ ] Falls back to the first Required Study Resource in module order that is incomplete
- [ ] Respects module ordering — lower-order modules take priority in fallback
- [ ] Excludes Complementary Study Resources from the fallback path
- [ ] All tests pass (`npm run test`)

## Blocked by

None — can start immediately.
