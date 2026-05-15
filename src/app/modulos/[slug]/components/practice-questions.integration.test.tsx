// @vitest-environment jsdom
/**
 * Integration tests for the Practice Questions flow (ticket 019).
 *
 * These tests verify learner-visible behaviour through the public component
 * interface — parsing → rendering → interaction → server action — without
 * asserting on CSS class names or private helpers.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PracticeQuestionsPanel } from "./practice-questions-panel";
import { parsePracticeQuestions } from "@/modules/practice-questions";
import type { ParsedQuestion } from "@/modules/practice-questions/parser";
import type { QuestionAttempt } from "@/modules/learner-state";

vi.mock("../actions/question-actions", () => ({
  submitAnswer: vi.fn().mockResolvedValue(undefined),
}));

import { submitAnswer } from "../actions/question-actions";

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Fixture: minimal well-formed questoes Markdown
// ---------------------------------------------------------------------------

const VALID_QUESTOES_MARKDOWN = `
## Questão 1

Qual serviço AWS é usado para armazenamento de objetos?

A) EC2
B) S3
C) RDS
D) Lambda

<details>
<summary><strong>Ver resposta</strong></summary>

**Resposta correta:** B

**Explicação:** O S3 é o Amazon Simple Storage Service.

</details>

## Questão 2

Qual serviço executa código sem provisionar servidores?

A) EC2
B) ECS
C) Lambda
D) Fargate

<details>
<summary><strong>Ver resposta</strong></summary>

**Resposta correta:** C

**Explicação:** Lambda é o serviço de computação serverless.

</details>
`;

const MALFORMED_QUESTOES_MARKDOWN = `
Este arquivo não contém questões no formato esperado.

Apenas texto livre aqui.
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseOrThrow(markdown: string): ParsedQuestion[] {
  const result = parsePracticeQuestions(markdown);
  if (result.type !== "success") throw new Error(result.reason);
  return result.questions;
}

function makeAttempt(
  overrides: Partial<QuestionAttempt> & {
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
  },
  id = 1,
): QuestionAttempt {
  return {
    id,
    moduleSlug: "01-intro",
    resourceKey: "questoes",
    isCorrect: overrides.selectedAnswer === overrides.correctAnswer,
    createdAt: Date.now(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Integration test 1: parseable questoes renders interactive Practice Questions
// ---------------------------------------------------------------------------

describe("parseable questoes content", () => {
  it("renders all questions as interactive cards", () => {
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[]}
      />,
    );
    expect(screen.getByText(/armazenamento de objetos/i)).toBeInTheDocument();
    expect(screen.getByText(/sem provisionar servidores/i)).toBeInTheDocument();
  });

  it("renders radio button options for each question", () => {
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[]}
      />,
    );
    // Each question has 4 options
    expect(screen.getAllByRole("radio")).toHaveLength(8);
  });

  it("shows summary with correct total before any attempts", () => {
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[]}
      />,
    );
    expect(screen.getByText(/2 questões/i)).toBeInTheDocument();
    expect(screen.getByText(/0 respondidas/i)).toBeInTheDocument();
    expect(screen.getByText(/2 restantes/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Integration test 2: malformed questoes falls back to Markdown rendering
// ---------------------------------------------------------------------------

describe("malformed questoes content", () => {
  it("parsePracticeQuestions returns failure when a question block lacks a <details> block", () => {
    const noDetails = `
## Questão 1

Qual serviço é usado para armazenamento?

A) EC2
B) S3
`;
    const result = parsePracticeQuestions(noDetails);
    expect(result.type).toBe("unparseable");
  });

  it("parsePracticeQuestions returns success with empty questions for text without any ## headings", () => {
    const result = parsePracticeQuestions(MALFORMED_QUESTOES_MARKDOWN);
    expect(result.type).toBe("success");
    if (result.type === "success") expect(result.questions).toHaveLength(0);
  });

  it("empty questions list renders without crashing", () => {
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={[]}
        initialAttempts={[]}
      />,
    );
    // With 0 questions there are no radio inputs — verifies no crash
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Integration test 3: selecting and submitting records a Question Attempt
// ---------------------------------------------------------------------------

describe("answer submission flow", () => {
  it("calls submitAnswer with the learner's selected option", async () => {
    const user = userEvent.setup();
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[]}
      />,
    );

    await user.click(screen.getAllByRole("radio", { name: /B\) S3/i })[0]);
    await user.click(screen.getAllByRole("button", { name: /confirmar/i })[0]);

    await waitFor(() =>
      expect(submitAnswer).toHaveBeenCalledWith(
        "01-intro",
        "questoes",
        questions[0].id,
        "B",
      ),
    );
  });

  it("shows feedback immediately after submission", async () => {
    const user = userEvent.setup();
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[]}
      />,
    );

    await user.click(screen.getAllByRole("radio", { name: /B\) S3/i })[0]);
    await user.click(screen.getAllByRole("button", { name: /confirmar/i })[0]);

    expect(await screen.findByText(/resposta correta!/i)).toBeInTheDocument();
    expect(screen.getByText(/a resposta correta é/i)).toBeInTheDocument();
    expect(
      screen.getByText(/S3 é o Amazon Simple Storage Service/i),
    ).toBeInTheDocument();
  });

  it("disables the confirmed question's Confirmar button after submission", async () => {
    const user = userEvent.setup();
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[]}
      />,
    );

    await user.click(screen.getAllByRole("radio", { name: /B\) S3/i })[0]);
    const confirmButtons = screen.getAllByRole("button", {
      name: /confirmar/i,
    });
    await user.click(confirmButtons[0]);

    // Q1's button is disabled; Q2's is still available
    expect(
      screen.getAllByRole("button", { name: /confirmar/i })[0],
    ).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Integration test 4: feedback persists after rerender with stored attempts
// ---------------------------------------------------------------------------

describe("feedback persistence", () => {
  it("shows correct feedback when rerendered with a stored correct attempt", () => {
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    const attempt = makeAttempt({
      questionId: questions[0].id,
      selectedAnswer: "B",
      correctAnswer: questions[0].correctAnswer,
    });
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[attempt]}
      />,
    );
    expect(screen.getByText(/resposta correta!/i)).toBeInTheDocument();
    expect(screen.getByText(/a resposta correta é/i)).toBeInTheDocument();
  });

  it("shows incorrect feedback when rerendered with a stored incorrect attempt", () => {
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    const attempt = makeAttempt({
      questionId: questions[0].id,
      selectedAnswer: "A",
      correctAnswer: questions[0].correctAnswer,
    });
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[attempt]}
      />,
    );
    expect(screen.getByText(/resposta incorreta/i)).toBeInTheDocument();
    expect(screen.getByText(/a resposta correta é/i)).toBeInTheDocument();
  });

  it("renders explanation when rerendered with any stored attempt", () => {
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    const attempt = makeAttempt({
      questionId: questions[0].id,
      selectedAnswer: "B",
      correctAnswer: questions[0].correctAnswer,
    });
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[attempt]}
      />,
    );
    expect(
      screen.getByText(/S3 é o Amazon Simple Storage Service/i),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Integration test 5: another attempt can be recorded for the same question
// ---------------------------------------------------------------------------

describe("retry flow", () => {
  it("'Tentar novamente' is available after a stored attempt", () => {
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    const attempt = makeAttempt({
      questionId: questions[0].id,
      selectedAnswer: "A",
      correctAnswer: questions[0].correctAnswer,
    });
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[attempt]}
      />,
    );
    expect(
      screen.getByRole("button", { name: /tentar novamente/i }),
    ).toBeInTheDocument();
  });

  it("submits a new answer after 'Tentar novamente'", async () => {
    const user = userEvent.setup();
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    const attempt = makeAttempt({
      questionId: questions[0].id,
      selectedAnswer: "A",
      correctAnswer: questions[0].correctAnswer,
    });
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[attempt]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));
    await user.click(screen.getAllByRole("radio", { name: /B\) S3/i })[0]);
    await user.click(screen.getAllByRole("button", { name: /confirmar/i })[0]);

    await waitFor(() =>
      expect(submitAnswer).toHaveBeenCalledWith(
        "01-intro",
        "questoes",
        questions[0].id,
        "B",
      ),
    );
  });

  it("explanation and correct answer remain visible during retry", async () => {
    const user = userEvent.setup();
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    const attempt = makeAttempt({
      questionId: questions[0].id,
      selectedAnswer: "A",
      correctAnswer: questions[0].correctAnswer,
    });
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[attempt]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));

    expect(
      screen.getByText(/S3 é o Amazon Simple Storage Service/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/a resposta correta é/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Integration test 6: final unattempted question marks questoes complete
// ---------------------------------------------------------------------------

describe("Question Resource Completion", () => {
  it("calls submitAnswer for the final unattempted question", async () => {
    const user = userEvent.setup();
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    // Q1 already attempted
    const q1Attempt = makeAttempt({
      questionId: questions[0].id,
      selectedAnswer: "B",
      correctAnswer: questions[0].correctAnswer,
    });
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={[q1Attempt]}
      />,
    );

    // Answer the remaining question (Q2)
    await user.click(screen.getByRole("radio", { name: /C\) Lambda/i }));
    await user.click(
      // Q1's Confirmar is disabled; Q2's is at index 1
      screen.getAllByRole("button", { name: /confirmar/i })[1],
    );

    await waitFor(() =>
      expect(submitAnswer).toHaveBeenCalledWith(
        "01-intro",
        "questoes",
        questions[1].id,
        "C",
      ),
    );
  });

  it("summary shows 0 restantes after all questions are answered", () => {
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    const attempts: QuestionAttempt[] = questions.map((q, i) =>
      makeAttempt(
        {
          questionId: q.id,
          selectedAnswer: q.correctAnswer,
          correctAnswer: q.correctAnswer,
        },
        i + 1,
      ),
    );
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={attempts}
      />,
    );
    expect(screen.getByText(/0 restantes/i)).toBeInTheDocument();
  });

  it("a questoes resource with incorrect current states can still be complete", () => {
    const questions = parseOrThrow(VALID_QUESTOES_MARKDOWN);
    // All questions attempted but with incorrect answers
    const attempts: QuestionAttempt[] = questions.map((q, i) =>
      makeAttempt(
        {
          questionId: q.id,
          selectedAnswer: "A",
          correctAnswer: q.correctAnswer,
        },
        i + 1,
      ),
    );
    render(
      <PracticeQuestionsPanel
        moduleSlug="01-intro"
        resourceKey="questoes"
        questions={questions}
        initialAttempts={attempts}
      />,
    );
    // All attempted → 0 remaining even though all incorrect
    expect(screen.getByText(/0 restantes/i)).toBeInTheDocument();
    // Summary shows 2 incorrect
    expect(screen.getByText(/2 incorretas/i)).toBeInTheDocument();
  });
});
