---
title: "Question Resource Summary"
status: "done"
type: "AFK"
parent: "docs/prd/phase-06-practice-questions.md"
blocked_by:
  - "docs/tickets/phase-06/013-question-resource-state-derivation.md"
  - "docs/tickets/phase-06/015-record-question-attempts.md"
  - "docs/tickets/phase-06/017-question-resource-completion.md"
user_stories: [21, 22, 23, 24, 35]
---

## Parent

[docs/prd/phase-06-practice-questions.md](../../../docs/prd/phase-06-practice-questions.md)

## What to build

Add a compact Practice Questions summary to the top of the interactive `questoes` Content tab. It should show attempted count, current correct count, current incorrect count, and remaining count from the Question Resource State module, helping the learner find unanswered and weak questions quickly.

## Acceptance criteria

- [ ] Summary displays total parsed Practice Questions.
- [ ] Summary displays attempted and remaining counts.
- [ ] Summary displays current correct and current incorrect counts.
- [ ] Counts update after a new Question Attempt.
- [ ] Remaining count reaches zero when Question Resource Completion is true.
- [ ] Unanswered Practice Questions are easy to identify from the card list.
- [ ] Correct and incorrect current states are scannable without overwhelming the page.
- [ ] Component tests cover empty, partial, complete, and mixed-correctness summaries.

## Blocked by

- [docs/tickets/phase-06/013-question-resource-state-derivation.md](013-question-resource-state-derivation.md)
- [docs/tickets/phase-06/015-record-question-attempts.md](015-record-question-attempts.md)
- [docs/tickets/phase-06/017-question-resource-completion.md](017-question-resource-completion.md)
