---
title: "Review History Panel"
status: "needs-triage"
type: "AFK"
parent: "docs/prd/phase-05-pagina-de-modulo.md"
blocked_by:
  - "docs/tickets/phase-05/008-in-resource-tabs-skeleton.md"
user_stories: [15, 16, 17, 18]
---

## Parent

[docs/prd/phase-05-pagina-de-modulo.md](../../../docs/prd/phase-05-pagina-de-modulo.md)

## What to build

Implement the History tab as a server-rendered panel that reads the `ResourceProgress` row for the active resource from the preloaded array (no extra query). It displays "Completed on" (formatted `completedAt`) and "Last reviewed on" (formatted `lastReviewedAt`) using `Intl.DateTimeFormat`. A "Mark Reviewed" button calls a Server Action that invokes `upsertProgress` with `lastReviewedAt: now`; after which `revalidatePath` refreshes the panel. When `completedAt` is null the panel shows an empty state and the "Mark Reviewed" button is hidden. The "Mark Reviewed" button is only shown when `completedAt` is non-null.

## Acceptance criteria

- [ ] The History tab shows an empty state and no "Mark Reviewed" button when the resource has no `completedAt`.
- [ ] The History tab shows the formatted `completedAt` date when the resource has been completed.
- [ ] The History tab shows a "Mark Reviewed" button when `completedAt` is non-null.
- [ ] Clicking "Mark Reviewed" updates `lastReviewedAt` in the database to the current timestamp.
- [ ] After clicking "Mark Reviewed", the panel re-renders and shows the updated "Last reviewed on" date.
- [ ] When `lastReviewedAt` is null but `completedAt` is set, the "Last reviewed on" row is omitted or shows a "never" label.
- [ ] Dates are formatted with `Intl.DateTimeFormat` using the learner's locale (no external dependency).
- [ ] Unit test: empty state is rendered when `completedAt` is null.
- [ ] Unit test: completion date is rendered and "Mark Reviewed" is visible when `completedAt` is non-null.
- [ ] Unit test: both dates are rendered when both `completedAt` and `lastReviewedAt` are set.
- [ ] Unit test: clicking "Mark Reviewed" calls the Server Action with the correct arguments.

## Blocked by

- [docs/tickets/phase-05/008-in-resource-tabs-skeleton.md](008-in-resource-tabs-skeleton.md)
