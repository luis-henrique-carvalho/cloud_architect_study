---
title: "Record Question Attempts"
status: "done"
type: "AFK"
parent: "docs/prd/phase-06-practice-questions.md"
blocked_by:
  - "docs/tickets/phase-06/012-practice-question-parser.md"
  - "docs/tickets/phase-06/013-question-resource-state-derivation.md"
  - "docs/tickets/phase-06/014-practice-questions-markdown-fallback.md"
user_stories: [4, 5, 6, 7, 8, 15, 16, 30, 31, 33, 34]
---

## Parent

[docs/prd/phase-06-practice-questions.md](../../../docs/prd/phase-06-practice-questions.md)

## What to build

Add the first end-to-end answer flow for Practice Questions. The learner selects one option, submits it through a Server Action, and the portal records a historical Question Attempt using the server-parsed correct answer as the source of truth. The action validates that the selected answer belongs to the parsed question and revalidates the module route after persistence.

## Acceptance criteria

- [ ] Practice Question options render as a single-choice input group.
- [ ] Submit is disabled until the learner selects an answer.
- [ ] Submitting records a row in `question_attempts` with module slug, resource key, question id, selected answer, correct answer, `isCorrect`, and timestamp.
- [ ] The Server Action derives the correct answer from server-parsed Study Content rather than trusting client input.
- [ ] The Server Action rejects unknown question ids and invalid selected answer keys.
- [ ] The learner can submit another attempt for the same Practice Question.
- [ ] Historical attempts are appended rather than replacing previous attempts.
- [ ] The route revalidates after submission so the latest attempt is visible after navigation or refresh.
- [ ] Tests cover correct attempt recording, incorrect attempt recording, validation failure, and multiple attempts for one question.

## Blocked by

- [docs/tickets/phase-06/012-practice-question-parser.md](012-practice-question-parser.md)
- [docs/tickets/phase-06/013-question-resource-state-derivation.md](013-question-resource-state-derivation.md)
- [docs/tickets/phase-06/014-practice-questions-markdown-fallback.md](014-practice-questions-markdown-fallback.md)
