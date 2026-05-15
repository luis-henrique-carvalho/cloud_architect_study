// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotesEditor } from "./notes-editor";

vi.mock("../actions/notes-actions", () => ({
  saveNoteAction: vi.fn().mockResolvedValue(undefined),
  deleteNoteAction: vi.fn().mockResolvedValue(undefined),
}));

import { saveNoteAction, deleteNoteAction } from "../actions/notes-actions";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("NotesEditor", () => {
  it("shows empty state and empty textarea when initialNote is null", () => {
    render(
      <NotesEditor
        moduleSlug="01-intro"
        resourceKey="README"
        initialNote={null}
      />,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("");
    expect(screen.getByText(/ainda não há notas/i)).toBeInTheDocument();
  });

  it("pre-fills textarea when initialNote has content", () => {
    const note = {
      moduleSlug: "01-intro",
      resourceKey: "README",
      content: "Minha anotação de estudo",
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_000,
    };
    render(
      <NotesEditor
        moduleSlug="01-intro"
        resourceKey="README"
        initialNote={note}
      />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("Minha anotação de estudo");
  });

  it("submitting the form calls saveNoteAction with the correct arguments", async () => {
    const user = userEvent.setup();
    render(
      <NotesEditor
        moduleSlug="01-intro"
        resourceKey="README"
        initialNote={null}
      />,
    );
    await user.type(screen.getByRole("textbox"), "Nova nota");
    await user.click(screen.getByRole("button", { name: /salvar/i }));
    expect(saveNoteAction).toHaveBeenCalledWith(
      "01-intro",
      "README",
      "Nova nota",
    );
  });

  it("clicking delete calls deleteNoteAction", async () => {
    const user = userEvent.setup();
    const note = {
      moduleSlug: "01-intro",
      resourceKey: "README",
      content: "Nota existente",
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_000,
    };
    render(
      <NotesEditor
        moduleSlug="01-intro"
        resourceKey="README"
        initialNote={note}
      />,
    );
    await user.click(screen.getByRole("button", { name: /excluir/i }));
    expect(deleteNoteAction).toHaveBeenCalledWith("01-intro", "README");
  });
});
