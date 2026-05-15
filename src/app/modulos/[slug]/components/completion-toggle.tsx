"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toggleCompletion } from "../actions/completion-actions";

const SELF_COMPLETING_KEYS = new Set(["questoes"]);

export function CompletionToggle({
  moduleSlug,
  resourceKey,
  completedAt,
}: {
  moduleSlug: string;
  resourceKey: string;
  completedAt: number | null;
}) {
  if (SELF_COMPLETING_KEYS.has(resourceKey)) {
    return null;
  }

  const isComplete = completedAt != null;

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="completion-toggle"
        checked={isComplete}
        aria-label="Concluído"
        onCheckedChange={(checked) => {
          toggleCompletion(moduleSlug, resourceKey, checked === true);
        }}
      />
      <Label htmlFor="completion-toggle" className="text-sm cursor-pointer">
        Concluído
      </Label>
    </div>
  );
}
