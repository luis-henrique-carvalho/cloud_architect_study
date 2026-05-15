---
title: "In-Resource Tabs Skeleton"
status: "needs-triage"
type: "AFK"
parent: "docs/prd/phase-05-pagina-de-modulo.md"
blocked_by: []
user_stories: [5, 6, 20, 21]
---

## Parent

[docs/prd/phase-05-pagina-de-modulo.md](../../../docs/prd/phase-05-pagina-de-modulo.md)

## What to build

Wrap the resource content column with a shadcn/ui `Tabs` component presenting three tabs: **Content**, **Notes**, and **History**. The active tab is driven by a `?tab=` URL search parameter (values: `content`, `notes`, `history`; default `content`). The Content tab renders the existing `MarkdownRenderer` unchanged. Notes and History tabs render placeholder content for now (to be filled by tickets 010 and 011). Tab links preserve the current `?resource=` parameter so switching tabs never changes the active resource. The `?resource=` parameter continues to work exactly as before.

## Acceptance criteria

- [ ] A tab strip with Content, Notes, and History tabs appears above the resource content area.
- [ ] Omitting `?tab=` or setting `?tab=content` activates the Content tab and renders the Markdown.
- [ ] Setting `?tab=notes` activates the Notes tab (placeholder content acceptable at this stage).
- [ ] Setting `?tab=history` activates the History tab (placeholder content acceptable at this stage).
- [ ] Clicking a tab updates the URL to include the correct `?tab=` value while keeping `?resource=` intact.
- [ ] Navigating directly to a URL with both `?resource=` and `?tab=` renders the correct resource on the correct tab.
- [ ] The existing Markdown rendering in the Content tab is visually unchanged.
- [ ] Unit test: given no `?tab=` parameter, the Content tab is active.
- [ ] Unit test: given `?tab=notes`, the Notes tab is active.
- [ ] Unit test: given `?tab=history`, the History tab is active.
- [ ] Unit test: tab links include the current `?resource=` parameter.

## Blocked by

None — can start immediately.
