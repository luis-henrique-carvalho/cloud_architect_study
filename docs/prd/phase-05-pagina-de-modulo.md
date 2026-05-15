# Phase 5 — Study Module Page with Tabs, Progress, Notes, and Review History

## Problem Statement

The Personal Study Portal has a Study Module page (`/modulos/[slug]`) that renders Markdown content and a sidebar navigation for switching between Study Resources. However the page is entirely disconnected from the Learner State. The learner cannot mark a resource as complete, write or read Study Notes, see when they last reviewed a resource, or tell at a glance how far they are through the Study Module's Required Study Resources. Every visit to a module page looks identical — there is no record that any Study Resource has ever been read, and no way to leave a note or flag a resource for review.

As a result the Study Module page functions as a read-only document viewer instead of a live study workspace.

## Solution

Connect the Study Module page to the existing Learner State persistence layer and extend it with three new interactive surfaces inside the resource content area. A tab strip within the resource panel gives the learner three views — Content (the existing Markdown render), Notes (a Study Notes editor for the active resource), and History (a Review History panel showing completion and review dates). A Module Progress bar replaces the static badge header so the learner sees at a glance how many Required Study Resources are done. Each resource in the sidebar navigation gains a completion indicator so the learner can scan all resources at once. A completion toggle in the content header lets the learner mark non-interactive resources complete or reopen them. Every page load records a resource visit automatically.

After this phase the learner opens any Study Module, reads the material, writes notes, marks resources complete, and reviews the history of when each resource was last studied — all without leaving the module page.

## User Stories

1. As a learner, I want the Study Module page to show a Module Progress bar, so that I can see at a glance how many Required Study Resources I have completed out of the total required.
2. As a learner, I want the Module Progress bar to display a numeric label such as "2 of 5 required completed", so that I understand exactly how much work remains.
3. As a learner, I want the resource sidebar navigation to show a visual completion indicator on each Study Resource, so that I can scan all resources and spot which ones I still need to do.
4. As a learner, I want completed Study Resources to be visually distinguished from incomplete ones in the sidebar, so that finished resources recede and pending ones stand out.
5. As a learner, I want the resource content area to have a tab strip with Content, Notes, and History tabs, so that I can switch between reading, writing notes, and reviewing history without leaving the page.
6. As a learner, I want the Content tab to render the Study Resource's Markdown just as it does today, so that the reading experience is unchanged.
7. As a learner, I want a completion toggle in the Content tab header for non-interactive resources, so that I can mark a resource as complete when I finish reading it.
8. As a learner, I want the completion toggle to reflect the current completion state when I open a resource, so that I know at a glance whether I have already completed it.
9. As a learner, I want the completion toggle to immediately update the Module Progress bar and sidebar indicators after I click it, so that progress feedback is instant.
10. As a learner, I want the Notes tab to show my current Study Note for the active resource, so that I can recall observations I made during a previous study session.
11. As a learner, I want the Notes tab to let me write or edit a Study Note in a text area, so that I can capture insights and confusing points while reading.
12. As a learner, I want the Notes tab to save my Study Note when I submit the form, so that my notes persist across sessions without any manual export step.
13. As a learner, I want the Notes tab to let me delete an existing Study Note, so that I can clean up notes that are no longer useful.
14. As a learner, I want the Notes tab to show an empty state when no note exists yet, so that I understand I can start writing without clearing previous content.
15. As a learner, I want the History tab to show the date and time when I completed the resource, so that I know when I last marked it done.
16. As a learner, I want the History tab to show the date and time of my last review, so that I know how recently I revisited the material.
17. As a learner, I want the History tab to show a "Mark Reviewed" button, so that I can record that I revisited a resource without toggling the completion state.
18. As a learner, I want the History tab to show an empty state when the resource has never been completed, so that I understand no history exists yet.
19. As a learner, I want every resource I open to be recorded as a visit automatically, so that the Continue Target on the Study Dashboard stays accurate without any extra action from me.
20. As a learner, I want the Study Module page to remember which resource I was viewing if I leave and return by using the URL query parameter, so that I can share or bookmark a direct link to a specific Study Resource.
21. As a learner, I want the tab state (Content / Notes / History) to be driven by a URL search parameter, so that I can bookmark or deep-link to my notes on a specific resource.
22. As a learner, I want the completion toggle to be absent for Study Resources that complete themselves through interaction (such as `questoes`), so that the UI does not offer a manual toggle where it is not applicable.
23. As a learner, I want the Module Progress bar to update after I toggle completion of any resource on the page, so that the header always reflects the true current state.
24. As a learner, I want the sidebar resource indicators to update after a completion toggle, so that I can confirm a resource is marked without scrolling back to the header.
25. As a learner, I want the Notes tab to show a character or line count indicator, so that I can keep my notes concise.

## Implementation Decisions

### Module Progress Header component

- Reads Module Progress from the existing `calculateModuleProgress` pure function.
- Receives preloaded `ResourceProgress[]` from the server; does not fetch independently.
- Renders a `Progress` bar (shadcn/ui) and a numeric label.
- Replaces the current static `Badge` that shows "N required de M" in the module header.

### Resource Tab Navigator enhancements

- The existing sidebar navigation retains its current link-based structure.
- Each nav item gains a completion status indicator (a checkmark icon or colored dot) fed by the same `ResourceProgress[]` array passed to the progress header.
- The active resource is still driven by the `?resource=` query parameter (no behaviour change).

### In-Resource Tabs component

- A tab strip (shadcn/ui `Tabs`) placed at the top of the resource content column with three tabs: **Content**, **Notes**, **History**.
- Active tab is driven by an additional URL search parameter (e.g., `?tab=notes`).
- Content tab: renders the existing `MarkdownRenderer` output unchanged.
- Notes tab: renders the Study Notes Editor.
- History tab: renders the Review History Panel.

### Resource Completion Toggle

- A toggle button (shadcn/ui `Button` with `Switch` or checkbox-style affordance) rendered in the Content tab header.
- Only rendered for resources where the role does not imply self-completion — `questoes` resources are excluded because Question Resource Completion is derived from Question Attempts.
- On click, calls a Server Action that calls `upsertProgress(db, moduleSlug, resourceKey, { completedAt: now | null })`.
- After the Server Action completes, the page revalidates the module route segment so the progress bar, sidebar indicators, and toggle state all reflect the new state without a full page reload.
- `completedAt` is set to `now` when marking complete; set to `null` when marking incomplete.

### Resource Visit Recorder

- A thin Server Action (or Next.js `after()` hook if available) that calls `recordVisit(db, moduleSlug, resourceKey)` on each page load of the module page.
- Runs on the server after the page is sent to the client so it does not delay rendering.
- No UI — invisible to the learner.

### Study Notes Editor

- A Server Component that reads the current `StudyNote` via `getNote(db, moduleSlug, resourceKey)` at render time.
- A Client Component form that holds the textarea value in local state and submits to a Server Action on save.
- Save Server Action calls `upsertNote(db, moduleSlug, resourceKey, content)`.
- Delete Server Action calls `deleteNote(db, moduleSlug, resourceKey)` and resets the form.
- Revalidates only the Notes tab path segment after save or delete to avoid re-rendering the full page.
- Shows an empty state (`Empty` shadcn/ui component) when no note exists and the textarea is empty.

### Review History Panel

- Reads `ResourceProgress` (which holds `completedAt` and `lastReviewedAt`) from the same preloaded array.
- Renders two date rows: "Completed on" and "Last reviewed on", each formatted as a locale date-time string.
- A "Mark Reviewed" button calls a Server Action that calls `upsertProgress(db, moduleSlug, resourceKey, { lastReviewedAt: now })`.
- Shows an empty state when `completedAt` is null (resource not yet complete).
- The "Mark Reviewed" button is only shown when `completedAt` is non-null.

### Data loading strategy

- The module Server Component fetches all `ResourceProgress` rows for the current module in one query (filtered by `moduleSlug`).
- The single `StudyNote` for the active resource is fetched at render time inside the Notes tab server component.
- No N+1 queries: progress for all resources is fetched once and passed down as props.
- No new database tables are required; the existing `resource_progress` and `study_notes` tables are sufficient.

### Schema — no changes required

The existing `resource_progress` (with `completedAt`, `lastReviewedAt`, `updatedAt`) and `study_notes` (with `content`, `createdAt`, `updatedAt`) tables fully support this phase. No migrations are needed.

### API contracts

- All mutations (toggle, save note, delete note, mark reviewed, record visit) are implemented as Next.js Server Actions.
- No new API routes are introduced.
- Server Actions revalidate the affected path segment using `revalidatePath`.

### UI conventions

- shadcn/ui `Tabs`, `Progress`, `Button`, `Textarea`, `Switch`, `Badge`, and `Empty` are used.
- The completion toggle uses a visual style consistent with the existing `resourceProgress` completion indicators on the Module Catalog cards.
- The Notes textarea uses the existing `Textarea` component with no custom styling beyond layout.
- Date formatting uses `Intl.DateTimeFormat` with the learner's locale (no additional dependency).

## Testing Decisions

### What makes a good test

A good test exercises the observable external behaviour of a module through its public interface — what it renders or what state it mutates — without asserting on implementation details like class names, internal function calls, or rendering order. Tests use realistic data from the existing `test-helpers.ts` fixture factory. A test should fail when the module does something observably wrong and pass when the module behaves correctly, regardless of internal refactoring.

### Modules to test and approach

**Module Progress Header**

- Given a module with zero completed resources, the progress bar renders "0 of N required completed" and a 0% value.
- Given a module with some required resources completed, the label and percentage reflect the correct fraction.
- Given a fully completed module, the label reflects N of N and an optional "complete" indicator is shown.
- Prior art: `calculateModuleProgress` unit tests in `src/modules/learner-state/`.

**Resource Completion Toggle**

- Given a resource with no completion record, the toggle renders in unchecked/incomplete state.
- Given a resource with a `completedAt` value, the toggle renders in checked/complete state.
- Clicking the toggle calls the save Server Action with the correct `moduleSlug` and `resourceKey`.
- The toggle is absent for resources that self-complete (e.g., `questoes`).
- Prior art: Server Action integration patterns from the dashboard page.

**Study Notes Editor**

- Given no existing note, the textarea is empty and an empty state is shown.
- Given an existing note, the textarea is pre-filled with the note content.
- Submitting the form with content calls the save Server Action.
- Clicking delete calls the delete Server Action.
- Prior art: form interaction patterns in existing Client Component forms.

**Review History Panel**

- Given a resource with no `completedAt`, the panel shows an empty state and no "Mark Reviewed" button.
- Given a resource with `completedAt` but no `lastReviewedAt`, the completion date is shown and the "Mark Reviewed" button is visible.
- Given a resource with both dates set, both dates are shown and the "Mark Reviewed" button is visible.
- Clicking "Mark Reviewed" calls the review Server Action.
- Prior art: `upsertProgress` unit tests in `src/modules/learner-state/`.

**Resource Visit Recorder**

- Given a module and resource key, invoking the recorder calls `recordVisit` with the correct arguments.
- The recorder does not throw when the database already has a visit for the same resource.
- Prior art: `recordVisit` unit tests in `src/modules/learner-state/`.

**In-Resource Tabs**

- Given no `?tab=` parameter, the Content tab is active by default.
- Given `?tab=notes`, the Notes tab is active.
- Given `?tab=history`, the History tab is active.
- Tab links include the current `?resource=` parameter so switching tabs does not change the active resource.
- Prior art: sidebar navigation link construction in the existing module page.

## Out of Scope

- Interactive Practice Questions (`questoes.md`) — handled in Phase 6.
- Mistake Notebook page (`/erros`) — handled in Phase 7.
- Flashcard interactive mode — not in the MVP.
- Spaced repetition scheduling — Review History records dates only; no algorithm plans future reviews.
- Study Note rich text or formatting — plain text only in this phase.
- Multi-resource bulk completion (e.g., "Mark all as complete") — not in the MVP.
- Offline mode or sync — the portal is local-only.
- Animations or transitions between tabs — out of scope to keep UI simple and readable.

## Further Notes

- The `questoes` resource key is the only standard resource excluded from the completion toggle. Custom non-standard resources that happen to be interactive are not considered here; they default to showing the toggle.
- `lastReviewedAt` is updated independently of `completedAt`. The learner can mark a resource reviewed multiple times after completion; only the latest date is stored (matching the current schema design).
- The visit recorder must fire even if the learner navigates directly from one resource to another via the sidebar, since each navigation triggers a full Server Component render of the new resource.
- If `generateStaticParams` is kept for the module page, Server Actions that call `revalidatePath` must use `"/"` as the revalidation scope or switch the page to dynamic rendering. The phase implementation should verify this behaviour and document the outcome in an ADR if the approach changes.
