import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "@/lib/drizzle/schema";
import {
  recordAttempt,
  listAttempts,
  upsertProgress,
} from "@/modules/learner-state";
import type { QuestionAttempt } from "@/modules/learner-state";
import { deriveResourceState } from "./resource-state";
import type { ParsedQuestion } from "./parser";

type Db = BetterSQLite3Database<typeof schema>;

export type AttemptResult = {
  attempt: QuestionAttempt;
  isComplete: boolean;
};

/**
 * Validates the submitted answer against the server-parsed questions, records
 * the Question Attempt, and marks the resource complete when all questions have
 * been attempted at least once.
 *
 * Throws if `questionId` is not found among `questions` or if `selectedAnswer`
 * is not among the question's option keys.
 */
export function processQuestionAttempt(
  db: Db,
  questions: ParsedQuestion[],
  moduleSlug: string,
  resourceKey: string,
  questionId: string,
  selectedAnswer: string,
): AttemptResult {
  const question = questions.find((q) => q.id === questionId);
  if (!question) {
    throw new Error(`Unknown question id: "${questionId}"`);
  }

  const validKeys = new Set(question.options.map((o) => o.key));
  if (!validKeys.has(selectedAnswer)) {
    throw new Error(
      `Invalid selected answer "${selectedAnswer}" for question "${questionId}"`,
    );
  }

  const attempt = recordAttempt(
    db,
    moduleSlug,
    resourceKey,
    questionId,
    selectedAnswer,
    question.correctAnswer,
  );

  // Derive completion: all parsed questions must have at least one attempt.
  const allAttempts = listAttempts(db, moduleSlug, resourceKey);
  const resourceState = deriveResourceState(questions, allAttempts);

  if (resourceState.isComplete) {
    upsertProgress(db, moduleSlug, resourceKey, { completedAt: Date.now() });
  }

  return { attempt, isComplete: resourceState.isComplete };
}
