---
title: "Mistake Notebook summary count — countMistakes + unit tests"
status: "needs-triage"
type: "AFK"
parent: "docs/prd/phase-04-dashboard-e-catalogo.md"
blocked_by: []
user_stories: [8, 9, 10]
---

## Parent

docs/prd/phase-04-dashboard-e-catalogo.md

## What to build

Add a `countMistakes(db) → number` function to the existing `learner-state/attempts` module. It returns the number of distinct `(moduleSlug, resourceKey, questionId)` triples whose most recent `QuestionAttempt` has `isCorrect === false` (i.e. whose Current Question State is an Incorrect Answer).

Reuse the same SQL pattern as `listIncorrectAttempts` but return only a scalar count to avoid fetching full rows.

Export the function from the existing `src/modules/learner-state/index.ts` barrel.

Write unit tests using an in-memory `createTestDb()`.

## Acceptance criteria

- [ ] Function is exported from `src/modules/learner-state/index.ts`
- [ ] Returns `0` when no Question Attempts exist
- [ ] Returns `0` when all latest attempts per question are Correct Answers
- [ ] Returns the correct count when some questions have a latest Incorrect Answer
- [ ] Does not double-count a question that has multiple Incorrect Attempt rows
- [ ] Counts a question as unresolved when the latest attempt is incorrect even if earlier attempts were correct
- [ ] All tests pass (`npm run test`)

## Blocked by

None — can start immediately.
