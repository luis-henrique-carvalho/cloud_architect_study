---
title: "Module Progress Bar and Sidebar Indicators"
status: "needs-triage"
type: "AFK"
parent: "docs/prd/phase-05-pagina-de-modulo.md"
blocked_by: []
user_stories: [1, 2, 3, 4, 23, 24]
---

## Parent

[docs/prd/phase-05-pagina-de-modulo.md](../../../docs/prd/phase-05-pagina-de-modulo.md)

## What to build

Replace the static `Badge` in the Study Module page header with a live Module Progress bar. The server component fetches all `ResourceProgress` rows for the current module slug in a single query, passes them to `calculateModuleProgress`, and renders a shadcn/ui `Progress` bar alongside a numeric label (e.g., "2 de 5 requeridos concluídos"). Each item in the sidebar resource navigation gains a completion indicator (checkmark icon or colored dot) driven by the same preloaded `ResourceProgress[]` array. No write operations are introduced by this ticket.

## Acceptance criteria

- [ ] The module header shows a `Progress` bar that reflects the fraction of Required Study Resources completed.
- [ ] The numeric label next to the bar reads "X de Y requeridos concluídos" where X and Y are accurate counts.
- [ ] When no Required Study Resource is complete, the bar renders at 0% and the label reads "0 de Y".
- [ ] When all Required Study Resources are complete, the bar renders at 100%.
- [ ] Each sidebar nav item shows a visual indicator that distinguishes completed resources from incomplete ones.
- [ ] The static `Badge` that previously showed "N required de M" is removed.
- [ ] All `ResourceProgress` rows for the module are fetched in one database query (no N+1).
- [ ] Unit test: Module Progress Header renders the correct label and progress value for zero, partial, and full completion states.

## Blocked by

None — can start immediately.
