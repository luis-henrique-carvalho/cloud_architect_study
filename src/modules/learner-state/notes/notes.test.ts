import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, type TestDb } from "../../test-helpers";
import { getNote, upsertNote, deleteNote } from "./notes";

let db: TestDb;

beforeEach(() => {
  db = createTestDb();
});

describe("getNote", () => {
  it("returns null when no note exists for a resource", () => {
    expect(getNote(db, "01-intro", "README")).toBeNull();
  });
});

describe("upsertNote", () => {
  it("makes a note retrievable after creating it", () => {
    upsertNote(db, "01-intro", "README", "my first note");
    const result = getNote(db, "01-intro", "README");
    expect(result?.content).toBe("my first note");
  });

  it("updates content in place — no duplicate rows", () => {
    upsertNote(db, "01-intro", "README", "original content");
    upsertNote(db, "01-intro", "README", "updated content");
    const result = getNote(db, "01-intro", "README");
    expect(result?.content).toBe("updated content");
  });

  it("keeps notes isolated per resource", () => {
    upsertNote(db, "01-intro", "README", "note for README");
    expect(getNote(db, "01-intro", "cheatsheet")).toBeNull();
  });
});

describe("deleteNote", () => {
  it("removes an existing note", () => {
    upsertNote(db, "01-intro", "README", "to be deleted");
    deleteNote(db, "01-intro", "README");
    expect(getNote(db, "01-intro", "README")).toBeNull();
  });

  it("is a no-op when no note exists", () => {
    // Should not throw
    deleteNote(db, "01-intro", "README");
    expect(getNote(db, "01-intro", "README")).toBeNull();
  });
});
