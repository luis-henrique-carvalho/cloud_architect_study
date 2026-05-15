import { eq, and } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { resourceProgress } from "@/lib/drizzle/schema";
import type * as schema from "@/lib/drizzle/schema";
import type { StudyModule } from "@/lib/content";

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

export type ModuleProgress = {
  completed: number;
  total: number;
  percent: number;
  isComplete: boolean;
};

export function calculateModuleProgress(
  module: StudyModule,
  progressRecords: ResourceProgress[],
): ModuleProgress {
  const required = module.requiredResources;

  if (required.length === 0) {
    return { completed: 0, total: 0, percent: 0, isComplete: true };
  }

  const completedKeys = new Set<string>(
    progressRecords
      .filter((p) => p.moduleSlug === module.slug && p.completedAt != null)
      .map((p) => p.resourceKey),
  );

  const total = required.length;
  const completed = required.filter((r) => completedKeys.has(r.key)).length;
  const percent = Math.round((completed / total) * 100);

  return { completed, total, percent, isComplete: completed === total };
}

export type OverallStats = {
  completedModules: number;
  totalModules: number;
  completedRequired: number;
  totalRequired: number;
  overallPercent: number;
};

export function deriveOverallStats(
  modules: StudyModule[],
  progressRecords: ResourceProgress[],
): OverallStats {
  if (modules.length === 0) {
    return {
      completedModules: 0,
      totalModules: 0,
      completedRequired: 0,
      totalRequired: 0,
      overallPercent: 0,
    };
  }

  const moduleProgresses = modules.map((m) =>
    calculateModuleProgress(m, progressRecords),
  );

  const completedModules = moduleProgresses.filter((p) => p.isComplete).length;
  const totalModules = modules.length;
  const completedRequired = moduleProgresses.reduce(
    (sum, p) => sum + p.completed,
    0,
  );
  const totalRequired = moduleProgresses.reduce((sum, p) => sum + p.total, 0);
  const overallPercent =
    totalRequired === 0
      ? 0
      : Math.round((completedRequired / totalRequired) * 100);

  return {
    completedModules,
    totalModules,
    completedRequired,
    totalRequired,
    overallPercent,
  };
}

export function getModuleProgressRows(
  db: Db,
  moduleSlug: string,
): ResourceProgress[] {
  return db
    .select()
    .from(resourceProgress)
    .where(eq(resourceProgress.moduleSlug, moduleSlug))
    .all();
}

export function formatProgressLabel(completed: number, total: number): string {
  return `${completed} de ${total} requeridos concluídos`;
}
