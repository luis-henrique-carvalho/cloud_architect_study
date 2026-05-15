import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  Circle,
  FlaskConical,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getDefaultStudyResource,
  getStudyModule,
  getStudyModules,
  getStudyResourceContent,
  getStudyResourceHref,
} from "@/lib/content";
import { db } from "@/lib/drizzle/db";
import { MarkdownRenderer } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import {
  calculateModuleProgress,
  formatProgressLabel,
  getModuleProgressRows,
  getNote,
  listAttempts,
  recordVisit,
} from "@/modules/learner-state";
import { parsePracticeQuestions } from "@/modules/practice-questions";
import { resolveActiveTab } from "./utils/tab-helpers";
import { ResourceTabs } from "./components/resource-tabs";
import { CompletionToggle } from "./components/completion-toggle";
import { NotesEditor } from "./components/notes-editor";
import { HistoryPanel } from "./components/history-panel";
import { PracticeQuestionsPanel } from "./components/practice-questions-panel";

type ModulePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    resource?: string | string[];
    tab?: string | string[];
  }>;
};

export async function generateStaticParams() {
  const modules = await getStudyModules();

  return modules.map((studyModule) => ({
    slug: studyModule.slug,
  }));
}

export async function generateMetadata({
  params,
}: Pick<ModulePageProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const studyModule = await getStudyModule(slug);

  if (!studyModule) {
    return {
      title: "Modulo nao encontrado | Cloud Architect Study",
    };
  }

  return {
    title: `${studyModule.title} | Cloud Architect Study`,
    description: studyModule.summary,
  };
}

export default async function ModulePage({
  params,
  searchParams,
}: ModulePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const studyModule = await getStudyModule(slug);

  if (!studyModule) {
    notFound();
  }

  const requestedResourceKey = Array.isArray(query.resource)
    ? query.resource[0]
    : query.resource;
  const selectedResource =
    studyModule.resources.find(
      (resource) => resource.key === requestedResourceKey,
    ) ?? getDefaultStudyResource(studyModule);

  if (!selectedResource) {
    notFound();
  }

  const content = await getStudyResourceContent(
    studyModule.slug,
    selectedResource.key,
  );

  if (!content) {
    notFound();
  }

  // 006 — record this resource visit asynchronously (does not block render)
  after(() => recordVisit(db, studyModule.slug, selectedResource.key));

  // 007 — fetch module progress in a single query
  const progressRows = getModuleProgressRows(db, studyModule.slug);
  const moduleProgress = calculateModuleProgress(studyModule, progressRows);
  const completedKeys = new Set(
    progressRows.filter((r) => r.completedAt != null).map((r) => r.resourceKey),
  );

  // 009/011 — find the progress row for the currently active resource
  const activeProgress =
    progressRows.find((r) => r.resourceKey === selectedResource.key) ?? null;

  // 010 — fetch the current note for the active resource
  const currentNote = getNote(db, studyModule.slug, selectedResource.key);

  // 014/015 — parse practice questions for questoes resource
  const practiceState = (() => {
    if (selectedResource.key !== "questoes") return null;
    const parsed = parsePracticeQuestions(content.markdown);
    if (parsed.type !== "success") return null;
    const attempts = listAttempts(db, studyModule.slug, selectedResource.key);
    return { questions: parsed.questions, attempts };
  })();

  // 008 — resolve active tab from URL
  const activeTab = resolveActiveTab(query.tab);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-6">
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            href="/modulos"
          >
            <ArrowLeft />
            Modulos
          </Link>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={studyModule.isLabModule ? "default" : "secondary"}
              >
                {studyModule.isLabModule ? "Lab Module" : "Study Module"}
              </Badge>
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {studyModule.title}
              </h1>
              {studyModule.summary ? (
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  {studyModule.summary}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">
                {formatProgressLabel(
                  moduleProgress.completed,
                  moduleProgress.total,
                )}
              </span>
              <Progress
                value={moduleProgress.percent}
                className="max-w-sm"
                aria-label="Progresso do módulo"
              />
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            <div className="flex items-center gap-2 text-sm font-medium">
              {studyModule.isLabModule ? <FlaskConical /> : <BookOpenCheck />}
              Study Resources
            </div>
            <nav className="flex flex-col gap-2" aria-label="Study Resources">
              {studyModule.resources.map((resource) => {
                const active = resource.key === selectedResource.key;
                const isComplete = completedKeys.has(resource.key);

                return (
                  <Link
                    key={resource.key}
                    className={cn(
                      "flex min-h-10 items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:bg-muted",
                    )}
                    href={getStudyResourceHref(studyModule.slug, resource.key)}
                  >
                    <span className="truncate">{resource.title}</span>
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1 text-xs",
                        active ? "text-background/80" : "text-muted-foreground",
                      )}
                    >
                      {isComplete ? (
                        <CheckCircle2
                          className={cn(
                            "size-3.5",
                            active ? "text-background/80" : "text-primary",
                          )}
                          aria-label="Concluído"
                        />
                      ) : (
                        <Circle
                          className="size-3.5 opacity-30"
                          aria-label="Pendente"
                        />
                      )}
                      {resource.role === "required" ? "required" : "extra"}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <article className="min-w-0">
            <ResourceTabs
              activeTab={activeTab}
              moduleSlug={studyModule.slug}
              resourceKey={selectedResource.key}
              contentPanel={
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3 border-b pb-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          selectedResource.role === "required"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedResource.role === "required"
                          ? "Required Study Resource"
                          : "Complementary Study Resource"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedResource.fileName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {selectedResource.title}
                      </h2>
                      <CompletionToggle
                        moduleSlug={studyModule.slug}
                        resourceKey={selectedResource.key}
                        completedAt={activeProgress?.completedAt ?? null}
                      />
                    </div>
                  </div>

                  {practiceState ? (
                    <PracticeQuestionsPanel
                      moduleSlug={studyModule.slug}
                      resourceKey={selectedResource.key}
                      questions={practiceState.questions}
                      initialAttempts={practiceState.attempts}
                    />
                  ) : (
                    <MarkdownRenderer
                      content={content.markdown}
                      moduleSlug={studyModule.slug}
                    />
                  )}
                </div>
              }
              notesPanel={
                <NotesEditor
                  moduleSlug={studyModule.slug}
                  resourceKey={selectedResource.key}
                  initialNote={currentNote}
                />
              }
              historyPanel={
                <HistoryPanel
                  moduleSlug={studyModule.slug}
                  resourceKey={selectedResource.key}
                  progress={activeProgress}
                />
              }
            />
          </article>
        </div>

        <div className="flex justify-start">
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/modulos"
          >
            <ArrowLeft data-icon="inline-start" />
            Voltar ao catalogo
          </Link>
        </div>
      </section>
    </main>
  );
}
