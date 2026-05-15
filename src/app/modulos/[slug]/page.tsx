import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BookOpenCheck, FlaskConical } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  getDefaultStudyResource,
  getStudyModule,
  getStudyModules,
  getStudyResourceContent,
  getStudyResourceHref,
} from "@/lib/content"
import { MarkdownRenderer } from "@/lib/markdown"
import { cn } from "@/lib/utils"

type ModulePageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    resource?: string | string[]
  }>
}

export async function generateStaticParams() {
  const modules = await getStudyModules()

  return modules.map((studyModule) => ({
    slug: studyModule.slug,
  }))
}

export async function generateMetadata({
  params,
}: Pick<ModulePageProps, "params">): Promise<Metadata> {
  const { slug } = await params
  const studyModule = await getStudyModule(slug)

  if (!studyModule) {
    return {
      title: "Modulo nao encontrado | Cloud Architect Study",
    }
  }

  return {
    title: `${studyModule.title} | Cloud Architect Study`,
    description: studyModule.summary,
  }
}

export default async function ModulePage({
  params,
  searchParams,
}: ModulePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const studyModule = await getStudyModule(slug)

  if (!studyModule) {
    notFound()
  }

  const requestedResourceKey = Array.isArray(query.resource)
    ? query.resource[0]
    : query.resource
  const selectedResource =
    studyModule.resources.find(
      (resource) => resource.key === requestedResourceKey
    ) ?? getDefaultStudyResource(studyModule)

  if (!selectedResource) {
    notFound()
  }

  const content = await getStudyResourceContent(
    studyModule.slug,
    selectedResource.key
  )

  if (!content) {
    notFound()
  }

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
              <Badge variant={studyModule.isLabModule ? "default" : "secondary"}>
                {studyModule.isLabModule ? "Lab Module" : "Study Module"}
              </Badge>
              <Badge variant="outline">
                {studyModule.requiredResources.length} required de{" "}
                {studyModule.resources.length}
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
                const active = resource.key === selectedResource.key

                return (
                  <Link
                    key={resource.key}
                    className={cn(
                      "flex min-h-10 items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:bg-muted"
                    )}
                    href={getStudyResourceHref(studyModule.slug, resource.key)}
                  >
                    <span className="truncate">{resource.title}</span>
                    <span
                      className={cn(
                        "shrink-0 text-xs",
                        active ? "text-background/80" : "text-muted-foreground"
                      )}
                    >
                      {resource.role === "required" ? "required" : "extra"}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </aside>

          <article className="min-w-0">
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
                <h2 className="text-2xl font-semibold tracking-tight">
                  {selectedResource.title}
                </h2>
              </div>

              <MarkdownRenderer
                content={content.markdown}
                moduleSlug={studyModule.slug}
              />
            </div>
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
  )
}
