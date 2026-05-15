# Phase 6 — Parser de Questoes e Practice Questions Interativas

## Problem Statement

The Personal Study Portal already treats `questoes` as a Required Study Resource and intentionally hides the manual completion toggle for it, because question-based resources should complete themselves through learner interaction. However `questoes` still renders as static Markdown. The learner can read the question text and manually reveal the answer, but the portal cannot record Question Attempts, classify Correct Answers and Incorrect Answers, derive Current Question State, or complete the question resource when all Practice Questions have been attempted.

As a result, one of the most important study activities in the SAA-C03 path is disconnected from Learner State. The Study Dashboard and Module Progress cannot reflect question practice accurately, and the future Mistake Notebook has no reliable source of Incorrect Answers.

## Solution

Parse question-based Study Content into structured Practice Questions whenever the Markdown follows the expected `questoes.md` pattern. When parsing succeeds, replace the static Markdown rendering for the `questoes` Study Resource with an interactive Practice Questions experience. The learner selects an answer, submits it, immediately sees whether the Question Attempt is a Correct Answer or Incorrect Answer, and can read the explanation from the original Study Content. Every submission is recorded historically. The latest attempt becomes the Current Question State for that Practice Question.

Question Resource Completion is derived automatically: once every parsed Practice Question has at least one Question Attempt, the `questoes` Study Resource is marked complete in Learner State. If a `questoes.md` resource cannot be parsed confidently, the portal falls back to the normal Markdown rendering so the learner never loses access to Study Content.

## User Stories

1. As a learner, I want a `questoes` Study Resource to show Practice Questions as interactive answer cards, so that I can practice without manually comparing text in Markdown.
2. As a learner, I want each Practice Question to show its prompt clearly, so that I can reason about the scenario before seeing the expected answer.
3. As a learner, I want each Practice Question to show all answer options, so that I can choose the alternative I believe is correct.
4. As a learner, I want answer options to behave as a single-choice group, so that only one selected answer is submitted per Question Attempt.
5. As a learner, I want the submit action to be unavailable until I select an answer, so that I do not accidentally record an empty Question Attempt.
6. As a learner, I want submitting an answer to record a Question Attempt, so that my practice history is preserved.
7. As a learner, I want the portal to classify my submitted answer as a Correct Answer when it matches the expected answer, so that I know when I understood the material.
8. As a learner, I want the portal to classify my submitted answer as an Incorrect Answer when it does not match the expected answer, so that I know what needs review.
9. As a learner, I want feedback to appear immediately after submission, so that I can learn from the result while the reasoning is fresh.
10. As a learner, I want to see the correct answer after submitting, so that I can compare my reasoning with the expected result.
11. As a learner, I want to see the explanation from the Study Content after submitting, so that I understand why the expected answer is correct.
12. As a learner, I want to see why a distractor is wrong when the Study Content provides that detail, so that I can improve exam-style elimination.
13. As a learner, I want previously attempted questions to show their Current Question State when I return, so that I know which questions are currently correct or incorrect.
14. As a learner, I want previously attempted questions to remember my latest selected answer, so that I can review what I chose most recently.
15. As a learner, I want to attempt the same Practice Question more than once, so that I can correct misunderstandings after review.
16. As a learner, I want every attempt to remain historical rather than replacing older attempts, so that my learning trajectory remains available for later review.
17. As a learner, I want a question that was incorrect and later answered correctly to become a Corrected Mistake, so that the future Mistake Notebook can show progress without losing useful review history.
18. As a learner, I want the `questoes` Study Resource to become complete after all parsed Practice Questions have at least one Question Attempt, so that Module Progress reflects practice completion.
19. As a learner, I want correctness and completion to be separate concepts, so that a question resource can be complete even when some Current Question States are incorrect.
20. As a learner, I want the Module Progress bar and sidebar indicators to update after the final unattempted Practice Question is submitted, so that the module page reflects the completed question resource.
21. As a learner, I want a compact progress summary for the question resource, so that I can see how many Practice Questions were attempted and how many are currently correct.
22. As a learner, I want unanswered Practice Questions to be visually distinct from attempted ones, so that I can quickly find the next question to answer.
23. As a learner, I want Incorrect Answers to stand out without making the page noisy, so that weak spots are visible during review.
24. As a learner, I want Correct Answers to be visually confirmed, so that I can move on confidently.
25. As a learner, I want the interactive question UI to preserve the current module tabs and resource navigation, so that the Study Module page remains a single study workspace.
26. As a learner, I want the Notes and History tabs to continue working for `questoes`, so that I can write Study Notes and review activity for the question resource.
27. As a learner, I want malformed or unsupported `questoes.md` content to render as normal Markdown, so that no authored Study Content disappears because parsing failed.
28. As a learner, I want the parser to tolerate harmless Markdown spacing and line ending differences, so that small formatting variations do not break the interactive experience.
29. As a learner, I want Practice Question identifiers to remain stable across sessions, so that my Question Attempts still connect to the same questions after a page reload.
30. As a learner, I want the interactive experience to work locally without authentication or external services, so that it matches the Personal Study Portal's MVP constraints.
31. As a learner, I want the question interface to be accessible by keyboard and screen reader, so that practice remains usable with standard form controls.
32. As a learner, I want a clear empty state when a parseable `questoes` resource contains no Practice Questions, so that I understand why there is nothing to answer.
33. As a learner, I want the portal to avoid recording duplicate attempts from accidental double-submits, so that my history reflects intentional answers.
34. As a learner, I want answer feedback to survive navigation away from and back to the resource, so that review does not depend on transient client state.
35. As a learner, I want the Study Dashboard's mistake count to reflect new Incorrect Answers after practice, so that review work becomes visible from the daily workspace.

## Implementation Decisions

- Build a deep Practice Question Parser module that accepts raw Markdown and returns either a successful parse result with structured Practice Questions or an unparseable result with a reason suitable for diagnostics.
- The parser recognizes the current authored pattern: level-two question headings, a prompt, single-letter answer options, a details block containing the correct answer marker, and optional explanation sections.
- The parser produces stable question identifiers from question order and heading text. The identifier must be deterministic for unchanged Study Content and should not depend on database row ids.
- The structured Practice Question model includes the question id, ordinal, prompt Markdown, answer options, correct answer key, explanation Markdown, and any additional answer rationale Markdown that can be safely extracted.
- Parsing is conservative. If required fields are missing, duplicated, or ambiguous for a question, the resource is treated as unparseable and falls back to Markdown rendering.
- The Study Module page chooses the interactive Practice Questions experience only for the standard `questoes` Study Resource when parsing succeeds.
- The existing Markdown renderer remains the fallback for unparseable `questoes` resources and for all non-question Study Resources.
- Extend the Learner State attempts module with a bulk read for attempts belonging to the active question resource, so the UI can derive Current Question State without one query per Practice Question.
- Add a Question Resource State derivation module that accepts parsed Practice Questions and historical Question Attempts, then returns per-question current state plus resource-level counts for attempted, correct, incorrect, and remaining questions.
- Question Resource Completion is derived from attempts: all parsed Practice Questions must have at least one Question Attempt.
- When a Question Attempt causes the resource to become complete, the same mutation path also updates Resource Progress with a completion timestamp.
- Completing a question resource never requires all answers to be correct. Correctness feeds learning feedback and the Mistake Notebook; completion tracks attempted practice coverage.
- A Server Action records a Question Attempt by receiving the module slug, resource key, question id, selected answer, and expected answer from the parsed server-side question model.
- The Server Action validates the selected answer against the parsed question's available options before recording the attempt.
- The Server Action uses the server-parsed correct answer as the source of truth rather than trusting a client-provided correct answer.
- After recording an attempt, the Server Action revalidates the module route so question state, Module Progress, sidebar indicators, and Dashboard-derived values can update consistently.
- The Practice Questions UI uses standard form controls for answer selection, submit, and retry actions.
- The UI reveals answer feedback and explanation only after the learner has at least one Question Attempt for that question.
- The latest Question Attempt determines the visual state for a question. Older attempts remain stored but do not control the Current Question State.
- The question resource summary displays attempted count, current correct count, current incorrect count, and remaining count.
- No new database tables are required. The existing Question Attempts and Resource Progress persistence support this phase.
- No new API routes are introduced. Mutations are handled through Server Actions consistent with the existing Study Module page interactions.
- Any parser limitation discovered in real Study Content should be documented in the PR or ticket rather than silently broadening the parser beyond the known `questoes.md` structure.

## Testing Decisions

A good test exercises observable behavior through public interfaces: parsed data in and structured questions out, historical attempts in and Current Question State out, rendered controls visible to the learner, and persisted rows written after submission. Tests should not assert on private parsing helpers, CSS class names, or internal component structure. Fixtures should use realistic `questoes.md` snippets matching the Content Library's current authored format.

- Test the Practice Question Parser as a pure module with successful parsing of the current `questoes.md` format.
- Test parser tolerance for harmless blank lines, carriage returns, Markdown emphasis around the correct-answer marker, and whitespace around answer options.
- Test parser failure for missing correct answer, missing options, duplicated option keys, unsupported answer key, and malformed details blocks.
- Test parser output preserves prompt and explanation content as Markdown so the existing renderer can display rich explanations.
- Test stable question id generation for unchanged headings and order.
- Test the Question Resource State derivation module with no attempts, partial attempts, all questions attempted, all current correct, mixed current states, and corrected mistakes.
- Test that resource completion is true only when every parsed Practice Question has at least one Question Attempt.
- Test that a later Correct Answer changes Current Question State without deleting older Incorrect Answers.
- Test that a later Incorrect Answer changes Current Question State even if an earlier attempt was correct.
- Test the attempts module bulk read returns all attempts for a module/resource pair in deterministic order.
- Test the Server Action records an attempt with the expected `isCorrect` value and rejects invalid selected answer keys.
- Test the Server Action marks the `questoes` resource complete only after the final unattempted Practice Question receives an attempt.
- Test the Practice Questions UI renders radio choices, disables submission until an answer is selected, and shows feedback after an attempt.
- Test the Practice Questions UI initializes from existing Current Question State when the learner returns to the resource.
- Test the Study Module page falls back to Markdown rendering when parsing fails.
- Prior art: existing Learner State attempt tests for historical attempts and Current Question State; existing module page component tests for Client Component rendering; existing completion toggle tests for the `questoes` self-completion rule.

## Out of Scope

- Building the Mistake Notebook detail route. This phase records the data that Phase 7 will display.
- Editing or normalizing authored Study Content beyond what is necessary to parse the existing `questoes.md` pattern.
- Supporting multi-select questions, free-text answers, drag-and-drop answers, or scored exam simulations.
- Timed exams, random question ordering, weighted scoring, or certification readiness analytics.
- Importing Practice Questions into the database as content records.
- Replacing the Markdown source of truth with database-authored questions.
- Flashcard interactivity.
- Spaced repetition scheduling.
- Authentication, multi-user state, sync, or public deployment behavior.

## Further Notes

- The current Content Library appears to use a consistent five-question pattern in many modules. The parser should still be written as a reusable content module rather than a one-off page transform, because it encodes a meaningful boundary between authored Study Content and interactive Learner State.
- Some current Markdown content appears to contain mojibake characters. This phase should not make character encoding cleanup a prerequisite for interactivity unless the characters prevent reliable parsing of required answer markers.
- The completion toggle for `questoes` should remain absent. Manual completion would conflict with the domain rule that Question Resource Completion is derived from Question Attempts.
- The implementation should preserve the existing Notes and History surfaces for the `questoes` resource. Practice interaction belongs in the Content tab, while notes and review history remain resource-level tools.
