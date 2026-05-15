import { eq, and, desc, asc, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { questionAttempts } from "@/lib/drizzle/schema";
import type * as schema from "@/lib/drizzle/schema";

type Db = BetterSQLite3Database<typeof schema>;

export type QuestionAttempt = typeof questionAttempts.$inferSelect;

export function recordAttempt(
  db: Db,
  moduleSlug: string,
  resourceKey: string,
  questionId: string,
  selectedAnswer: string,
  correctAnswer: string,
): QuestionAttempt {
  const isCorrect = selectedAnswer === correctAnswer;
  const id = db
    .insert(questionAttempts)
    .values({
      moduleSlug,
      resourceKey,
      questionId,
      selectedAnswer,
      correctAnswer,
      isCorrect,
      createdAt: Date.now(),
    })
    .returning()
    .get();

  return id;
}

export function getLatestAttempt(
  db: Db,
  moduleSlug: string,
  resourceKey: string,
  questionId: string,
): QuestionAttempt | null {
  const row = db
    .select()
    .from(questionAttempts)
    .where(
      and(
        eq(questionAttempts.moduleSlug, moduleSlug),
        eq(questionAttempts.resourceKey, resourceKey),
        eq(questionAttempts.questionId, questionId),
      ),
    )
    .orderBy(desc(questionAttempts.id))
    .limit(1)
    .get();

  return row ?? null;
}

export function listAttempts(
  db: Db,
  moduleSlug: string,
  resourceKey: string,
): QuestionAttempt[] {
  return db
    .select()
    .from(questionAttempts)
    .where(
      and(
        eq(questionAttempts.moduleSlug, moduleSlug),
        eq(questionAttempts.resourceKey, resourceKey),
      ),
    )
    .orderBy(asc(questionAttempts.createdAt))
    .all();
}

/**
 * Returns the latest attempt per question where the current state is incorrect.
 * This is the feed for the Mistake Notebook.
 */
export function listIncorrectAttempts(db: Db): QuestionAttempt[] {
  // Get the id of the latest attempt per (moduleSlug, resourceKey, questionId)
  const latestIds = db
    .select({ id: sql<number>`MAX(${questionAttempts.id})` })
    .from(questionAttempts)
    .groupBy(
      questionAttempts.moduleSlug,
      questionAttempts.resourceKey,
      questionAttempts.questionId,
    )
    .all()
    .map((r) => r.id);

  if (latestIds.length === 0) return [];

  return db
    .select()
    .from(questionAttempts)
    .where(
      and(
        sql`${questionAttempts.id} IN (${sql.join(
          latestIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
        eq(questionAttempts.isCorrect, false),
      ),
    )
    .all();
}

export function countMistakes(db: Db): number {
  const latestIds = db
    .select({ id: sql<number>`MAX(${questionAttempts.id})` })
    .from(questionAttempts)
    .groupBy(
      questionAttempts.moduleSlug,
      questionAttempts.resourceKey,
      questionAttempts.questionId,
    )
    .all()
    .map((r) => r.id);

  if (latestIds.length === 0) return 0;

  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(questionAttempts)
    .where(
      and(
        sql`${questionAttempts.id} IN (${sql.join(
          latestIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
        eq(questionAttempts.isCorrect, false),
      ),
    )
    .get();

  return result?.count ?? 0;
}
