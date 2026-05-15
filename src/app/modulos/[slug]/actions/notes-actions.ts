"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/drizzle/db";
import { upsertNote, deleteNote } from "@/modules/learner-state";

export async function saveNoteAction(
  moduleSlug: string,
  resourceKey: string,
  content: string,
): Promise<void> {
  upsertNote(db, moduleSlug, resourceKey, content);
  revalidatePath(`/modulos/${moduleSlug}`);
}

export async function deleteNoteAction(
  moduleSlug: string,
  resourceKey: string,
): Promise<void> {
  deleteNote(db, moduleSlug, resourceKey);
  revalidatePath(`/modulos/${moduleSlug}`);
}
