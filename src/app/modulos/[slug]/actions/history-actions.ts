"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle/db";
import { upsertProgress } from "@/modules/learner-state";

export async function markReviewedAction(
  moduleSlug: string,
  resourceKey: string,
): Promise<void> {
  upsertProgress(db, moduleSlug, resourceKey, {
    lastReviewedAt: Date.now(),
  });
  revalidatePath(`/modulos/${moduleSlug}`);
}
