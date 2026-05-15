"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle/db";
import { upsertProgress } from "@/modules/learner-state";

export async function toggleCompletion(
  moduleSlug: string,
  resourceKey: string,
  markComplete: boolean,
): Promise<void> {
  upsertProgress(db, moduleSlug, resourceKey, {
    completedAt: markComplete ? Date.now() : null,
  });
  revalidatePath(`/modulos/${moduleSlug}`);
}
