"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { StudyNote } from "@/modules/learner-state";
import { saveNoteAction, deleteNoteAction } from "../actions/notes-actions";

export function NotesEditor({
  moduleSlug,
  resourceKey,
  initialNote,
}: {
  moduleSlug: string;
  resourceKey: string;
  initialNote: StudyNote | null;
}) {
  const [content, setContent] = useState(initialNote?.content ?? "");
  const hasNote = initialNote != null;
  const isEmpty = content.trim().length === 0;

  async function handleSave() {
    await saveNoteAction(moduleSlug, resourceKey, content);
  }

  async function handleDelete() {
    await deleteNoteAction(moduleSlug, resourceKey);
    setContent("");
  }

  return (
    <div className="flex flex-col gap-4">
      {!hasNote && isEmpty && (
        <p className="text-sm text-muted-foreground">
          Ainda não há notas para este recurso. Comece a escrever abaixo.
        </p>
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escreva suas anotações aqui..."
        rows={8}
      />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {content.length} caracteres
        </span>
        <div className="flex gap-2">
          {hasNote && (
            <Button variant="outline" size="sm" onClick={handleDelete}>
              Excluir
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={isEmpty}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
