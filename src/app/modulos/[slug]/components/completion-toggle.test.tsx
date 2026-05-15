// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompletionToggle } from "./completion-toggle";

vi.mock("../actions/completion-actions", () => ({
  toggleCompletion: vi.fn().mockResolvedValue(undefined),
}));

import { toggleCompletion } from "../actions/completion-actions";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CompletionToggle", () => {
  it("renders unchecked when completedAt is null", () => {
    render(
      <CompletionToggle
        moduleSlug="01-intro"
        resourceKey="README"
        completedAt={null}
      />,
    );
    const toggle = screen.getByRole("checkbox", { name: /concluído/i });
    expect(toggle).not.toBeChecked();
  });

  it("renders checked when completedAt is non-null", () => {
    render(
      <CompletionToggle
        moduleSlug="01-intro"
        resourceKey="README"
        completedAt={1_700_000_000_000}
      />,
    );
    const toggle = screen.getByRole("checkbox", { name: /concluído/i });
    expect(toggle).toBeChecked();
  });

  it("is absent when the resource key is 'questoes'", () => {
    render(
      <CompletionToggle
        moduleSlug="01-intro"
        resourceKey="questoes"
        completedAt={null}
      />,
    );
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("clicking the toggle when incomplete calls toggleCompletion to mark complete", async () => {
    const user = userEvent.setup();
    render(
      <CompletionToggle
        moduleSlug="01-intro"
        resourceKey="README"
        completedAt={null}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: /concluído/i }));
    expect(toggleCompletion).toHaveBeenCalledWith("01-intro", "README", true);
  });

  it("clicking the toggle when complete calls toggleCompletion to reopen", async () => {
    const user = userEvent.setup();
    render(
      <CompletionToggle
        moduleSlug="01-intro"
        resourceKey="README"
        completedAt={1_700_000_000_000}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: /concluído/i }));
    expect(toggleCompletion).toHaveBeenCalledWith("01-intro", "README", false);
  });
});
