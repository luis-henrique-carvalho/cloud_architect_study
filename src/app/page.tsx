import Link from "next/link"
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardList,
  FolderOpen,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getContentLibraryStats,
  getDefaultStudyResource,
  getStudyModules,
  getStudyResourceHref,
} from "@/lib/content"
import { cn } from "@/lib/utils"

export default async function Home() {
  const modules = await getStudyModules()
  const stats = getContentLibraryStats(modules)
  const firstModule = modules[0]
  const firstResource = firstModule
    ? getDefaultStudyResource(firstModule)
    : undefined
  const continueHref =
    firstModule && firstResource
      ? getStudyResourceHref(firstModule.slug, firstResource.key)
      : "/modulos"

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
          <StatCard label="Study Modules" value={stats.modules} />
          <StatCard label="Study Resources" value={stats.resources} />
          <StatCard label="Required Resources" value={stats.requiredResources} />
          <StatCard label="Lab Modules" value={stats.labModules} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card>
            <CardHeader>
              <CardTitle>Continue Target</CardTitle>
              <CardDescription>
                {firstModule && firstResource
                  ? `${firstModule.title} · ${firstResource.title}`
                  : "Nenhum Study Resource disponivel."}
              </CardDescription>
              <CardAction>
                <Badge variant="secondary">local</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {firstModule?.summary ||
                  "A Content Library ainda nao possui resumo para o primeiro modulo."}
              </p>
              <Link
                className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
                href={continueHref}
              >
                Abrir recurso
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
                    variant={studyModule.isLabModule ? "default" : "secondary"}
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
      </section>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}
