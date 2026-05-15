---
title: "Study Dashboard wired to real Learner State"
status: "needs-triage"
type: "AFK"
parent: "docs/prd/phase-04-dashboard-e-catalogo.md"
blocked_by:
  [
    "docs/tickets/001-continue-target-resolver.md",
    "docs/tickets/003-count-mistakes.md",
  ]
user_stories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 17, 18]
---

## Parent

docs/prd/phase-04-dashboard-e-catalogo.md

## What to build

Update the Study Dashboard Server Component (`src/app/page.tsx`) to read real Learner State instead of using the hardcoded first-module/first-resource Continue Target.

Changes:

- Fetch all `ResourceProgress` rows with a single bulk query (no N+1 per module).
- Fetch recent `ResourceVisit` rows with a single bulk query.
- Call the Continue Target resolver (ticket 001) with modules + visits + progress.
- Map every module through the Module Progress calculator (ticket 002) and derive overall stats: total completed modules, total completed Required Study Resources, overall completion percentage.
- Call `countMistakes` (ticket 003) and render a Mistake Notebook summary widget that links to `/erros`.
- Replace the four static `StatCard` values with the computed stats.
- Replace the hardcoded `continueHref` / Continue Target card content with the resolved result.
- Handle zero-state gracefully: no continue target when all resources are complete; zero mistakes shows a positive confirmation.

## Acceptance criteria

- [ ] Continue Target card shows the module title and resource title of the actual last incomplete visited resource
- [ ] Continue Target falls back to the first incomplete Required Study Resource when there is no qualifying recent visit
- [ ] Continue Target card renders an empty state when all Required Study Resources are complete
- [ ] Stats grid reflects real Learner State — completed modules, completed required resources, overall percentage
- [ ] Mistake Notebook summary widget displays the real unresolved mistake count
- [ ] Mistake Notebook summary links to `/erros`
- [ ] Mistake Notebook summary shows an "up to date" empty state when count is 0
- [ ] All database reads use a single bulk query per table (no N+1 pattern)
- [ ] Page renders without errors when `data/study.db` exists but is empty
- [ ] `npm run test` passes

## Blocked by

- docs/tickets/001-continue-target-resolver.md
- docs/tickets/003-count-mistakes.md
