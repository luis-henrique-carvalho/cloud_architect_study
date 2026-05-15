import Link from "next/link";
import { ArrowRight, BookOpenCheck, FolderOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getDefaultStudyResource,
  getStudyModules,
  getStudyResourceHref,
} from "@/lib/content";
import { db } from "@/lib/drizzle/db";
import { resourceProgress } from "@/lib/drizzle/schema";
import { calculateModuleProgress } from "@/modules/learner-state";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Modulos | Cloud Architect Study",
  description: "Catalogo de modulos do portal pessoal de estudos.",
};

export default async function ModulesPage() {
  const modules = await getStudyModules();

  // Single bulk query — no N+1
  const allProgress = db.select().from(resourceProgress).all();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-5">
          <Link
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            href="/"
          >
            Cloud Architect Study
          </Link>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FolderOpen />
              AWS SAA-C03
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Catalogo de modulos
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Uma visao ordenada da trilha SAA-C03, com leitura, pratica e
                revisao reunidas por assunto.
              </p>
            </div>
          </div>
        </header>

        {modules.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderOpen />
              </EmptyMedia>
              <EmptyTitle>Nenhum modulo encontrado</EmptyTitle>
              <EmptyDescription>
                A Content Library ainda nao possui Study Modules disponiveis.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {modules.map((studyModule) => {
              const defaultResource = getDefaultStudyResource(studyModule);
              const href = defaultResource
                ? getStudyResourceHref(studyModule.slug, defaultResource.key)
                : `/modulos/${studyModule.slug}`;

              const moduleProgress = calculateModuleProgress(
                studyModule,
                allProgress,
              );

              return (
                <Card key={studyModule.slug}>
                  <CardHeader>
                    <CardTitle>{studyModule.title}</CardTitle>
                    <CardDescription>
                      {studyModule.summary ||
                        `${studyModule.resources.length} Study Resources disponiveis.`}
                    </CardDescription>
                    <CardAction>
                      <Badge
                        variant={
                          moduleProgress.isComplete ? "default" : "secondary"
                        }
                      >
                        {moduleProgress.isComplete
                          ? "Concluido"
                          : studyModule.isLabModule
                            ? "Lab Module"
                            : "Study Module"}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <Progress value={moduleProgress.percent} />
                      <span className="text-xs text-muted-foreground">
                        {moduleProgress.completed} / {moduleProgress.total}{" "}
                        recursos obrigatorios
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {studyModule.resources.map((resource) => (
                        <Badge
                          key={resource.key}
                          variant={
                            resource.role === "required"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {resource.title}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpenCheck />
                        <span>
                          {studyModule.requiredResources.length} required de{" "}
                          {studyModule.resources.length}
                        </span>
                      </div>
                      <Link
                        className={cn(
                          buttonVariants({ size: "sm", variant: "outline" }),
                          "shrink-0",
                        )}
                        href={href}
                      >
                        Abrir
                        <ArrowRight data-icon="inline-end" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
