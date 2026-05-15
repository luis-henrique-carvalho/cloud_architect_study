import { describe, it, expect } from "vitest";
import { deriveResourceState } from "./resource-state";
import type { ParsedQuestion } from "./parser";
import type { QuestionAttempt } from "@/modules/learner-state/attempts/attempts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeQuestion(ordinal: number): ParsedQuestion {
  return {
    id: `q${ordinal}`,
    ordinal,
    prompt: `Prompt ${ordinal}`,
    options: [
      { key: "A", text: "Opcao A" },
      { key: "B", text: "Opcao B" },
      { key: "C", text: "Opcao C" },
      { key: "D", text: "Opcao D" },
    ],
    correctAnswer: "B",
    explanation: "Explicacao.",
  };
}

let nextId = 1;
function makeAttempt(
  questionId: string,
  selectedAnswer: string,
  correctAnswer = "B",
): QuestionAttempt {
  const isCorrect = selectedAnswer === correctAnswer;
  return {
    id: nextId++,
    moduleSlug: "01-intro",
    resourceKey: "questoes",
    questionId,
    selectedAnswer,
    correctAnswer,
    isCorrect,
    createdAt: Date.now(),
  };
}

const QUESTIONS = [makeQuestion(1), makeQuestion(2), makeQuestion(3)];

// ---------------------------------------------------------------------------
// No attempts
// ---------------------------------------------------------------------------

describe("deriveResourceState — no attempts", () => {
  it("returns every question as unattempted", () => {
    const state = deriveResourceState(QUESTIONS, []);

    expect(state.questions).toHaveLength(3);
    state.questions.forEach((q) => {
      expect(q.isAttempted).toBe(false);
      expect(q.latestSelectedAnswer).toBeNull();
      expect(q.isCorrect).toBeNull();
      expect(q.hasBeenIncorrect).toBe(false);
    });
  });

  it("counts are all zero except total and remaining", () => {
    const state = deriveResourceState(QUESTIONS, []);

    expect(state.counts.total).toBe(3);
    expect(state.counts.attempted).toBe(0);
    expect(state.counts.correct).toBe(0);
    expect(state.counts.incorrect).toBe(0);
    expect(state.counts.remaining).toBe(3);
  });

  it("isComplete is false with no attempts", () => {
    const state = deriveResourceState(QUESTIONS, []);
    expect(state.isComplete).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Partial attempts
// ---------------------------------------------------------------------------

describe("deriveResourceState — partial attempts", () => {
  it("marks attempted questions correctly", () => {
    const attempts = [makeAttempt("q1", "B")]; // correct

    const state = deriveResourceState(QUESTIONS, attempts);

    const q1 = state.questions.find((q) => q.questionId === "q1")!;
    const q2 = state.questions.find((q) => q.questionId === "q2")!;

    expect(q1.isAttempted).toBe(true);
    expect(q1.isCorrect).toBe(true);
    expect(q1.latestSelectedAnswer).toBe("B");

    expect(q2.isAttempted).toBe(false);
    expect(q2.isCorrect).toBeNull();
  });

  it("counts reflect partial state accurately", () => {
    const attempts = [
      makeAttempt("q1", "B"), // correct
      makeAttempt("q2", "A"), // incorrect
    ];

    const state = deriveResourceState(QUESTIONS, attempts);

    expect(state.counts.attempted).toBe(2);
    expect(state.counts.correct).toBe(1);
    expect(state.counts.incorrect).toBe(1);
    expect(state.counts.remaining).toBe(1);
  });

  it("isComplete is false when at least one question has no attempt", () => {
    const attempts = [makeAttempt("q1", "B"), makeAttempt("q2", "B")];
    const state = deriveResourceState(QUESTIONS, attempts);
    expect(state.isComplete).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// All attempted
// ---------------------------------------------------------------------------

describe("deriveResourceState — all attempted", () => {
  it("isComplete is true when every question has at least one attempt", () => {
    const attempts = [
      makeAttempt("q1", "B"),
      makeAttempt("q2", "A"), // incorrect but still attempted
      makeAttempt("q3", "B"),
    ];

    const state = deriveResourceState(QUESTIONS, attempts);
    expect(state.isComplete).toBe(true);
  });

  it("correctness and completion are separate: complete even with incorrect answers", () => {
    const attempts = [
      makeAttempt("q1", "A"), // incorrect
      makeAttempt("q2", "A"), // incorrect
      makeAttempt("q3", "A"), // incorrect
    ];

    const state = deriveResourceState(QUESTIONS, attempts);
    expect(state.isComplete).toBe(true);
    expect(state.counts.correct).toBe(0);
    expect(state.counts.incorrect).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Latest attempt wins — Current Question State
// ---------------------------------------------------------------------------

describe("deriveResourceState — Current Question State", () => {
  it("a later Correct Answer after Incorrect Answer makes current state correct", () => {
    const attempts = [
      makeAttempt("q1", "A"), // incorrect
      makeAttempt("q1", "B"), // correct — corrected mistake
    ];

    const state = deriveResourceState(QUESTIONS, attempts);
    const q1 = state.questions.find((q) => q.questionId === "q1")!;

    expect(q1.isCorrect).toBe(true);
    expect(q1.latestSelectedAnswer).toBe("B");
    expect(q1.hasBeenIncorrect).toBe(true); // history preserved
  });

  it("a later Incorrect Answer after a Correct Answer makes current state incorrect", () => {
    const attempts = [
      makeAttempt("q1", "B"), // correct
      makeAttempt("q1", "A"), // now incorrect
    ];

    const state = deriveResourceState(QUESTIONS, attempts);
    const q1 = state.questions.find((q) => q.questionId === "q1")!;

    expect(q1.isCorrect).toBe(false);
    expect(q1.latestSelectedAnswer).toBe("A");
  });

  it("latest selected answer reflects the most recent attempt", () => {
    const attempts = [
      makeAttempt("q1", "A"),
      makeAttempt("q1", "C"),
      makeAttempt("q1", "B"),
    ];

    const state = deriveResourceState(QUESTIONS, attempts);
    expect(
      state.questions.find((q) => q.questionId === "q1")?.latestSelectedAnswer,
    ).toBe("B");
  });

  it("hasBeenIncorrect is false when all attempts were correct", () => {
    const attempts = [makeAttempt("q1", "B"), makeAttempt("q1", "B")];

    const state = deriveResourceState(QUESTIONS, attempts);
    expect(
      state.questions.find((q) => q.questionId === "q1")?.hasBeenIncorrect,
    ).toBe(false);
  });

  it("counts reflect Current Question State, not attempt history", () => {
    const attempts = [
      makeAttempt("q1", "A"), // incorrect
      makeAttempt("q1", "B"), // corrected — current state is correct
      makeAttempt("q2", "B"), // correct
      makeAttempt("q2", "A"), // current state is now incorrect
    ];

    const state = deriveResourceState(QUESTIONS, attempts);

    // q1 current: correct; q2 current: incorrect; q3: unattempted
    expect(state.counts.correct).toBe(1);
    expect(state.counts.incorrect).toBe(1);
    expect(state.counts.remaining).toBe(1);
  });
});
