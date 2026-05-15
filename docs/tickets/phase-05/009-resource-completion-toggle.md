---
title: "Resource Completion Toggle"
status: "needs-triage"
type: "AFK"
parent: "docs/prd/phase-05-pagina-de-modulo.md"
blocked_by:
  - "docs/tickets/phase-05/007-module-progress-bar-and-sidebar-indicators.md"
  - "docs/tickets/phase-05/008-in-resource-tabs-skeleton.md"
user_stories: [7, 8, 9, 22, 23, 24]
---

## Parent

[docs/prd/phase-05-pagina-de-modulo.md](../../../docs/prd/phase-05-pagina-de-modulo.md)

## What to build

Add a completion toggle to the Content tab header so the learner can mark a non-interactive Study Resource complete or reopen it. The toggle reads its initial state from the preloaded `ResourceProgress[]` array. Clicking calls a Server Action that invokes `upsertProgress` with `completedAt: now` (mark complete) or `completedAt: null` (reopen). After the action, `revalidatePath` causes the Module Progress bar, sidebar indicators, and toggle state to reflect the updated state without a full navigation. The toggle is absent for resources whose key is `questoes`, since those self-complete via Question Attempts.

## Acceptance criteria

- [ ] A completion toggle appears in the Content tab header for all Study Resources except `questoes`.
- [ ] The toggle renders in the incomplete state when `completedAt` is null for the resource.
- [ ] The toggle renders in the complete state when `completedAt` is non-null.
- [ ] Clicking the toggle when incomplete sets `completedAt` to the current timestamp in the database.
- [ ] Clicking the toggle when complete sets `completedAt` to null in the database.
- [ ] After toggling, the Module Progress bar updates to reflect the new completion count.
- [ ] After toggling, the sidebar indicator for the affected resource updates.
- [ ] No completion toggle is rendered for a `questoes` resource.
- [ ] Unit test: toggle renders unchecked when given a null `completedAt`.
- [ ] Unit test: toggle renders checked when given a non-null `completedAt`.
- [ ] Unit test: toggle is absent when the resource key is `questoes`.
- [ ] Unit test: clicking the toggle calls the Server Action with the correct `moduleSlug` and `resourceKey`.

## Blocked by

- [docs/tickets/phase-05/007-module-progress-bar-and-sidebar-indicators.md](007-module-progress-bar-and-sidebar-indicators.md)
- [docs/tickets/phase-05/008-in-resource-tabs-skeleton.md](008-in-resource-tabs-skeleton.md)
