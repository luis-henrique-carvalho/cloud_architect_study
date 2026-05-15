---
title: "Question Resource Completion"
status: "done"
type: "AFK"
parent: "docs/prd/phase-06-practice-questions.md"
blocked_by:
  - "docs/tickets/phase-06/013-question-resource-state-derivation.md"
  - "docs/tickets/phase-06/015-record-question-attempts.md"
user_stories: [18, 19, 20, 21, 35]
---

## Parent

[docs/prd/phase-06-practice-questions.md](../../../docs/prd/phase-06-practice-questions.md)

## What to build

Complete the `questoes` Study Resource automatically when the learner has attempted every parsed Practice Question at least once. The same answer submission flow that records the final missing Question Attempt should update Resource Progress with a completion timestamp and revalidate the module page so Module Progress and sidebar indicators update.

## Acceptance criteria

- [ ] A `questoes` resource is incomplete while at least one parsed Practice Question has no Question Attempt.
- [ ] Submitting the final unattempted Practice Question sets `completedAt` for the `questoes` Study Resource.
- [ ] A question resource can be complete even when one or more Current Question States are incorrect.
- [ ] Completion does not require or expose a manual completion toggle for `questoes`.
- [ ] After completion, the Module Progress bar updates to include the `questoes` resource.
- [ ] After completion, the sidebar indicator for `questoes` shows completed.
- [ ] Re-attempting questions after completion does not clear `completedAt`.
- [ ] Tests cover incomplete, newly complete, complete-with-incorrect-current-state, and retry-after-completion scenarios.

## Blocked by

- [docs/tickets/phase-06/013-question-resource-state-derivation.md](013-question-resource-state-derivation.md)
- [docs/tickets/phase-06/015-record-question-attempts.md](015-record-question-attempts.md)
