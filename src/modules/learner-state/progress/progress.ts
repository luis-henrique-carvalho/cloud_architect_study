import { eq, and } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { resourceProgress } from "@/lib/drizzle/schema";
import type * as schema from "@/lib/drizzle/schema";

type Db = BetterSQLite3Database<typeof schema>;

export type ResourceProgress = typeof resourceProgress.$inferSelect;

export function getProgress(
  db: Db,
  moduleSlug: string,
  resourceKey: string,
): ResourceProgress | null {
  const row = db
    .select()
    .from(resourceProgress)
    .where(
      and(
        eq(resourceProgress.moduleSlug, moduleSlug),
        eq(resourceProgress.resourceKey, resourceKey),
      ),
    )
    .get();

  return row ?? null;
}

export function upsertProgress(
  db: Db,
  moduleSlug: string,
  resourceKey: string,
  patch: { completedAt?: number | null; lastReviewedAt?: number | null },
): void {
  const now = Date.now();
  db.insert(resourceProgress)
    .values({
      moduleSlug,
      resourceKey,
      completedAt: patch.completedAt ?? null,
      lastReviewedAt: patch.lastReviewedAt ?? null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [resourceProgress.moduleSlug, resourceProgress.resourceKey],
      set: {
        completedAt: patch.completedAt ?? null,
        lastReviewedAt: patch.lastReviewedAt ?? null,
        updatedAt: now,
      },
    })
    .run();
}
