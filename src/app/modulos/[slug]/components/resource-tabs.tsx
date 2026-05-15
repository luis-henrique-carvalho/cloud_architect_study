"use client";

import Link from "next/link";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { buildTabHref, type TabKey } from "../utils/tab-helpers";

const TAB_LABELS: Record<TabKey, string> = {
  content: "Conteúdo",
  notes: "Notas",
  history: "Histórico",
};

export function ResourceTabs({
  activeTab,
  moduleSlug,
  resourceKey,
  contentPanel,
  notesPanel,
  historyPanel,
}: {
  activeTab: TabKey;
  moduleSlug: string;
  resourceKey: string;
  contentPanel: React.ReactNode;
  notesPanel: React.ReactNode;
  historyPanel: React.ReactNode;
}) {
  return (
    <Tabs key={activeTab} defaultValue={activeTab}>
      <TabsList>
        {(["content", "notes", "history"] as TabKey[]).map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            nativeButton={false}
            render={<Link href={buildTabHref(moduleSlug, resourceKey, tab)} />}
          >
            {TAB_LABELS[tab]}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="content">{contentPanel}</TabsContent>
      <TabsContent value="notes">{notesPanel}</TabsContent>
      <TabsContent value="history">{historyPanel}</TabsContent>
    </Tabs>
  );
}
