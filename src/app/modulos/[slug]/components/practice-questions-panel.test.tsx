// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PracticeQuestionsPanel } from "./practice-questions-panel";
import type { ParsedQuestion } from "@/modules/practice-questions/parser";
import type { QuestionAttempt } from "@/modules/learner-state";

vi.mock("../actions/question-actions", () => ({
  submitAnswer: vi.fn().mockResolvedValue(undefined),
}));

import { submitAnswer } from "../actions/question-actions";

beforeEach(() => {
  vi.clearAllMocks();
});

const Q1: ParsedQuestion = {
  id: "q1",
  ordinal: 1,
  prompt: "Which service is used for object storage in AWS?",
  options: [
    { key: "A", text: "EC2" },
    { key: "B", text: "S3" },
    { key: "C", text: "RDS" },
    { key: "D", text: "Lambda" },
  ],
  correctAnswer: "B",
  explanation: "S3 is Amazon Simple Storage Service.",
};

const Q2: ParsedQuestion = {
  id: "q2",
  ordinal: 2,
  prompt: "Which service runs code without provisioning servers?",
  options: [
    { key: "A", text: "EC2" },
    { key: "B", text: "ECS" },
    { key: "C", text: "Lambda" },
    { key: "D", text: "Fargate" },
  ],
  correctAnswer: "C",
  explanation: "Lambda is the serverless compute service.",
};

describe("PracticeQuestionsPanel", () => {
  describe("option rendering", () => {
    it("renders all option radio buttons for a question", () => {
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      expect(
        screen.getByRole("radio", { name: /A\) EC2/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: /B\) S3/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: /C\) RDS/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: /D\) Lambda/i }),
      ).toBeInTheDocument();
    });

    it("renders all questions when multiple are provided", () => {
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1, Q2]}
          initialAttempts={[]}
        />,
      );
      expect(
        screen.getByText(/which service is used for object storage/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/which service runs code without provisioning/i),
      ).toBeInTheDocument();
    });
  });

  describe("submit button", () => {
    it("is disabled before any option is selected", () => {
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      expect(screen.getByRole("button", { name: /confirmar/i })).toBeDisabled();
    });

    it("becomes enabled after selecting an option", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      await user.click(screen.getByRole("radio", { name: /B\) S3/i }));
      expect(screen.getByRole("button", { name: /confirmar/i })).toBeEnabled();
    });
  });

  describe("submitting an answer", () => {
    it("calls submitAnswer with the correct arguments on confirm", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      await user.click(screen.getByRole("radio", { name: /B\) S3/i }));
      await user.click(screen.getByRole("button", { name: /confirmar/i }));
      await waitFor(() =>
        expect(submitAnswer).toHaveBeenCalledWith(
          "06-s3",
          "questoes",
          "q1",
          "B",
        ),
      );
    });

    it("shows correct feedback after submitting the right answer", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      await user.click(screen.getByRole("radio", { name: /B\) S3/i }));
      await user.click(screen.getByRole("button", { name: /confirmar/i }));
      expect(await screen.findByText(/resposta correta!/i)).toBeInTheDocument();
    });

    it("shows incorrect feedback after submitting the wrong answer", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      await user.click(screen.getByRole("radio", { name: /A\) EC2/i }));
      await user.click(screen.getByRole("button", { name: /confirmar/i }));
      expect(
        await screen.findByText(/resposta incorreta/i),
      ).toBeInTheDocument();
    });

    it("disables the submit button after answer is confirmed", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      await user.click(screen.getByRole("radio", { name: /B\) S3/i }));
      await user.click(screen.getByRole("button", { name: /confirmar/i }));
      expect(screen.getByRole("button", { name: /confirmar/i })).toBeDisabled();
    });
  });

  describe("initial state from existing attempts", () => {
    const correctAttempt: QuestionAttempt = {
      id: 1,
      moduleSlug: "06-s3",
      resourceKey: "questoes",
      questionId: "q1",
      selectedAnswer: "B",
      correctAnswer: "B",
      isCorrect: true,
      createdAt: 1_700_000_000_000,
    };

    const incorrectAttempt: QuestionAttempt = {
      id: 2,
      moduleSlug: "06-s3",
      resourceKey: "questoes",
      questionId: "q1",
      selectedAnswer: "A",
      correctAnswer: "B",
      isCorrect: false,
      createdAt: 1_700_000_001_000,
    };

    it("shows correct feedback for a question already answered correctly", () => {
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[correctAttempt]}
        />,
      );
      expect(screen.getByText(/resposta correta!/i)).toBeInTheDocument();
    });

    it("shows incorrect feedback for a question with an incorrect latest attempt", () => {
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[incorrectAttempt]}
        />,
      );
      expect(screen.getByText(/resposta incorreta/i)).toBeInTheDocument();
    });

    it("uses the latest attempt when multiple attempts exist for a question", () => {
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          // second attempt (incorrect) is latest
          initialAttempts={[correctAttempt, incorrectAttempt]}
        />,
      );
      expect(screen.getByText(/resposta incorreta/i)).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows an empty state message when there are no questions", () => {
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[]}
          initialAttempts={[]}
        />,
      );
      expect(screen.getByText(/nenhuma questão/i)).toBeInTheDocument();
    });
  });

  describe("feedback detail", () => {
    it("does not show explanation before any attempt", () => {
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      expect(
        screen.queryByText(/S3 is Amazon Simple Storage Service/i),
      ).toBeNull();
    });

    it("shows explanation after submitting an answer", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      await user.click(screen.getByRole("radio", { name: /B\) S3/i }));
      await user.click(screen.getByRole("button", { name: /confirmar/i }));
      expect(
        await screen.findByText(/S3 is Amazon Simple Storage Service/i),
      ).toBeInTheDocument();
    });

    it("shows explanation when loaded with an existing attempt", () => {
      const attempt: QuestionAttempt = {
        id: 1,
        moduleSlug: "06-s3",
        resourceKey: "questoes",
        questionId: "q1",
        selectedAnswer: "B",
        correctAnswer: "B",
        isCorrect: true,
        createdAt: 1_700_000_000_000,
      };
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[attempt]}
        />,
      );
      expect(
        screen.getByText(/S3 is Amazon Simple Storage Service/i),
      ).toBeInTheDocument();
    });

    it("shows the correct answer after a correct submission", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      await user.click(screen.getByRole("radio", { name: /B\) S3/i }));
      await user.click(screen.getByRole("button", { name: /confirmar/i }));
      expect(
        await screen.findByText(/a resposta correta é/i),
      ).toBeInTheDocument();
    });

    it("shows the correct answer after an incorrect submission", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      await user.click(screen.getByRole("radio", { name: /A\) EC2/i }));
      await user.click(screen.getByRole("button", { name: /confirmar/i }));
      expect(
        await screen.findByText(/a resposta correta é/i),
      ).toBeInTheDocument();
    });

    it("does not show correct answer before any attempt", () => {
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      expect(screen.queryByText(/a resposta correta é/i)).toBeNull();
    });
  });

  describe("retry", () => {
    const answeredAttempt: QuestionAttempt = {
      id: 1,
      moduleSlug: "06-s3",
      resourceKey: "questoes",
      questionId: "q1",
      selectedAnswer: "B",
      correctAnswer: "B",
      isCorrect: true,
      createdAt: 1_700_000_000_000,
    };

    it("shows 'Tentar novamente' button after submitting", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[]}
        />,
      );
      await user.click(screen.getByRole("radio", { name: /B\) S3/i }));
      await user.click(screen.getByRole("button", { name: /confirmar/i }));
      expect(
        screen.getByRole("button", { name: /tentar novamente/i }),
      ).toBeInTheDocument();
    });

    it("shows 'Tentar novamente' button when loaded with an existing attempt", () => {
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[answeredAttempt]}
        />,
      );
      expect(
        screen.getByRole("button", { name: /tentar novamente/i }),
      ).toBeInTheDocument();
    });

    it("re-enables radio buttons after clicking 'Tentar novamente'", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[answeredAttempt]}
        />,
      );
      await user.click(
        screen.getByRole("button", { name: /tentar novamente/i }),
      );
      expect(
        screen.getByRole("radio", { name: /A\) EC2/i }),
      ).not.toBeDisabled();
    });

    it("retains explanation and correct answer after clicking 'Tentar novamente'", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[answeredAttempt]}
        />,
      );
      await user.click(
        screen.getByRole("button", { name: /tentar novamente/i }),
      );
      expect(
        screen.getByText(/S3 is Amazon Simple Storage Service/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/a resposta correta é/i)).toBeInTheDocument();
    });

    it("allows submitting a new answer after 'Tentar novamente'", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1]}
          initialAttempts={[answeredAttempt]}
        />,
      );
      await user.click(
        screen.getByRole("button", { name: /tentar novamente/i }),
      );
      await user.click(screen.getByRole("radio", { name: /A\) EC2/i }));
      await user.click(screen.getByRole("button", { name: /confirmar/i }));
      expect(submitAnswer).toHaveBeenCalledWith("06-s3", "questoes", "q1", "A");
    });
  });

  describe("summary", () => {
    it("shows total question count", () => {
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1, Q2]}
          initialAttempts={[]}
        />,
      );
      expect(screen.getByText(/2 questões/i)).toBeInTheDocument();
    });

    it("shows zero attempted and full remaining before any attempts", () => {
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1, Q2]}
          initialAttempts={[]}
        />,
      );
      expect(screen.getByText(/0 respondidas/i)).toBeInTheDocument();
      expect(screen.getByText(/2 restantes/i)).toBeInTheDocument();
    });

    it("updates attempted and remaining after a submission", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1, Q2]}
          initialAttempts={[]}
        />,
      );
      await user.click(screen.getByRole("radio", { name: /B\) S3/i }));
      await user.click(
        screen.getAllByRole("button", { name: /confirmar/i })[0],
      );
      expect(await screen.findByText(/1 respondidas/i)).toBeInTheDocument();
      expect(screen.getByText(/1 restantes/i)).toBeInTheDocument();
    });

    it("shows correct and incorrect counts", async () => {
      const user = userEvent.setup();
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1, Q2]}
          initialAttempts={[]}
        />,
      );
      // correct answer for Q1
      await user.click(screen.getByRole("radio", { name: /B\) S3/i }));
      await user.click(
        screen.getAllByRole("button", { name: /confirmar/i })[0],
      );
      // incorrect answer for Q2 (B) ECS is unique to Q2)
      await user.click(screen.getByRole("radio", { name: /B\) ECS/i }));
      await user.click(
        screen.getAllByRole("button", { name: /confirmar/i })[1],
      );
      expect(await screen.findByText(/1 corretas/i)).toBeInTheDocument();
      expect(screen.getByText(/1 incorretas/i)).toBeInTheDocument();
    });

    it("remaining reaches zero when all questions are answered", () => {
      const attempts: QuestionAttempt[] = [
        {
          id: 1,
          moduleSlug: "06-s3",
          resourceKey: "questoes",
          questionId: "q1",
          selectedAnswer: "B",
          correctAnswer: "B",
          isCorrect: true,
          createdAt: 1_700_000_000_000,
        },
        {
          id: 2,
          moduleSlug: "06-s3",
          resourceKey: "questoes",
          questionId: "q2",
          selectedAnswer: "C",
          correctAnswer: "C",
          isCorrect: true,
          createdAt: 1_700_000_001_000,
        },
      ];
      render(
        <PracticeQuestionsPanel
          moduleSlug="06-s3"
          resourceKey="questoes"
          questions={[Q1, Q2]}
          initialAttempts={attempts}
        />,
      );
      expect(screen.getByText(/0 restantes/i)).toBeInTheDocument();
    });
  });
});
