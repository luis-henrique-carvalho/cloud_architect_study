import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, type TestDb } from "../../modules/test-helpers";
import { listAttempts, getProgress } from "@/modules/learner-state";
import { processQuestionAttempt } from "./submit-answer";
import type { ParsedQuestion } from "./parser";

let db: TestDb;

beforeEach(() => {
  db = createTestDb();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQuestions(count: number): ParsedQuestion[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `q${i + 1}`,
    ordinal: i + 1,
    prompt: `Prompt ${i + 1}`,
    options: [
      { key: "A", text: "Opcao A" },
      { key: "B", text: "Opcao B" },
      { key: "C", text: "Opcao C" },
      { key: "D", text: "Opcao D" },
    ],
    correctAnswer: "B",
    explanation: "Explicacao.",
  }));
}

// ---------------------------------------------------------------------------
// processQuestionAttempt
// ---------------------------------------------------------------------------

describe("processQuestionAttempt — recording", () => {
  it("records a correct attempt", () => {
    const questions = makeQuestions(1);
    const { attempt } = processQuestionAttempt(
      db,
      questions,
      "01-intro",
      "questoes",
      "q1",
      "B",
    );

    expect(attempt.isCorrect).toBe(true);
    expect(attempt.selectedAnswer).toBe("B");
    expect(attempt.correctAnswer).toBe("B");
  });

  it("records an incorrect attempt", () => {
    const questions = makeQuestions(1);
    const { attempt } = processQuestionAttempt(
      db,
      questions,
      "01-intro",
      "questoes",
      "q1",
      "A",
    );

    expect(attempt.isCorrect).toBe(false);
    expect(attempt.selectedAnswer).toBe("A");
  });

  it("persists the attempt so it is retrievable", () => {
    const questions = makeQuestions(1);
    processQuestionAttempt(db, questions, "01-intro", "questoes", "q1", "B");

    const all = listAttempts(db, "01-intro", "questoes");
    expect(all).toHaveLength(1);
    expect(all[0].questionId).toBe("q1");
  });

  it("appends multiple attempts rather than replacing previous ones", () => {
    const questions = makeQuestions(1);
    processQuestionAttempt(db, questions, "01-intro", "questoes", "q1", "A");
    processQuestionAttempt(db, questions, "01-intro", "questoes", "q1", "B");

    const all = listAttempts(db, "01-intro", "questoes");
    expect(all).toHaveLength(2);
    expect(all[0].selectedAnswer).toBe("A");
    expect(all[1].selectedAnswer).toBe("B");
  });
});

describe("processQuestionAttempt — validation", () => {
  it("throws when the questionId is unknown", () => {
    const questions = makeQuestions(1);

    expect(() =>
      processQuestionAttempt(db, questions, "01-intro", "questoes", "q99", "B"),
    ).toThrow();
  });

  it("throws when selectedAnswer is not among the question's options", () => {
    const questions = makeQuestions(1);

    expect(() =>
      processQuestionAttempt(db, questions, "01-intro", "questoes", "q1", "Z"),
    ).toThrow();
  });
});

describe("processQuestionAttempt — Question Resource Completion", () => {
  it("isComplete is false when not all questions have been attempted", () => {
    const questions = makeQuestions(3);
    const { isComplete } = processQuestionAttempt(
      db,
      questions,
      "01-intro",
      "questoes",
      "q1",
      "B",
    );

    expect(isComplete).toBe(false);
  });

  it("isComplete is true when the final unattempted question receives an attempt", () => {
    const questions = makeQuestions(2);
    processQuestionAttempt(db, questions, "01-intro", "questoes", "q1", "B");
    const { isComplete } = processQuestionAttempt(
      db,
      questions,
      "01-intro",
      "questoes",
      "q2",
      "A",
    );

    expect(isComplete).toBe(true);
  });

  it("marks resource progress as complete when the final question is submitted", () => {
    const questions = makeQuestions(1);
    processQuestionAttempt(db, questions, "01-intro", "questoes", "q1", "B");

    const progress = getProgress(db, "01-intro", "questoes");
    expect(progress?.completedAt).toBeDefined();
    expect(progress?.completedAt).not.toBeNull();
  });

  it("does not mark progress complete when questions remain", () => {
    const questions = makeQuestions(2);
    processQuestionAttempt(db, questions, "01-intro", "questoes", "q1", "B");

    const progress = getProgress(db, "01-intro", "questoes");
    // Either no row, or completedAt is null
    expect(progress?.completedAt ?? null).toBeNull();
  });

  it("isComplete is true on a re-attempt of the final question when all others already attempted", () => {
    const questions = makeQuestions(2);
    // Both already attempted
    processQuestionAttempt(db, questions, "01-intro", "questoes", "q1", "B");
    processQuestionAttempt(db, questions, "01-intro", "questoes", "q2", "B");
    // Re-attempt q1 — all still covered
    const { isComplete } = processQuestionAttempt(
      db,
      questions,
      "01-intro",
      "questoes",
      "q1",
      "A",
    );

    expect(isComplete).toBe(true);
  });

  it("does not clear completedAt when re-attempting after completion", () => {
    const questions = makeQuestions(1);
    // First attempt completes the resource
    processQuestionAttempt(db, questions, "01-intro", "questoes", "q1", "B");
    const progress1 = getProgress(db, "01-intro", "questoes");
    expect(progress1?.completedAt).not.toBeNull();

    // Re-attempt — completedAt must stay non-null
    processQuestionAttempt(db, questions, "01-intro", "questoes", "q1", "A");
    const progress2 = getProgress(db, "01-intro", "questoes");
    expect(progress2?.completedAt).not.toBeNull();
  });
});
