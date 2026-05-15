# Study Portal Context

This context defines the language for a personal study companion built around the AWS SAA-C03 learning material in this repository.

## Language

**Personal Study Portal**:
A private study workspace used by one learner to navigate the course material and track study progress.
_Avoid_: public site, marketing page, repository homepage

**Study Module**:
A coherent topic unit in the SAA-C03 study path.
_Avoid_: folder, section, chapter

**Module Catalog**:
The ordered set of Study Modules available to the learner.
_Avoid_: folder listing, module array

**Study Dashboard**:
The learner's main workspace for resuming study, checking progress, and finding weak areas.
_Avoid_: landing page, homepage, hero page

**Continue Target**:
The Study Resource the learner should resume next.
_Avoid_: last page, next link

**Study Resource**:
A specific learning activity or reference inside a Study Module.
_Avoid_: file, page, document

**Study Content**:
The authored learning material that explains, tests, or supports a Study Resource.
_Avoid_: database content, imported content

**Content Library**:
The organized collection of Study Content available to the Personal Study Portal.
_Avoid_: repository root, loose markdown files

**Learner State**:
The learner-specific record of progress, notes, attempts, mistakes, and review activity.
_Avoid_: course content, module content

**Study Note**:
A learner-authored note attached to a Study Resource.
_Avoid_: module comment, annotation, scratchpad

**Review History**:
The learner's recorded completion and review dates for a Study Resource.
_Avoid_: spaced repetition schedule, review algorithm

**Required Study Resource**:
A Study Resource that must be completed for its Study Module to count as complete.
_Avoid_: mandatory file, blocking page

**Complementary Study Resource**:
A Study Resource that enriches a Study Module without blocking module completion.
_Avoid_: optional file, extra page

**Lab Module**:
A Study Module whose primary purpose is hands-on practice.
_Avoid_: lab folder, practice section

**Module Progress**:
The learner's completion state for a Study Module, derived from its Study Resources.
_Avoid_: manual module checkbox

**Practice Question**:
A Study Resource item that asks the learner to choose an answer and compare it with the expected answer.
_Avoid_: quiz item, question block

**Question Attempt**:
A learner's recorded answer to a Practice Question.
_Avoid_: response, submission

**Current Question State**:
The learner's latest recorded state for a Practice Question.
_Avoid_: only attempt, final answer

**Correct Answer**:
A Question Attempt that matches the expected answer for a Practice Question.
_Avoid_: hit, success

**Incorrect Answer**:
A Question Attempt that does not match the expected answer for a Practice Question.
_Avoid_: miss, failure

**Mistake Notebook**:
The learner's collection of Incorrect Answers for later review.
_Avoid_: error log, wrong answers page

**Corrected Mistake**:
A Practice Question that had an Incorrect Answer but whose Current Question State is now correct.
_Avoid_: removed mistake, fixed error

**Question Resource Completion**:
The completion state of a question-based Study Resource.
_Avoid_: quiz score, question grade

## Relationships

- A **Personal Study Portal** is used by exactly one learner.
- A **Personal Study Portal** organizes the repository's study material into **Study Modules** and **Study Resources**.
- A **Personal Study Portal** presents one **Module Catalog**.
- A **Personal Study Portal** opens into a **Study Dashboard**.
- A **Personal Study Portal** reads Study Content from one **Content Library**.
- A **Study Dashboard** presents one **Continue Target** when study is incomplete.
- A **Module Catalog** contains one or more **Study Modules**.
- A **Study Module** contains one or more **Study Resources**.
- A **Study Resource** presents **Study Content**.
- A **Content Library** contains one or more **Study Modules**.
- **Learner State** records how the learner interacts with **Study Resources**.
- A **Study Note** belongs to one **Study Resource**.
- **Review History** belongs to one **Study Resource**.
- A **Study Resource** is either a **Required Study Resource** or a **Complementary Study Resource**.
- A **Study Resource** without a confirmed required role is a **Complementary Study Resource**.
- **Module Progress** is calculated from the completion of **Required Study Resources**.
- A **Lab Module** treats its lab activity as a **Required Study Resource**.
- A missing resource is not part of a **Study Module**.
- A **Study Resource** may contain one or more **Practice Questions**.
- A **Practice Question** may have zero or more **Question Attempts**.
- **Current Question State** is derived from the latest **Question Attempt** for a **Practice Question**.
- A **Question Attempt** is either a **Correct Answer** or an **Incorrect Answer**.
- A **Mistake Notebook** contains **Incorrect Answers**.
- A **Corrected Mistake** remains visible in the **Mistake Notebook**.
- **Question Resource Completion** requires at least one **Question Attempt** for every **Practice Question** in the resource.

## Example dialogue

> **Dev:** "Should the **Personal Study Portal** optimize for public visitors?"
> **Domain expert:** "No, it should optimize for one learner resuming studies, tracking progress, and reviewing weak areas."

> **Dev:** "Should the first screen explain the project like a landing page?"
> **Domain expert:** "No, the first screen is a **Study Dashboard** for daily study work."

> **Dev:** "Where should the learner resume tomorrow?"
> **Domain expert:** "Use the unfinished last opened resource first; otherwise use the next incomplete required **Study Resource**."

> **Dev:** "Can the learner mark a **Study Module** complete directly?"
> **Domain expert:** "No, **Module Progress** should come from completing the module's **Study Resources**."

> **Dev:** "Does a link collection block **Module Progress**?"
> **Domain expert:** "No, links are a **Complementary Study Resource**; labs only block progress when the module is a **Lab Module**."

> **Dev:** "Should edited study material be copied into the learner's progress records?"
> **Domain expert:** "No, **Study Content** and **Learner State** are separate concepts."

> **Dev:** "Should the portal treat scattered repository files as the course structure?"
> **Domain expert:** "No, the portal should read from the **Content Library**."

> **Dev:** "Where should the learner's note about a confusing topic live?"
> **Domain expert:** "As a **Study Note** attached to the **Study Resource** where the confusion appeared."

> **Dev:** "Does the portal need to schedule future reviews?"
> **Domain expert:** "No, it only needs **Review History** for now."

> **Dev:** "When the learner answers a **Practice Question** incorrectly, should they add it manually to a notebook?"
> **Domain expert:** "No, every **Incorrect Answer** belongs in the **Mistake Notebook** automatically."

> **Dev:** "Does a wrong answer prevent **Question Resource Completion**?"
> **Domain expert:** "No, completion means every **Practice Question** was attempted; correctness is measured separately."

> **Dev:** "If the learner answers a **Practice Question** more than once, do we replace the old answer?"
> **Domain expert:** "No, keep every **Question Attempt** and derive **Current Question State** from the latest one."

> **Dev:** "Should a question disappear from the **Mistake Notebook** after the learner answers it correctly?"
> **Domain expert:** "No, it becomes a **Corrected Mistake** and remains useful for review."

## Flagged ambiguities

- "portal" could mean a public GitHub Pages site or a **Personal Study Portal**; resolved: this project means a private study workspace for one learner.
- "home" could mean a public landing page or a **Study Dashboard**; resolved: the portal opens to a study workspace.
- "continue" could mean last opened or next required item; resolved: **Continue Target** prefers the unfinished last opened resource, then the next incomplete required resource.
- "progress" could mean a module-level checkbox or resource-level completion; resolved: progress is tracked per **Study Resource** and aggregated into **Module Progress**.
- "required" depends on the learning role of a resource; resolved: `README`, `cheatsheet`, `flashcards`, and `questoes` are required by default, while `lab` is required only for a **Lab Module**.
- "extra resource" could mean ignored material or a blocking requirement; resolved: an unclassified **Study Resource** is included as a **Complementary Study Resource**.
- "content" could mean the course material or the learner's progress data; resolved: **Study Content** is authored learning material, while **Learner State** is personal study history.
- "markdown location" could mean loose files at the repository root or an organized **Content Library**; resolved: the portal reads from a dedicated **Content Library**.
- "missing resource" does not mean incomplete work; resolved: only existing **Study Resources** appear in the module experience.
- "questoes" could mean static reading or answerable **Practice Questions**; resolved: questions should record **Question Attempts** and feed the **Mistake Notebook**.
- "completed questions" could mean perfect score or attempted practice; resolved: **Question Resource Completion** means every question was attempted at least once.
- "answer state" could mean first, last, or only attempt; resolved: **Question Attempts** are historical, while **Current Question State** uses the latest attempt.
- "mistake notebook" could mean unresolved mistakes only or historical mistakes; resolved: it keeps historical mistakes and labels **Corrected Mistakes**.
- "review" could mean a full spaced repetition schedule or recorded study dates; resolved: MVP review means **Review History** only.
