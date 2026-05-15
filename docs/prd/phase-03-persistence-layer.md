# PRD — Fase 3: Camada de Persistência (Drizzle + SQLite)

> Status: needs-triage

## Problem Statement

The Personal Study Portal has no way to persist Learner State. Without a persistence layer, the learner cannot track Study Resource completion, record Question Attempts, write Study Notes, or see Review History. Every session starts from zero with no continuity.

## Solution

Introduce a typed persistence layer using Drizzle ORM backed by a local SQLite file (`data/study.db`). The layer exposes a clean, typed repository API for reading and writing Learner State. A single Drizzle schema file drives both the TypeScript types and the SQL migrations, so the schema is always the source of truth.

## User Stories

1. As a learner, I want my Study Resource completions to be saved across sessions, so that I can resume study where I left off.
2. As a learner, I want my Question Attempts to be recorded permanently, so that I never lose my answer history for a Practice Question.
3. As a learner, I want my Study Notes to survive page reloads and restarts, so that my written observations stay attached to the correct Study Resource.
4. As a learner, I want the Mistake Notebook to be derived from my recorded Incorrect Answers, so that I always see an accurate reflection of my weak areas.
5. As a learner, I want the Continue Target to be based on my last recorded visit, so that reopening the app takes me back to where I stopped.
6. As a learner, I want Module Progress to be calculated from my persisted completions, so that percentage indicators reflect real activity.
7. As a learner, I want my Review History dates to be stored permanently, so that I can see when I last reviewed a Study Resource.
8. As a learner, I want the database file excluded from version control, so that my private study data is never accidentally committed.
9. As a developer, I want a single typed schema file to define all tables, so that schema and TypeScript types stay in sync automatically.
10. As a developer, I want schema migrations generated and applied via Drizzle Kit, so that future schema changes are incremental and tracked.
11. As a developer, I want a singleton database client exported from `src/lib/db.ts`, so that all server-side code shares one connection without extra setup.
12. As a developer, I want a typed Learner State repository layer, so that callers never write raw SQL or import Drizzle internals directly.
13. As a developer, I want the repository functions to be independently importable per domain (progress, notes, visits, attempts), so that future pages only load what they need.
14. As a developer, I want the `data/` directory created automatically if it does not exist, so that the first-run experience requires no manual setup.

## Implementation Decisions

### Modules

**Drizzle Schema** (`drizzle/schema.ts`)

- Defines four tables: `resource_progress`, `resource_visits`, `study_notes`, `question_attempts`.
- `resource_progress` uses a composite primary key on `(module_slug, resource_key)` — one row per resource, updated in place.
- `resource_visits`, `study_notes`, and `question_attempts` use an auto-increment integer `id` primary key.
- All timestamp fields stored as integer (Unix epoch milliseconds) for SQLite compatibility.
- `is_correct` stored as integer with boolean mode.
- This module is the schema source of truth and changes rarely after initial setup.

**Database Client** (`src/lib/db.ts`)

- Initialises the `better-sqlite3` driver and passes it to `drizzle()`.
- Exports a singleton `db` instance.
- Resolves the `data/` directory relative to `process.cwd()` and creates it if absent.
- `better-sqlite3` is chosen over `libsql` because the app is local-only, no remote database is needed, and the synchronous driver integrates cleanly with Next.js Server Components and Server Actions without async connection management overhead.

**Drizzle Configuration** (`drizzle.config.ts`)

- Configures `drizzle-kit` with `dialect: "sqlite"`, schema path, and migrations output path (`drizzle/migrations/`).
- Enables `verbose` and `strict` modes for development safety.

**Learner State Repository** (`src/lib/learner-state/`)

- One file per domain entity: `progress.ts`, `visits.ts`, `notes.ts`, `attempts.ts`.
- Each file exports typed async (or sync) functions wrapping Drizzle queries.
- No raw SQL or Drizzle internals leak past this boundary.
- Index file (`src/lib/learner-state/index.ts`) re-exports all public functions for convenience.

### Schema

```
resource_progress
- module_slug     text        NOT NULL
- resource_key    text        NOT NULL
- completed_at    integer     (nullable — null means not yet completed)
- last_reviewed_at integer    (nullable)
- updated_at      integer     NOT NULL
- PRIMARY KEY (module_slug, resource_key)

resource_visits
- id              integer     PRIMARY KEY AUTOINCREMENT
- module_slug     text        NOT NULL
- resource_key    text        NOT NULL
- visited_at      integer     NOT NULL

study_notes
- id              integer     PRIMARY KEY AUTOINCREMENT
- module_slug     text        NOT NULL
- resource_key    text        NOT NULL
- content         text        NOT NULL
- created_at      integer     NOT NULL
- updated_at      integer     NOT NULL

question_attempts
- id              integer     PRIMARY KEY AUTOINCREMENT
- module_slug     text        NOT NULL
- resource_key    text        NOT NULL
- question_id     text        NOT NULL
- selected_answer text        NOT NULL
- correct_answer  text        NOT NULL
- is_correct      integer     NOT NULL  (boolean mode)
- created_at      integer     NOT NULL
```

### Package Changes

Runtime additions: `drizzle-orm`, `better-sqlite3`
Dev additions: `drizzle-kit`, `@types/better-sqlite3`

### NPM Scripts

Add to `package.json`:

- `db:generate` — runs `drizzle-kit generate` to produce SQL migration files
- `db:migrate` — runs `drizzle-kit migrate` to apply pending migrations to `data/study.db`

### .gitignore

`data/*.db` and `data/*.db-*` are already present in `.gitignore`. No changes required.

### Migration Strategy

A single initial migration is generated from the schema and applied on first run. Future schema changes produce additional numbered migrations. Migration files are committed to version control; the database file is not.

## Testing Decisions

### What makes a good test here

Tests should verify the external behavior of the Learner State Repository functions — i.e., that inserting a record and then querying returns the expected shape, and that domain rules (composite key upsert, null `completed_at` for incomplete resources) hold. Tests should not assert on SQL strings, internal Drizzle object shapes, or schema internals.

### Modules to test

- **Drizzle Schema** — assert that the table definitions produce the correct column names and types when introspected via a test in-memory database (`:memory:`). This validates the schema is consumable without running a full migration.
- **Learner State Repository** — integration tests against an in-memory SQLite database initialised with the same migrations. Test each public repository function: upsert/get progress, insert/list visits, create/update/delete notes, insert/query attempts.

### Prior art

No existing tests in the codebase yet. Tests should follow the Next.js + Vitest or Jest pattern. An in-memory SQLite database (`:memory:`) created fresh per test file provides isolation without filesystem side effects.

## Out of Scope

- Authentication or multi-user support.
- Remote or cloud SQLite (Turso, PlanetScale, etc.).
- Importing Study Content into the database — Markdown remains the source of truth.
- Seeding the database with module or question data.
- Full-text search indexes.
- Drizzle Studio UI (can be used ad-hoc in dev, not a project deliverable).
- Any UI that reads from the persistence layer — that belongs to later phases.

## Further Notes

- The `drizzle/` directory already exists in the repository root but is currently empty. Migrations output should go to `drizzle/migrations/`.
- The `src/lib/learner-state/` directory already exists but is empty. Phase 3 populates it.
- No environment variable is needed for the database URL in local mode — the path is derived from `process.cwd()` at runtime.
- If a future phase needs async access (e.g., edge runtime), swapping `better-sqlite3` for `@libsql/client/node` is a contained change to `src/lib/db.ts` only; the repository layer remains unchanged.
