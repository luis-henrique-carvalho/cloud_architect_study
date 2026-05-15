import { describe, it, expect } from "vitest";
import type { StudyModule, StudyResource } from "@/lib/content";
import type { ResourceVisit } from "../visits/visits";
import type { ResourceProgress } from "../progress/progress";
import { resolveContinueTarget } from "./continue-target";

// --- factory helpers ---

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

function makeVisit(
  moduleSlug: string,
  resourceKey: string,
  visitedAt: number,
): ResourceVisit {
  return { id: visitedAt, moduleSlug, resourceKey, visitedAt };
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

// --- tests ---

describe("resolveContinueTarget", () => {
  it("returns null when modules is empty", () => {
    expect(resolveContinueTarget([], [], [])).toBeNull();
  });

  it("returns the most recently visited incomplete resource", () => {
    const m = makeModule("m1", ["README", "cheatsheet"]);
    const visits = [
      makeVisit("m1", "README", 1000),
      makeVisit("m1", "cheatsheet", 2000),
    ];

    const result = resolveContinueTarget([m], visits, []);

    expect(result).toEqual({ moduleSlug: "m1", resourceKey: "cheatsheet" });
  });

  it("ignores a visit whose resource has completedAt set", () => {
    const m = makeModule("m1", ["README", "cheatsheet"]);
    const visits = [
      makeVisit("m1", "README", 1000),
      makeVisit("m1", "cheatsheet", 2000), // most recent but complete
    ];
    const progress = [makeProgress("m1", "cheatsheet", 9999)];

    const result = resolveContinueTarget([m], visits, progress);

    expect(result).toEqual({ moduleSlug: "m1", resourceKey: "README" });
  });

  it("falls back to the first incomplete required resource when no qualifying visit exists", () => {
    const m = makeModule("m1", ["README", "cheatsheet"]);
    const progress = [makeProgress("m1", "README", 9999)]; // README complete

    const result = resolveContinueTarget([m], [], progress);

    expect(result).toEqual({ moduleSlug: "m1", resourceKey: "cheatsheet" });
  });

  it("returns null when every required resource is complete", () => {
    const m = makeModule("m1", ["README", "cheatsheet"]);
    const progress = [
      makeProgress("m1", "README", 1000),
      makeProgress("m1", "cheatsheet", 2000),
    ];

    expect(resolveContinueTarget([m], [], progress)).toBeNull();
  });

  it("does not include complementary resources in the fallback path", () => {
    const m = makeModule("m1", ["README"], ["casos-de-uso"]);
    const progress = [makeProgress("m1", "README", 9999)];
    // required is complete; casos-de-uso is complementary — fallback must not pick it
    expect(resolveContinueTarget([m], [], progress)).toBeNull();
  });

  it("can return a complementary resource via the visit path", () => {
    const m = makeModule("m1", ["README"], ["casos-de-uso"]);
    const visits = [makeVisit("m1", "casos-de-uso", 2000)];
    const progress = [makeProgress("m1", "README", 9999)];

    const result = resolveContinueTarget([m], visits, progress);

    expect(result).toEqual({ moduleSlug: "m1", resourceKey: "casos-de-uso" });
  });

  it("respects module ordering in the fallback path across multiple modules", () => {
    const m1 = makeModule("m1", ["README"]);
    const m2 = makeModule("m2", ["README"]);
    const progress = [makeProgress("m1", "README", 9999)]; // m1 complete

    const result = resolveContinueTarget([m1, m2], [], progress);

    expect(result).toEqual({ moduleSlug: "m2", resourceKey: "README" });
  });
});
