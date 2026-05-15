"use client";

import { useState, useTransition } from "react";
import { submitAnswer } from "../actions/question-actions";
import type { ParsedQuestion } from "@/modules/practice-questions/parser";
import type { QuestionAttempt } from "@/modules/learner-state";
import { MarkdownRenderer } from "@/lib/markdown";

type QuestionStatus = {
  /** The currently highlighted radio selection. */
  selectedAnswer: string | null;
  /** The answer that was last confirmed (null if not yet submitted). */
  lastSubmittedAnswer: string | null;
  /** Correctness of the last confirmed answer, or null before first submit. */
  isCorrect: boolean | null;
  /** True once the learner has submitted at least one answer; never cleared. */
  hasAttempted: boolean;
};

function buildInitialStatuses(
  questions: ParsedQuestion[],
  initialAttempts: QuestionAttempt[],
): Map<string, QuestionStatus> {
  // Keep only the latest attempt per question (preserving insertion order)
  const latestByQuestion = new Map<string, QuestionAttempt>();
  for (const attempt of initialAttempts) {
    latestByQuestion.set(attempt.questionId, attempt);
  }

  const map = new Map<string, QuestionStatus>();
  for (const q of questions) {
    const attempt = latestByQuestion.get(q.id);
    map.set(q.id, {
      selectedAnswer: attempt?.selectedAnswer ?? null,
      lastSubmittedAnswer: attempt?.selectedAnswer ?? null,
      isCorrect: attempt?.isCorrect ?? null,
      hasAttempted: attempt != null,
    });
  }
  return map;
}

type Props = {
  moduleSlug: string;
  resourceKey: string;
  questions: ParsedQuestion[];
  initialAttempts: QuestionAttempt[];
};

export function PracticeQuestionsPanel({
  moduleSlug,
  resourceKey,
  questions,
  initialAttempts,
}: Props) {
  const [statuses, setStatuses] = useState<Map<string, QuestionStatus>>(() =>
    buildInitialStatuses(questions, initialAttempts),
  );
  const [, startTransition] = useTransition();

  function handleSelect(questionId: string, answer: string) {
    setStatuses((prev) => {
      const next = new Map(prev);
      const current = next.get(questionId)!;
      next.set(questionId, { ...current, selectedAnswer: answer });
      return next;
    });
  }

  function handleSubmit(question: ParsedQuestion) {
    const status = statuses.get(question.id);
    const selected = status?.selectedAnswer;
    if (!selected || status.lastSubmittedAnswer != null) return;

    const isCorrect = selected === question.correctAnswer;

    // Optimistic update: show feedback immediately
    setStatuses((prev) => {
      const next = new Map(prev);
      next.set(question.id, {
        selectedAnswer: selected,
        lastSubmittedAnswer: selected,
        isCorrect,
        hasAttempted: true,
      });
      return next;
    });

    // Persist to server
    startTransition(async () => {
      await submitAnswer(moduleSlug, resourceKey, question.id, selected);
    });
  }

  function handleRetry(questionId: string) {
    setStatuses((prev) => {
      const next = new Map(prev);
      const current = next.get(questionId)!;
      next.set(questionId, {
        ...current,
        selectedAnswer: null,
        lastSubmittedAnswer: null,
      });
      return next;
    });
  }

  if (questions.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhuma questão disponível para este recurso.
      </p>
    );
  }

  // Derive summary counts from client state
  let attempted = 0;
  let correct = 0;
  let incorrect = 0;
  for (const status of statuses.values()) {
    if (status.hasAttempted) {
      attempted++;
      if (status.isCorrect === true) correct++;
      else if (status.isCorrect === false) incorrect++;
    }
  }
  const total = questions.length;
  const remaining = total - attempted;

  return (
    <div className="flex flex-col gap-8">
      <div
        className="flex flex-wrap gap-4 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
        aria-label="Resumo das questões"
      >
        <span>{total} questões</span>
        <span>{attempted} respondidas</span>
        <span>{remaining} restantes</span>
        <span>{correct} corretas</span>
        <span>{incorrect} incorretas</span>
      </div>

      {questions.map((question) => {
        const status = statuses.get(question.id)!;
        const isAnswered = status.lastSubmittedAnswer != null;

        return (
          <div
            key={question.id}
            className="flex flex-col gap-4 rounded-lg border p-6"
          >
            <p className="font-medium">
              {question.ordinal}. {question.prompt}
            </p>

            <fieldset>
              <legend className="sr-only">
                Opções para a questão {question.ordinal}
              </legend>
              <div className="flex flex-col gap-2">
                {question.options.map((option) => (
                  <label
                    key={option.key}
                    className="flex cursor-pointer items-start gap-3"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.key}
                      checked={status.selectedAnswer === option.key}
                      onChange={() => handleSelect(question.id, option.key)}
                      disabled={isAnswered}
                    />
                    <span>
                      {option.key}) {option.text}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              onClick={() => handleSubmit(question)}
              disabled={!status.selectedAnswer || isAnswered}
              className="w-fit rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Confirmar
            </button>

            {status.isCorrect === true && (
              <p className="text-sm font-medium text-green-600">
                Resposta correta!
              </p>
            )}
            {status.isCorrect === false && (
              <p className="text-sm font-medium text-red-600">
                Resposta incorreta.
              </p>
            )}

            {status.hasAttempted && (
              <p className="text-sm">
                A resposta correta é <strong>{question.correctAnswer}</strong>.
              </p>
            )}

            {status.hasAttempted && question.explanation && (
              <div className="rounded-md border bg-muted/40 px-4 py-3">
                <MarkdownRenderer
                  content={question.explanation}
                  moduleSlug={moduleSlug}
                />
              </div>
            )}

            {isAnswered && (
              <button
                onClick={() => handleRetry(question.id)}
                className="w-fit rounded-md border px-4 py-2 text-sm font-medium transition-colors"
              >
                Tentar novamente
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
