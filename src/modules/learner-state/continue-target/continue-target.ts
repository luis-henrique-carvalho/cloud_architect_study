import type { StudyModule } from "@/lib/content";
import type { ResourceVisit } from "../visits/visits";
import type { ResourceProgress } from "../progress/progress";

export type ContinueTarget = {
  moduleSlug: string;
  resourceKey: string;
};

export function resolveContinueTarget(
  modules: StudyModule[],
  visits: ResourceVisit[],
  progress: ResourceProgress[],
): ContinueTarget | null {
  if (modules.length === 0) return null;

  // Build lookup: "moduleSlug:resourceKey" → completedAt (undefined = no row)
  const completedAtMap = new Map<string, number | null>();
  for (const p of progress) {
    completedAtMap.set(`${p.moduleSlug}:${p.resourceKey}`, p.completedAt);
  }

  // Build set of known resources to filter stale/invalid visits
  const resourceSet = new Set<string>();
  for (const m of modules) {
    for (const r of m.resources) {
      resourceSet.add(`${m.slug}:${r.key}`);
    }
  }

  // Visit-based path: most recent visit whose resource is not yet complete
  const sortedVisits = [...visits].sort((a, b) => b.visitedAt - a.visitedAt);
  for (const visit of sortedVisits) {
    const key = `${visit.moduleSlug}:${visit.resourceKey}`;
    if (!resourceSet.has(key)) continue;
    // undefined (no row) and null (row with completedAt = null) both mean incomplete
    if (completedAtMap.get(key) == null) {
      return { moduleSlug: visit.moduleSlug, resourceKey: visit.resourceKey };
    }
  }

  // Fallback path: first incomplete required resource across ordered modules
  for (const m of modules) {
    for (const r of m.requiredResources) {
      const key = `${m.slug}:${r.key}`;
      if (completedAtMap.get(key) == null) {
        return { moduleSlug: m.slug, resourceKey: r.key };
      }
    }
  }

  return null;
}
