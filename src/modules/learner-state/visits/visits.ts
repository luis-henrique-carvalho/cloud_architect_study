import { eq, and, desc } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { resourceVisits } from "@/lib/drizzle/schema";
import type * as schema from "@/lib/drizzle/schema";

type Db = BetterSQLite3Database<typeof schema>;

export type ResourceVisit = typeof resourceVisits.$inferSelect;

export function recordVisit(
  db: Db,
  moduleSlug: string,
  resourceKey: string,
): void {
  db.insert(resourceVisits)
    .values({ moduleSlug, resourceKey, visitedAt: Date.now() })
    .run();
}

export function getLastVisit(
  db: Db,
  moduleSlug: string,
  resourceKey: string,
): ResourceVisit | null {
  const row = db
    .select()
    .from(resourceVisits)
    .where(
      and(
        eq(resourceVisits.moduleSlug, moduleSlug),
        eq(resourceVisits.resourceKey, resourceKey),
      ),
    )
    .orderBy(desc(resourceVisits.visitedAt))
    .limit(1)
    .get();

  return row ?? null;
}
