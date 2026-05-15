"use client";

import { Button } from "@/components/ui/button";
import type { ResourceProgress } from "@/modules/learner-state";
import { markReviewedAction } from "../actions/history-actions";

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function HistoryPanel({
  moduleSlug,
  resourceKey,
  progress,
}: {
  moduleSlug: string;
  resourceKey: string;
  progress: ResourceProgress | null;
}) {
  const isCompleted = progress?.completedAt != null;

  if (!isCompleted) {
    return (
      <p className="text-sm text-muted-foreground">
        Este recurso ainda não foi concluído. Marque-o como concluído para
        registrar o histórico.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Concluído em
          </dt>
          <dd>{formatDate(progress!.completedAt!)}</dd>
        </div>

        {progress?.lastReviewedAt != null && (
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Última revisão
            </dt>
            <dd>{formatDate(progress.lastReviewedAt)}</dd>
          </div>
        )}
      </dl>

      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => markReviewedAction(moduleSlug, resourceKey)}
      >
        Marcar como revisado
      </Button>
    </div>
  );
}
