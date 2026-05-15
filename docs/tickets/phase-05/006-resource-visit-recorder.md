---
title: "Resource Visit Recorder"
status: "needs-triage"
type: "AFK"
parent: "docs/prd/phase-05-pagina-de-modulo.md"
blocked_by: []
user_stories: [19]
---

## Parent

[docs/prd/phase-05-pagina-de-modulo.md](../../../docs/prd/phase-05-pagina-de-modulo.md)

## What to build

Wire a visit recording mechanism into the Study Module page so that every time the learner opens a Study Resource, a row is written to `resource_visits` via the existing `recordVisit` learner-state function. The recording must not delay page rendering — it should run after the response is sent using Next.js `after()` or an equivalent fire-and-forget mechanism. No UI is introduced by this ticket.

## Acceptance criteria

- [ ] Opening a Study Resource (`/modulos/[slug]?resource=<key>`) inserts a row into `resource_visits` with the correct `moduleSlug` and `resourceKey`.
- [ ] Navigating between resources in the sidebar generates a separate visit row for each resource opened.
- [ ] The visit recording does not block or delay the page render.
- [ ] The Continue Target on the Study Dashboard (`/`) reflects the most recently visited incomplete resource after navigation.
- [ ] Unit test: invoking the recorder with a valid module slug and resource key calls `recordVisit` with the correct arguments.
- [ ] Unit test: the recorder does not throw when a visit for the same resource already exists.

## Blocked by

None — can start immediately.
