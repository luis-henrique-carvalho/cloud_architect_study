export type TabKey = "content" | "notes" | "history";

const VALID_TABS: TabKey[] = ["content", "notes", "history"];

export function resolveActiveTab(param: string | string[] | undefined): TabKey {
  const value = Array.isArray(param) ? param[0] : param;
  if (value && (VALID_TABS as string[]).includes(value)) {
    return value as TabKey;
  }
  return "content";
}

export function buildTabHref(
  moduleSlug: string,
  resourceKey: string,
  tab: TabKey,
): string {
  return `/modulos/${moduleSlug}?resource=${resourceKey}&tab=${tab}`;
}
