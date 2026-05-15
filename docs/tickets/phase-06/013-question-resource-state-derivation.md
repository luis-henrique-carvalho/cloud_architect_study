---
title: "Question Resource State Derivation"
status: "done"
type: "AFK"
parent: "docs/prd/phase-06-practice-questions.md"
blocked_by:
  - "docs/tickets/phase-06/012-practice-question-parser.md"
user_stories: [13, 14, 16, 17, 18, 19, 21, 34, 35]
---

## Parent

[docs/prd/phase-06-practice-questions.md](../../../docs/prd/phase-06-practice-questions.md)

## What to build

Add a pure Question Resource State module that combines parsed Practice Questions with historical Question Attempts. It derives each question's Current Question State, latest selected answer, whether it has ever been incorrect, and resource-level counts for attempted, correct, incorrect, and remaining questions. This module is the shared source for the interactive UI, Question Resource Completion, and future Mistake Notebook behavior.

## Acceptance criteria

- [ ] State derivation returns every parsed Practice Question even when there are no Question Attempts.
- [ ] Current Question State is based on the latest Question Attempt for each Practice Question.
- [ ] A later Correct Answer changes the current state to correct without deleting older Incorrect Answers.
- [ ] A later Incorrect Answer changes the current state to incorrect even if an earlier attempt was correct.
- [ ] Resource counts include attempted, current correct, current incorrect, and remaining questions.
- [ ] Question Resource Completion is true only when every parsed Practice Question has at least one Question Attempt.
- [ ] Correctness and completion remain separate: a resource can be complete while some current states are incorrect.
- [ ] Unit tests cover no attempts, partial attempts, all attempted, mixed current states, and Corrected Mistakes.

## Blocked by

- [docs/tickets/phase-06/012-practice-question-parser.md](012-practice-question-parser.md)
