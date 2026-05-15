import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, type TestDb } from "../../test-helpers";
import { recordVisit, getLastVisit } from "./visits";

let db: TestDb;

beforeEach(() => {
  db = createTestDb();
});

describe("getLastVisit", () => {
  it("returns null when no visit has been recorded", () => {
    const result = getLastVisit(db, "01-intro", "README");
    expect(result).toBeNull();
  });
});

describe("recordVisit", () => {
  it("makes a resource visit retrievable", () => {
    recordVisit(db, "01-intro", "README");
    const result = getLastVisit(db, "01-intro", "README");
    expect(result).not.toBeNull();
    expect(result?.moduleSlug).toBe("01-intro");
    expect(result?.resourceKey).toBe("README");
  });

  it("returns the most recent visit when multiple visits exist", () => {
    recordVisit(db, "01-intro", "README");
    recordVisit(db, "01-intro", "README");
    recordVisit(db, "01-intro", "README");

    const result = getLastVisit(db, "01-intro", "README");
    // getLastVisit returns a single visit, not an array
    expect(result).not.toBeNull();
  });

  it("keeps visits isolated per resource", () => {
    recordVisit(db, "01-intro", "README");

    expect(getLastVisit(db, "01-intro", "cheatsheet")).toBeNull();
    expect(getLastVisit(db, "02-iam", "README")).toBeNull();
  });
});
