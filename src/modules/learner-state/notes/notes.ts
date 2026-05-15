import { eq, and } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { studyNotes } from "@/lib/drizzle/schema";
import type * as schema from "@/lib/drizzle/schema";

type Db = BetterSQLite3Database<typeof schema>;

export type StudyNote = typeof studyNotes.$inferSelect;

export function getNote(
  db: Db,
  moduleSlug: string,
  resourceKey: string,
): StudyNote | null {
  const row = db
    .select()
    .from(studyNotes)
    .where(
      and(
        eq(studyNotes.moduleSlug, moduleSlug),
        eq(studyNotes.resourceKey, resourceKey),
      ),
    )
    .get();

  return row ?? null;
}

export function upsertNote(
  db: Db,
  moduleSlug: string,
  resourceKey: string,
  content: string,
): void {
  const now = Date.now();
  const existing = getNote(db, moduleSlug, resourceKey);

  if (existing) {
    db.update(studyNotes)
      .set({ content, updatedAt: now })
      .where(
        and(
          eq(studyNotes.moduleSlug, moduleSlug),
          eq(studyNotes.resourceKey, resourceKey),
        ),
      )
      .run();
  } else {
    db.insert(studyNotes)
      .values({
        moduleSlug,
        resourceKey,
        content,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }
}

export function deleteNote(
  db: Db,
  moduleSlug: string,
  resourceKey: string,
): void {
  db.delete(studyNotes)
    .where(
      and(
        eq(studyNotes.moduleSlug, moduleSlug),
        eq(studyNotes.resourceKey, resourceKey),
      ),
    )
    .run();
}
