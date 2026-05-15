---
title: "Practice Question Feedback"
status: "done"
type: "AFK"
parent: "docs/prd/phase-06-practice-questions.md"
blocked_by:
  - "docs/tickets/phase-06/013-question-resource-state-derivation.md"
  - "docs/tickets/phase-06/014-practice-questions-markdown-fallback.md"
  - "docs/tickets/phase-06/015-record-question-attempts.md"
user_stories: [9, 10, 11, 12, 13, 14, 22, 23, 24, 34]
---

## Parent

[docs/prd/phase-06-practice-questions.md](../../../docs/prd/phase-06-practice-questions.md)

## What to build

Show learner-facing feedback for attempted Practice Questions. After a Question Attempt exists, the question card displays the latest selected answer, whether the Current Question State is a Correct Answer or Incorrect Answer, the correct answer, and the explanation Markdown from the Study Content. Unattempted questions remain answerable without revealing the expected answer.

## Acceptance criteria

- [ ] Unattempted Practice Questions do not reveal the correct answer or explanation.
- [ ] Attempted Practice Questions show the learner's latest selected answer.
- [ ] Correct Answers are visually confirmed.
- [ ] Incorrect Answers are visually distinct without blocking another attempt.
- [ ] The correct answer is visible after at least one attempt.
- [ ] Explanation Markdown renders after at least one attempt.
- [ ] Feedback persists after refresh because it is derived from stored Question Attempts.
- [ ] The learner can retry an attempted Practice Question.
- [ ] Component tests cover unattempted, correct, incorrect, and retry-visible states.

## Blocked by

- [docs/tickets/phase-06/013-question-resource-state-derivation.md](013-question-resource-state-derivation.md)
- [docs/tickets/phase-06/014-practice-questions-markdown-fallback.md](014-practice-questions-markdown-fallback.md)
- [docs/tickets/phase-06/015-record-question-attempts.md](015-record-question-attempts.md)
