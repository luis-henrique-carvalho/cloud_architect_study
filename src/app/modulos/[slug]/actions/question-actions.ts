"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle/db";
import { getStudyResourceContent } from "@/lib/content";
import { parsePracticeQuestions } from "@/modules/practice-questions/parser";
import { processQuestionAttempt } from "@/modules/practice-questions/submit-answer";

export async function submitAnswer(
  moduleSlug: string,
  resourceKey: string,
  questionId: string,
  selectedAnswer: string,
): Promise<void> {
  const content = await getStudyResourceContent(moduleSlug, resourceKey);
  if (!content) {
    throw new Error(`Resource content not found: ${moduleSlug}/${resourceKey}`);
  }

  const parsed = parsePracticeQuestions(content.markdown);
  if (parsed.type !== "success") {
    throw new Error(
      `Resource is not parseable as practice questions: ${parsed.reason}`,
    );
  }

  processQuestionAttempt(
    db,
    parsed.questions,
    moduleSlug,
    resourceKey,
    questionId,
    selectedAnswer,
  );

  revalidatePath(`/modulos/${moduleSlug}`);
}
