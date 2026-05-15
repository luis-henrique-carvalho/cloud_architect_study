---
title: "Practice Question Parser"
status: "done"
type: "AFK"
parent: "docs/prd/phase-06-practice-questions.md"
blocked_by: []
user_stories: [2, 3, 27, 28, 29, 32]
---

## Parent

[docs/prd/phase-06-practice-questions.md](../../../docs/prd/phase-06-practice-questions.md)

## What to build

Add a pure Practice Question Parser that converts parseable `questoes.md` Study Content into structured Practice Questions. The parser recognizes the existing Content Library pattern: level-two question headings, prompt Markdown, single-letter answer options, a details block, a correct answer marker, and explanation Markdown. If required fields are missing or ambiguous, it returns an unparseable result so the Study Module page can fall back to normal Markdown rendering.

## Acceptance criteria

- [ ] Parser returns a successful result for the current `questoes.md` format used in the Content Library.
- [ ] Each parsed Practice Question includes stable id, ordinal, prompt Markdown, options, correct answer key, and explanation Markdown.
- [ ] Stable ids are deterministic for unchanged question headings and order.
- [ ] Parser tolerates harmless blank lines, carriage returns, Markdown emphasis around the correct-answer marker, and whitespace around answer options.
- [ ] Parser returns an unparseable result when a question is missing options.
- [ ] Parser returns an unparseable result when a question is missing a correct answer.
- [ ] Parser returns an unparseable result when option keys are duplicated or the correct answer key is unsupported.
- [ ] Unit tests cover successful parsing, tolerance cases, and failure cases with realistic `questoes.md` snippets.

## Blocked by

None - can start immediately.
