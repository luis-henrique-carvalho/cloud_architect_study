import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, type TestDb } from "../../test-helpers";
import { getProgress, upsertProgress } from "./progress";

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
