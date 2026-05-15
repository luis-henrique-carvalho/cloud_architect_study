---
title: "Practice Questions Integration Tests"
status: "done"
type: "AFK"
parent: "docs/prd/phase-06-practice-questions.md"
blocked_by:
  - "docs/tickets/phase-06/014-practice-questions-markdown-fallback.md"
  - "docs/tickets/phase-06/015-record-question-attempts.md"
  - "docs/tickets/phase-06/016-practice-question-feedback.md"
  - "docs/tickets/phase-06/017-question-resource-completion.md"
  - "docs/tickets/phase-06/018-question-resource-summary.md"
user_stories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
---

## Parent

[docs/prd/phase-06-practice-questions.md](../../../docs/prd/phase-06-practice-questions.md)

## What to build

Add integration coverage for the completed Practice Questions flow across parsing, rendering, answer submission, feedback, fallback behavior, and Question Resource Completion. These tests should verify learner-visible behavior and persistence outcomes rather than implementation details.

## Acceptance criteria

- [ ] Integration test verifies a parseable `questoes` resource renders interactive Practice Questions.
- [ ] Integration test verifies malformed `questoes` content falls back to Markdown rendering.
- [ ] Integration test verifies selecting and submitting an answer records a Question Attempt.
- [ ] Integration test verifies feedback appears after submission and persists after rerender.
- [ ] Integration test verifies another attempt can be recorded for the same Practice Question.
- [ ] Integration test verifies the final unattempted question marks the `questoes` Study Resource complete.
- [ ] Integration test verifies Module Progress and sidebar completion state reflect Question Resource Completion.
- [ ] Tests avoid assertions on CSS class names or private helper behavior.

## Blocked by

- [docs/tickets/phase-06/014-practice-questions-markdown-fallback.md](014-practice-questions-markdown-fallback.md)
- [docs/tickets/phase-06/015-record-question-attempts.md](015-record-question-attempts.md)
- [docs/tickets/phase-06/016-practice-question-feedback.md](016-practice-question-feedback.md)
- [docs/tickets/phase-06/017-question-resource-completion.md](017-question-resource-completion.md)
- [docs/tickets/phase-06/018-question-resource-summary.md](018-question-resource-summary.md)
