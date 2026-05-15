---
title: "Study Notes Editor"
status: "needs-triage"
type: "AFK"
parent: "docs/prd/phase-05-pagina-de-modulo.md"
blocked_by:
  - "docs/tickets/phase-05/008-in-resource-tabs-skeleton.md"
user_stories: [10, 11, 12, 13, 14, 25]
---

## Parent

[docs/prd/phase-05-pagina-de-modulo.md](../../../docs/prd/phase-05-pagina-de-modulo.md)

## What to build

Implement the Notes tab using a server-rendered initial state combined with a client-side form. At render time, the server fetches the current `StudyNote` for the active resource via `getNote` and passes the content to a Client Component. The Client Component provides a `Textarea` for editing and two Server Actions: save (calls `upsertNote`) and delete (calls `deleteNote`). After each mutation, `revalidatePath` refreshes the Notes tab. An empty state is shown when no note exists and the textarea is empty. A character or line count indicator is shown alongside the textarea.

## Acceptance criteria

- [ ] The Notes tab shows the learner's existing Study Note pre-filled in the textarea when a note exists.
- [ ] The Notes tab shows an empty state (empty textarea + descriptive message) when no note exists.
- [ ] Submitting the form with text content saves the note and re-renders the tab with the saved content.
- [ ] Submitting the form with empty content is treated as a delete (or the save button is disabled for empty input).
- [ ] A delete button is visible when a note exists; clicking it removes the note and shows the empty state.
- [ ] A character or line count indicator is visible alongside the textarea.
- [ ] The note is scoped to the specific `moduleSlug` + `resourceKey` combination — notes from other resources are not shown.
- [ ] Unit test: textarea is empty and empty state is rendered when `initialNote` is null.
- [ ] Unit test: textarea is pre-filled when `initialNote` has content.
- [ ] Unit test: submitting the form calls the save Server Action with the correct arguments.
- [ ] Unit test: clicking delete calls the delete Server Action.

## Blocked by

- [docs/tickets/phase-05/008-in-resource-tabs-skeleton.md](008-in-resource-tabs-skeleton.md)
