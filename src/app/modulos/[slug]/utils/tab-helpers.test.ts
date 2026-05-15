import { describe, it, expect } from "vitest";
import { resolveActiveTab, buildTabHref } from "./tab-helpers";

describe("resolveActiveTab", () => {
  it("returns 'content' when no param is provided", () => {
    expect(resolveActiveTab(undefined)).toBe("content");
  });

  it("returns 'content' for ?tab=content", () => {
    expect(resolveActiveTab("content")).toBe("content");
  });

  it("returns 'notes' for ?tab=notes", () => {
    expect(resolveActiveTab("notes")).toBe("notes");
  });

  it("returns 'history' for ?tab=history", () => {
    expect(resolveActiveTab("history")).toBe("history");
  });

  it("returns 'content' for any unknown value", () => {
    expect(resolveActiveTab("invalid")).toBe("content");
    expect(resolveActiveTab("")).toBe("content");
  });

  it("handles array query params by using the first value", () => {
    expect(resolveActiveTab(["notes", "history"])).toBe("notes");
  });
});

describe("buildTabHref", () => {
  it("includes both resource and tab search params", () => {
    const href = buildTabHref("01-intro", "README", "content");
    expect(href).toBe("/modulos/01-intro?resource=README&tab=content");
  });

  it("builds correct href for the notes tab", () => {
    const href = buildTabHref("01-intro", "README", "notes");
    expect(href).toContain("resource=README");
    expect(href).toContain("tab=notes");
  });

  it("builds correct href for the history tab", () => {
    const href = buildTabHref("02-iam", "cheatsheet", "history");
    expect(href).toBe("/modulos/02-iam?resource=cheatsheet&tab=history");
  });
});
