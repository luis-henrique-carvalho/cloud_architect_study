import type { ParsedQuestion } from "./parser";
import type { QuestionAttempt } from "@/modules/learner-state/attempts/attempts";

export type QuestionState = {
  questionId: string;
  ordinal: number;
  latestSelectedAnswer: string | null;
  isCorrect: boolean | null;
  hasBeenIncorrect: boolean;
  isAttempted: boolean;
};

export type ResourceCounts = {
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  remaining: number;
};

export type ResourceState = {
  questions: QuestionState[];
  counts: ResourceCounts;
  isComplete: boolean;
};

export function deriveResourceState(
  questions: ParsedQuestion[],
  attempts: QuestionAttempt[],
): ResourceState {
  // Group attempts by questionId, preserving insertion order (earliest first).
  const attemptsByQuestion = new Map<string, QuestionAttempt[]>();
  for (const attempt of attempts) {
    const list = attemptsByQuestion.get(attempt.questionId) ?? [];
    list.push(attempt);
    attemptsByQuestion.set(attempt.questionId, list);
  }

  const questionStates: QuestionState[] = questions.map((q) => {
    const questionAttempts = attemptsByQuestion.get(q.id) ?? [];

    if (questionAttempts.length === 0) {
      return {
        questionId: q.id,
        ordinal: q.ordinal,
        latestSelectedAnswer: null,
        isCorrect: null,
        hasBeenIncorrect: false,
        isAttempted: false,
      };
    }

    const latest = questionAttempts[questionAttempts.length - 1];
    const hasBeenIncorrect = questionAttempts.some((a) => !a.isCorrect);

    return {
      questionId: q.id,
      ordinal: q.ordinal,
      latestSelectedAnswer: latest.selectedAnswer,
      isCorrect: latest.isCorrect,
      hasBeenIncorrect,
      isAttempted: true,
    };
  });

  const attempted = questionStates.filter((q) => q.isAttempted).length;
  const correct = questionStates.filter(
    (q) => q.isAttempted && q.isCorrect === true,
  ).length;
  const incorrect = questionStates.filter(
    (q) => q.isAttempted && q.isCorrect === false,
  ).length;
  const total = questions.length;
  const remaining = total - attempted;

  const isComplete = total > 0 && remaining === 0;

  return {
    questions: questionStates,
    counts: { total, attempted, correct, incorrect, remaining },
    isComplete,
  };
}
