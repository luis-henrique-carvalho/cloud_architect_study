# Phase 4 — Study Dashboard e Module Catalog com Learner State

## Problem Statement

The Personal Study Portal already renders the Study Dashboard and the Module Catalog from the Content Library, but neither page is connected to the Learner State. The Continue Target on the Study Dashboard is hardcoded to the first module's first resource rather than reflecting actual study activity. The Module Catalog shows no Module Progress — every card looks identical regardless of how many Required Study Resources the learner has already completed. There is also no Mistake Notebook summary on the Dashboard to surface pending review work.

As a result, the learner cannot tell at a glance where they left off, how far they are through any Study Module, or how many Incorrect Answers are waiting for review. The Dashboard functions as a static directory rather than a live study workspace.

## Solution

Wire the Study Dashboard and the Module Catalog to the existing Learner State persistence layer so that all progress, visit history, and question attempt data is reflected live. Introduce two new deep modules — a Continue Target resolver and a Module Progress calculator — that encapsulate the derivation logic cleanly and can be exercised in isolation. Extend the existing attempts module with a Mistake Notebook summary query. Update both pages to read from these new modules alongside the Content Library.

After this phase the learner opens the portal and sees exactly where to resume study, how complete each Study Module is, and how many Incorrect Answers are waiting for review.

## User Stories

1. As a learner, I want the Study Dashboard to show my real Continue Target, so that I can resume exactly where I left off without navigating the entire Module Catalog.
2. As a learner, I want the Continue Target to reflect the last resource I left incomplete, so that a partially read resource is prioritized over an earlier uncompleted one.
3. As a learner, I want the Continue Target to fall back to the next incomplete Required Study Resource when there is no recent incomplete visit, so that I always have a meaningful next step.
4. As a learner, I want the Continue Target to link directly to the correct Study Resource inside its Study Module, so that I land on the right tab without extra navigation.
5. As a learner, I want the Study Dashboard to show an overall completion percentage, so that I can feel the tangible progress of the study path.
6. As a learner, I want the Study Dashboard to show the count of completed Study Modules, so that I can gauge how far I am through the full SAA-C03 curriculum.
7. As a learner, I want the Study Dashboard to show the count of completed Required Study Resources, so that I know how many mandatory activities I have finished.
8. As a learner, I want the Study Dashboard to show a Mistake Notebook summary with the number of unresolved Incorrect Answers, so that I can decide at a glance whether to review errors before continuing.
9. As a learner, I want the Mistake Notebook summary to link to the `/erros` route, so that I can go directly to the review queue from the Dashboard.
10. As a learner, I want the Study Dashboard to show an empty state for the Mistake Notebook summary when there are no Incorrect Answers, so that I know review is up to date.
11. As a learner, I want the Study Dashboard to show an empty Continue Target state when all Required Study Resources are complete, so that I know the full study path has been covered.
12. As a learner, I want the Module Catalog to show a Module Progress indicator on each card, so that I can identify at a glance which Study Modules are done, in progress, or not yet started.
13. As a learner, I want the Module Progress indicator to display the count of completed Required Study Resources out of the total required, so that I understand which specific activities remain.
14. As a learner, I want the Module Progress indicator to display a progress bar or percentage, so that I can visually scan the catalog and spot weak areas quickly.
15. As a learner, I want a completed Study Module to be visually distinguished from an incomplete one in the Module Catalog, so that finished modules recede and upcoming modules stand out.
16. As a learner, I want the Module Catalog to remain fast even with many Study Modules, so that navigation never feels slow during a study session.
17. As a learner, I want the study stats on the Study Dashboard to update immediately after I complete a resource, so that progress feedback is real-time within the portal.
18. As a learner, I want the Continue Target label to display the Study Module title and Study Resource title together, so that I know in one glance what I am about to open.

## Implementation Decisions

### New: Continue Target Resolver (`learner-state/continue-target`)

- Pure function with signature approximately: `(modules: StudyModule[], lastVisits: ResourceVisit[], allProgress: ResourceProgress[]) → { moduleSlug: string; resourceKey: string } | null`
- Algorithm: find the most recent visit whose resource has no `completedAt`; if none, find the first Required Study Resource across ordered modules that has no `completedAt`; if all required resources are complete, return `null`.
- No database access inside this function — the caller passes in pre-fetched collections.

### Extended: Module Progress Calculator (`learner-state/progress`)

- Pure function with signature approximately: `(module: StudyModule, progressRecords: ResourceProgress[]) → { completed: number; total: number; percent: number; isComplete: boolean }`
- Counts only Required Study Resources. A resource is complete when its `completedAt` is non-null.
- No database access inside this function.

### Extended: Mistake Notebook summary (`learner-state/attempts`)

- New function: `countMistakes(db) → number` — returns the number of distinct questions whose Current Question State is an Incorrect Answer.
- Reuses the same underlying logic as `listIncorrectAttempts` but returns an aggregate count to minimise data transfer.

### Study Dashboard page (`/`)

- Loads all Study Modules from the Content Library (already cached via `getStudyModules`).
- Fetches all `ResourceProgress` rows and all recent `ResourceVisit` rows from the database (single query each).
- Feeds modules + visits + progress into the Continue Target resolver.
- Computes overall stats by mapping modules through the Module Progress calculator and summing.
- Calls `countMistakes` to populate the Mistake Notebook summary widget.
- All database reads happen on the server at render time (Next.js Server Component).

### Module Catalog page (`/modulos`)

- Loads all Study Modules (already cached).
- Fetches all `ResourceProgress` rows (single query, same as Dashboard).
- Computes per-module progress by mapping each module through the Module Progress calculator.
- Passes computed progress into each card for rendering the indicator.

### Schema — no changes required

The existing `resource_progress`, `resource_visits`, and `question_attempts` tables are sufficient. No migrations are needed for this phase.

### API contracts

- Dashboard and Module Catalog are Server Components — no new API routes are introduced.
- The Continue Target resolver, Module Progress calculator, and Mistake Notebook summary function all accept plain data (no `db` dependency) or receive `db` as the only external dependency.

### UI conventions

- Progress indicators on Module Catalog cards follow the existing shadcn `Progress` component.
- Completion badge uses the existing `Badge` component with a `default` variant for complete and `secondary` for in-progress/not-started, consistent with the Lab Module badge pattern in place.
- Mistake Notebook summary on the Dashboard is a compact widget, visually distinct from the stats grid.

## Testing Decisions

**Good test definition:** a good test exercises the external behaviour of a module through its public interface, with no knowledge of internal implementation details. Tests pass plain data in and assert on plain data out. Database-dependent functions receive an in-memory test database created by the existing `createTestDb()` helper. Tests must not assert on JSX, CSS classes, or component internals.

### Continue Target Resolver — unit tests (`learner-state/continue-target`)

Cover these scenarios:

- Returns `null` when there are no Study Modules.
- Returns `null` when all Required Study Resources across all modules are complete.
- Returns the last visited incomplete resource when one exists.
- Ignores the last visit if its resource is already complete.
- Falls back to the first incomplete Required Study Resource in module order when there is no qualifying recent visit.
- Respects module ordering when multiple modules have incomplete required resources.
- Excludes Complementary Study Resources from the fallback path.

**Prior art:** `src/modules/learner-state/progress/progress.test.ts` — demonstrates the pattern of passing a `TestDb` and asserting on return values.

### Module Progress Calculator — unit tests (`learner-state/progress`)

Cover these scenarios:

- Returns `{ completed: 0, total: 0, percent: 0, isComplete: true }` for a module with no Required Study Resources.
- Returns `isComplete: false` when at least one Required Study Resource has no `completedAt`.
- Returns `isComplete: true` when all Required Study Resources have `completedAt` set.
- Calculates `percent` correctly for partial completion (e.g. 2 of 4 → 50).
- Ignores Complementary Study Resources in all calculations.
- Ignores `completedAt: null` rows (treats them as incomplete).

**Prior art:** same as above.

### Mistake Notebook Summary — unit tests (`learner-state/attempts`)

Cover these scenarios:

- Returns 0 when no Question Attempts exist.
- Returns 0 when all latest attempts are Correct Answers.
- Returns the correct count of questions whose Current Question State is an Incorrect Answer.
- Does not double-count a question that has multiple Incorrect Answers.
- Counts a question as unresolved even if it has a mix of correct and incorrect attempts, as long as the latest is incorrect.

**Prior art:** `src/modules/learner-state/progress/progress.test.ts` using `createTestDb()`.

### Study Dashboard page — integration tests

Cover these scenarios using a Server Component render or API layer snapshot:

- Displays a valid Continue Target link when at least one incomplete Required Study Resource exists.
- Displays an empty Continue Target state when all Required Study Resources are complete.
- Displays the correct Mistake Notebook count.
- Stat cards display non-negative numbers derived from the Module Catalog.

**Prior art:** existing pattern in the test helpers; test the server-side data-fetching logic by mocking the learner-state module functions.

### Module Catalog page — integration tests

Cover these scenarios:

- Each module card shows a progress indicator that reflects the ratio of completed Required Study Resources.
- A fully complete module card is visually distinct (different badge variant).
- A module with no Required Study Resources shows a complete state.

**Prior art:** same approach as Dashboard tests.

## Out of Scope

- Filtering the Module Catalog by completion state (not in the MVP plan).
- Sorting the Module Catalog by progress or last visited date (ordering stays fixed by module number).
- Spaced repetition scheduling or smart review ordering.
- Real-time progress updates via WebSockets or polling; page refresh is sufficient.
- Study Resource completion toggle UI (belongs to the Study Module page, Phase 5).
- Question Attempt recording (belongs to the Practice Questions experience, Phase 6).
- The Mistake Notebook detail page (`/erros`) — the Dashboard links to it but it is not built in this phase.
- User preferences or configuration page.
- Multi-user or authentication concerns.

## Further Notes

- The Continue Target resolver must be a pure function so it can be tested without a database or Next.js context. The server page layer is responsible for fetching and passing in the raw data.
- Both Dashboard and Module Catalog read the same `ResourceProgress` table. A single bulk query (all rows, no per-module queries) is preferable to avoid N+1 patterns, especially as the Content Library grows to 31 modules.
- The `getStudyModules` function is already wrapped in React's `cache`, so calling it from both the Dashboard and Module Catalog pages in the same render pass will not trigger duplicate file-system reads.
- The existing `data/study.db` is gitignored and may be empty for a fresh install. The UI must handle zero-state gracefully (empty Continue Target, zero stats, zero mistakes) without errors.
