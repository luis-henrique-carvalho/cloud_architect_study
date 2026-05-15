---
title: "Practice Questions Markdown Fallback"
status: "done"
type: "AFK"
parent: "docs/prd/phase-06-practice-questions.md"
blocked_by:
  - "docs/tickets/phase-06/012-practice-question-parser.md"
user_stories: [1, 2, 3, 25, 26, 27, 30, 31, 32]
---

## Parent

[docs/prd/phase-06-practice-questions.md](../../../docs/prd/phase-06-practice-questions.md)

## What to build

Wire the Study Module page so the standard `questoes` Study Resource uses the Practice Questions experience only when parsing succeeds. When parsing fails, or when the active resource is not `questoes`, the page keeps using the existing Markdown renderer. The Content, Notes, and History tabs should keep their current navigation behavior.

## Acceptance criteria

- [ ] A parseable `questoes` resource renders the Practice Questions experience instead of raw Markdown.
- [ ] An unparseable `questoes` resource renders the existing Markdown content.
- [ ] Non-question Study Resources continue to render with the existing Markdown renderer.
- [ ] The `questoes` completion toggle remains absent.
- [ ] Notes and History tabs remain available for the `questoes` Study Resource.
- [ ] The active resource and active tab URL parameters continue to work.
- [ ] Empty parseable question content shows a clear empty state instead of a crash.
- [ ] Component or page tests cover successful interactive rendering and fallback Markdown rendering.

## Blocked by

- [docs/tickets/phase-06/012-practice-question-parser.md](012-practice-question-parser.md)
