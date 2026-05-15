import { describe, it, expect, beforeEach } from "vitest";
import type { StudyModule, StudyResource } from "@/lib/content";
import { createTestDb, type TestDb } from "../../test-helpers";
import {
  getProgress,
  upsertProgress,
  calculateModuleProgress,
  deriveOverallStats,
} from "./progress";
import type { ResourceProgress } from "./progress";

let db: TestDb;

beforeEach(() => {
  db = createTestDb();
});

describe("getProgress", () => {
  it("returns null for an unseen resource", () => {
    const result = getProgress(db, "01-intro", "README");
    expect(result).toBeNull();
  });
});

describe("upsertProgress", () => {
  it("makes a resource retrievable after upserting", () => {
    upsertProgress(db, "01-intro", "README", {});
    const result = getProgress(db, "01-intro", "README");
    expect(result).not.toBeNull();
    expect(result?.moduleSlug).toBe("01-intro");
    expect(result?.resourceKey).toBe("README");
  });

  it("marks a resource as complete when completedAt is provided", () => {
    const completedAt = Date.now();
    upsertProgress(db, "01-intro", "README", { completedAt });
    const result = getProgress(db, "01-intro", "README");
    expect(result?.completedAt).toBe(completedAt);
  });

  it("leaves completedAt null when not provided", () => {
    upsertProgress(db, "01-intro", "README", {});
    const result = getProgress(db, "01-intro", "README");
    expect(result?.completedAt).toBeNull();
  });

  it("updates in place on second upsert — no duplicate rows", () => {
    upsertProgress(db, "01-intro", "README", {});
    const firstUpdatedAt = getProgress(db, "01-intro", "README")!.updatedAt;

    const laterTime = firstUpdatedAt + 1000;
    upsertProgress(db, "01-intro", "README", { completedAt: laterTime });

    const result = getProgress(db, "01-intro", "README");
    expect(result?.completedAt).toBe(laterTime);
    // Still only one row: getProgress returns a single value, not an array
  });

  it("updates lastReviewedAt when provided", () => {
    const lastReviewedAt = Date.now();
    upsertProgress(db, "01-intro", "README", { lastReviewedAt });
    const result = getProgress(db, "01-intro", "README");
    expect(result?.lastReviewedAt).toBe(lastReviewedAt);
  });

  it("tracks progress independently per resource", () => {
    upsertProgress(db, "01-intro", "README", { completedAt: 1000 });
    upsertProgress(db, "01-intro", "cheatsheet", {});

    expect(getProgress(db, "01-intro", "README")?.completedAt).toBe(1000);
    expect(getProgress(db, "01-intro", "cheatsheet")?.completedAt).toBeNull();
  });
});

// --- factory helpers for calculateModuleProgress ---

function makeResource(
  key: string,
  role: "required" | "complementary",
): StudyResource {
  return {
    key,
    fileName: `${key}.md`,
    title: key,
    role,
    isStandard: true,
    order: 0,
  };
}

function makeModule(
  slug: string,
  requiredKeys: string[],
  complementaryKeys: string[] = [],
): StudyModule {
  const required = requiredKeys.map((k) => makeResource(k, "required"));
  const complementary = complementaryKeys.map((k) =>
    makeResource(k, "complementary"),
  );
  return {
    slug,
    order: 0,
    title: slug,
    summary: "",
    isLabModule: false,
    resources: [...required, ...complementary],
    requiredResources: required,
    complementaryResources: complementary,
  };
}

function makeProgress(
  moduleSlug: string,
  resourceKey: string,
  completedAt: number | null,
): ResourceProgress {
  return {
    moduleSlug,
    resourceKey,
    completedAt,
    lastReviewedAt: null,
    updatedAt: 0,
  };
}

// ---

describe("calculateModuleProgress", () => {
  it("returns { 0, 0, 0, isComplete: true } for a module with no required resources", () => {
    const m = makeModule("m1", []);
    expect(calculateModuleProgress(m, [])).toEqual({
      completed: 0,
      total: 0,
      percent: 0,
      isComplete: true,
    });
  });

  it("returns isComplete: false when any required resource lacks completedAt", () => {
    const m = makeModule("m1", ["README", "cheatsheet"]);
    const progress = [makeProgress("m1", "README", 1000)]; // cheatsheet missing

    const result = calculateModuleProgress(m, progress);

    expect(result.isComplete).toBe(false);
  });

  it("returns isComplete: true when all required resources have completedAt", () => {
    const m = makeModule("m1", ["README", "cheatsheet"]);
    const progress = [
      makeProgress("m1", "README", 1000),
      makeProgress("m1", "cheatsheet", 2000),
    ];

    expect(calculateModuleProgress(m, progress).isComplete).toBe(true);
  });

  it("calculates percent correctly for partial completion", () => {
    const m = makeModule("m1", ["a", "b", "c", "d"]);
    const progress = [
      makeProgress("m1", "a", 1000),
      makeProgress("m1", "b", 2000),
    ];

    const result = calculateModuleProgress(m, progress);

    expect(result.completed).toBe(2);
    expect(result.total).toBe(4);
    expect(result.percent).toBe(50);
  });

  it("treats a completedAt: null row as incomplete", () => {
    const m = makeModule("m1", ["README"]);
    const progress = [makeProgress("m1", "README", null)];

    const result = calculateModuleProgress(m, progress);

    expect(result.isComplete).toBe(false);
    expect(result.completed).toBe(0);
  });

  it("ignores complementary resources in all calculations", () => {
    const m = makeModule("m1", ["README"], ["casos-de-uso"]);
    const progress = [
      makeProgress("m1", "README", 1000),
      makeProgress("m1", "casos-de-uso", 2000), // complementary — must not count
    ];

    const result = calculateModuleProgress(m, progress);

    expect(result.total).toBe(1);
    expect(result.isComplete).toBe(true);
  });
});

describe("deriveOverallStats", () => {
  it("returns all zeros when modules list is empty", () => {
    expect(deriveOverallStats([], [])).toEqual({
      completedModules: 0,
      totalModules: 0,
      completedRequired: 0,
      totalRequired: 0,
      overallPercent: 0,
    });
  });

  it("returns zero completed when no progress exists", () => {
    const m1 = makeModule("m1", ["README", "cheatsheet"]);
    const m2 = makeModule("m2", ["README"]);

    const result = deriveOverallStats([m1, m2], []);

    expect(result.completedModules).toBe(0);
    expect(result.totalModules).toBe(2);
    expect(result.completedRequired).toBe(0);
    expect(result.totalRequired).toBe(3);
    expect(result.overallPercent).toBe(0);
  });

  it("counts a module as complete only when all its required resources are complete", () => {
    const m1 = makeModule("m1", ["README", "cheatsheet"]);
    const m2 = makeModule("m2", ["README"]);
    const progress = [
      makeProgress("m1", "README", 1000),
      makeProgress("m1", "cheatsheet", 2000), // m1 complete
      makeProgress("m2", "README", null), // m2 incomplete
    ];

    const result = deriveOverallStats([m1, m2], progress);

    expect(result.completedModules).toBe(1);
  });

  it("counts a module with no required resources as complete", () => {
    const m = makeModule("m1", []); // no required resources

    const result = deriveOverallStats([m], []);

    expect(result.completedModules).toBe(1);
    expect(result.totalModules).toBe(1);
  });

  it("calculates overallPercent from required resource completions", () => {
    const m1 = makeModule("m1", ["a", "b"]); // 2 required
    const m2 = makeModule("m2", ["c", "d"]); // 2 required  — total 4
    const progress = [
      makeProgress("m1", "a", 1000),
      makeProgress("m1", "b", 2000), // 2 of 4 complete
    ];

    const result = deriveOverallStats([m1, m2], progress);

    expect(result.completedRequired).toBe(2);
    expect(result.totalRequired).toBe(4);
    expect(result.overallPercent).toBe(50);
  });

  it("returns overallPercent 100 when all required resources are complete", () => {
    const m = makeModule("m1", ["README"]);
    const progress = [makeProgress("m1", "README", 1000)];

    const result = deriveOverallStats([m], progress);

    expect(result.overallPercent).toBe(100);
    expect(result.completedModules).toBe(1);
  });
});
