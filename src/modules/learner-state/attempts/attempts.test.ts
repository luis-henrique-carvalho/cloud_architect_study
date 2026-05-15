import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, type TestDb } from "../../test-helpers";
import {
  recordAttempt,
  getLatestAttempt,
  listAttempts,
  listIncorrectAttempts,
} from "./attempts";

let db: TestDb;

beforeEach(() => {
  db = createTestDb();
});

describe("getLatestAttempt", () => {
  it("returns null when no attempt has been recorded", () => {
    expect(getLatestAttempt(db, "01-intro", "questoes", "q1")).toBeNull();
  });
});

describe("recordAttempt", () => {
  it("records an attempt and makes it retrievable", () => {
    recordAttempt(db, "01-intro", "questoes", "q1", "A", "A");
    const result = getLatestAttempt(db, "01-intro", "questoes", "q1");
    expect(result).not.toBeNull();
    expect(result?.selectedAnswer).toBe("A");
    expect(result?.correctAnswer).toBe("A");
  });

  it("marks a matching answer as correct", () => {
    recordAttempt(db, "01-intro", "questoes", "q1", "B", "B");
    expect(getLatestAttempt(db, "01-intro", "questoes", "q1")?.isCorrect).toBe(
      true,
    );
  });

  it("marks a non-matching answer as incorrect", () => {
    recordAttempt(db, "01-intro", "questoes", "q1", "A", "B");
    expect(getLatestAttempt(db, "01-intro", "questoes", "q1")?.isCorrect).toBe(
      false,
    );
  });

  it("returns the most recent attempt for a question when multiple exist", () => {
    recordAttempt(db, "01-intro", "questoes", "q1", "A", "B"); // incorrect
    recordAttempt(db, "01-intro", "questoes", "q1", "B", "B"); // correct

    const result = getLatestAttempt(db, "01-intro", "questoes", "q1");
    expect(result?.isCorrect).toBe(true);
    expect(result?.selectedAnswer).toBe("B");
  });
});

describe("listAttempts", () => {
  it("returns an empty array when no attempts exist", () => {
    expect(listAttempts(db, "01-intro", "questoes")).toEqual([]);
  });

  it("returns all attempts for a resource in insertion order", () => {
    recordAttempt(db, "01-intro", "questoes", "q1", "A", "B");
    recordAttempt(db, "01-intro", "questoes", "q2", "C", "C");
    recordAttempt(db, "01-intro", "questoes", "q1", "B", "B");

    const results = listAttempts(db, "01-intro", "questoes");
    expect(results).toHaveLength(3);
    expect(results[0].questionId).toBe("q1");
    expect(results[1].questionId).toBe("q2");
    expect(results[2].questionId).toBe("q1");
  });

  it("isolates attempts by resource", () => {
    recordAttempt(db, "01-intro", "questoes", "q1", "A", "B");
    expect(listAttempts(db, "02-iam", "questoes")).toEqual([]);
  });
});

describe("listIncorrectAttempts — Mistake Notebook feed", () => {
  it("returns empty when all attempts are correct", () => {
    recordAttempt(db, "01-intro", "questoes", "q1", "A", "A");
    expect(listIncorrectAttempts(db)).toEqual([]);
  });

  it("returns questions whose current state is incorrect", () => {
    recordAttempt(db, "01-intro", "questoes", "q1", "A", "B"); // incorrect

    const results = listIncorrectAttempts(db);
    expect(results).toHaveLength(1);
    expect(results[0].questionId).toBe("q1");
    expect(results[0].isCorrect).toBe(false);
  });

  it("excludes a corrected mistake from the Mistake Notebook", () => {
    recordAttempt(db, "01-intro", "questoes", "q1", "A", "B"); // incorrect
    recordAttempt(db, "01-intro", "questoes", "q1", "B", "B"); // corrected

    expect(listIncorrectAttempts(db)).toEqual([]);
  });

  it("includes a question that was correct then answered incorrectly", () => {
    recordAttempt(db, "01-intro", "questoes", "q1", "B", "B"); // correct
    recordAttempt(db, "01-intro", "questoes", "q1", "A", "B"); // now incorrect

    const results = listIncorrectAttempts(db);
    expect(results).toHaveLength(1);
    expect(results[0].isCorrect).toBe(false);
  });

  it("returns one entry per question even when multiple incorrect attempts exist", () => {
    recordAttempt(db, "01-intro", "questoes", "q1", "A", "B"); // incorrect
    recordAttempt(db, "01-intro", "questoes", "q1", "C", "B"); // still incorrect

    const results = listIncorrectAttempts(db);
    expect(results).toHaveLength(1);
  });
});
