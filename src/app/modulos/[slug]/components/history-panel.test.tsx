// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HistoryPanel } from "./history-panel";

vi.mock("../actions/history-actions", () => ({
  markReviewedAction: vi.fn().mockResolvedValue(undefined),
}));

import { markReviewedAction } from "../actions/history-actions";

beforeEach(() => {
  vi.clearAllMocks();
});

const BASE_PROGRESS = {
  moduleSlug: "01-intro",
  resourceKey: "README",
  updatedAt: 1_700_000_000_000,
};

describe("HistoryPanel", () => {
  it("shows empty state and no Mark Reviewed button when completedAt is null", () => {
    render(
      <HistoryPanel
        moduleSlug="01-intro"
        resourceKey="README"
        progress={{ ...BASE_PROGRESS, completedAt: null, lastReviewedAt: null }}
      />,
    );
    expect(screen.getByText(/ainda não foi concluído/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /marcar como revisado/i }),
    ).toBeNull();
  });

  it("shows the completion date and Mark Reviewed button when completedAt is set", () => {
    render(
      <HistoryPanel
        moduleSlug="01-intro"
        resourceKey="README"
        progress={{
          ...BASE_PROGRESS,
          completedAt: 1_700_000_000_000,
          lastReviewedAt: null,
        }}
      />,
    );
    expect(screen.getByText(/concluído em/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /marcar como revisado/i }),
    ).toBeInTheDocument();
  });

  it("shows both dates when completedAt and lastReviewedAt are set", () => {
    render(
      <HistoryPanel
        moduleSlug="01-intro"
        resourceKey="README"
        progress={{
          ...BASE_PROGRESS,
          completedAt: 1_700_000_000_000,
          lastReviewedAt: 1_700_100_000_000,
        }}
      />,
    );
    expect(screen.getByText(/concluído em/i)).toBeInTheDocument();
    expect(screen.getByText(/última revisão/i)).toBeInTheDocument();
  });

  it("clicking Mark Reviewed calls markReviewedAction with correct args", async () => {
    const user = userEvent.setup();
    render(
      <HistoryPanel
        moduleSlug="01-intro"
        resourceKey="README"
        progress={{
          ...BASE_PROGRESS,
          completedAt: 1_700_000_000_000,
          lastReviewedAt: null,
        }}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: /marcar como revisado/i }),
    );
    expect(markReviewedAction).toHaveBeenCalledWith("01-intro", "README");
  });
});
