import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  ClipboardList,
  FolderOpen,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getDefaultStudyResource,
  getStudyModules,
  getStudyResourceHref,
} from "@/lib/content";
import { db } from "@/lib/drizzle/db";
import {
  countMistakes,
  deriveOverallStats,
  resolveContinueTarget,
} from "@/modules/learner-state";
import { resourceProgress, resourceVisits } from "@/lib/drizzle/schema";
import { cn } from "@/lib/utils";

export default async function Home() {
  const modules = await getStudyModules();

  // Bulk queries — no N+1
  const allProgress = db.select().from(resourceProgress).all();
  const recentVisits = db
    .select()
    .from(resourceVisits)
    .orderBy(resourceVisits.visitedAt)
    .all();

  const continueTarget = resolveContinueTarget(
    modules,
    recentVisits,
    allProgress,
  );
  const overallStats = deriveOverallStats(modules, allProgress);
  const mistakeCount = countMistakes(db);

  let continueHref = "/modulos";
  let continueModuleTitle: string | undefined;
  let continueResourceTitle: string | undefined;
  let continueSummary: string | undefined;

  if (continueTarget) {
    const targetModule = modules.find(
      (m) => m.slug === continueTarget.moduleSlug,
    );
    const targetResource = targetModule?.resources.find(
      (r) => r.key === continueTarget.resourceKey,
    );
    if (targetModule && targetResource) {
      continueHref = getStudyResourceHref(
        targetModule.slug,
        targetResource.key,
      );
      continueModuleTitle = targetModule.title;
      continueResourceTitle = targetResource.title;
      continueSummary = targetModule.summary;
    }
  } else if (modules[0]) {
    // Fallback to first module when nothing to continue (all complete or empty DB)
    const firstModule = modules[0];
    const firstResource = getDefaultStudyResource(firstModule);
    if (firstResource) {
      continueHref = getStudyResourceHref(firstModule.slug, firstResource.key);
    }
  }

  const allComplete = modules.length > 0 && continueTarget === null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BookOpenCheck />
            AWS SAA-C03
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Study Dashboard
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Trilha local para revisar os modulos, abrir recursos de estudo e
              manter o ritmo da preparacao.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className={buttonVariants()} href={continueHref}>
              <BookOpenCheck data-icon="inline-start" />
              Continuar estudo
            </Link>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/modulos"
            >
              <FolderOpen data-icon="inline-start" />
              Ver modulos
            </Link>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Modulos Concluidos"
            value={`${overallStats.completedModules} / ${overallStats.totalModules}`}
          />
          <StatCard
            label="Recursos Concluidos"
            value={`${overallStats.completedRequired} / ${overallStats.totalRequired}`}
          />
          <StatCard
            label="Progresso Geral"
            value={`${overallStats.overallPercent}%`}
          />
          <StatCard label="Erros no Notebook" value={String(mistakeCount)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card>
            <CardHeader>
              <CardTitle>Continue Target</CardTitle>
              <CardDescription>
                {continueModuleTitle && continueResourceTitle
                  ? `${continueModuleTitle} · ${continueResourceTitle}`
                  : allComplete
                    ? "Todos os recursos obrigatorios concluidos."
                    : "Nenhum Study Resource disponivel."}
              </CardDescription>
              <CardAction>
                <Badge variant="secondary">local</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {allComplete
                  ? "Parabens! Voce concluiu todos os recursos obrigatorios da trilha."
                  : continueSummary ||
                    "A Content Library ainda nao possui resumo para este modulo."}
              </p>
              {!allComplete && (
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-fit",
                  )}
                  href={continueHref}
                >
                  Abrir recurso
                  <ArrowRight data-icon="inline-end" />
                </Link>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Mistake Notebook</CardTitle>
                <CardDescription>
                  {mistakeCount === 0
                    ? "Sem erros pendentes."
                    : `${mistakeCount} ${mistakeCount === 1 ? "erro" : "erros"} para revisar.`}
                </CardDescription>
                <CardAction>
                  {mistakeCount > 0 && (
                    <AlertCircle className="text-destructive" />
                  )}
                </CardAction>
              </CardHeader>
              <CardContent>
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full",
                  )}
                  href="/erros"
                >
                  {mistakeCount === 0 ? "Ver notebook" : "Revisar erros"}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Library</CardTitle>
                <CardDescription>
                  Markdown como fonte de verdade do Study Content.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {modules.slice(0, 5).map((studyModule) => (
                  <Link
                    key={studyModule.slug}
                    className="flex min-h-10 items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted"
                    href={`/modulos/${studyModule.slug}`}
                  >
                    <span className="truncate">{studyModule.title}</span>
                    <Badge
                      variant={
                        studyModule.isLabModule ? "default" : "secondary"
                      }
                    >
                      {studyModule.resources.length}
                    </Badge>
                  </Link>
                ))}
                <Link
                  className={cn(buttonVariants({ variant: "outline" }), "mt-1")}
                  href="/modulos"
                >
                  Catalogo completo
                  <ClipboardList data-icon="inline-end" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
