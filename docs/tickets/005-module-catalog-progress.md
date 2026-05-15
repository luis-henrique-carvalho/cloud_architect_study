---
title: "Module Catalog with per-card Module Progress indicator"
status: "needs-triage"
type: "AFK"
parent: "docs/prd/phase-04-dashboard-e-catalogo.md"
blocked_by: ["docs/tickets/002-module-progress-calculator.md"]
user_stories: [12, 13, 14, 15, 16]
---

## Parent

docs/prd/phase-04-dashboard-e-catalogo.md

## What to build

Update the Module Catalog Server Component (`src/app/modulos/page.tsx`) to show a Module Progress indicator on each Study Module card.

Changes:

- Fetch all `ResourceProgress` rows with a single bulk query.
- Map each module through the Module Progress calculator (ticket 002) to get `{ completed, total, percent, isComplete }`.
- Render a `Progress` bar (shadcn component) inside each card showing `percent`.
- Display `completed / total required` as a text label alongside the bar.
- Apply a visually distinct style to completed cards: use the `default` Badge variant for the module type badge when `isComplete` is true, `secondary` otherwise (consistent with the existing Lab Module badge pattern).
- Modules with no Required Study Resources render as complete.
- All database reads use a single bulk query — no per-module queries.

## Acceptance criteria

- [ ] Each module card shows a `Progress` bar reflecting `percent` from the Module Progress calculator
- [ ] Each card shows a `completed / total` label for Required Study Resources
- [ ] A fully complete module card uses a visually distinct Badge variant compared to an incomplete card
- [ ] A module with no Required Study Resources renders as complete (100% / badge variant)
- [ ] Page renders without errors when `data/study.db` is empty
- [ ] All database reads use a single bulk query (no N+1 pattern)
- [ ] `npm run test` passes

## Blocked by

- docs/tickets/002-module-progress-calculator.md
