import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { cache } from "react"

const CONTENT_LIBRARY_ROOT = path.join(process.cwd(), "content", "modules")

const standardResources = [
  {
    key: "README",
    fileName: "README.md",
    title: "Visao geral",
    defaultRequired: true,
  },
  {
    key: "casos-de-uso",
    fileName: "casos-de-uso.md",
    title: "Casos de uso",
    defaultRequired: false,
  },
  {
    key: "cheatsheet",
    fileName: "cheatsheet.md",
    title: "Cheatsheet",
    defaultRequired: true,
  },
  {
    key: "flashcards",
    fileName: "flashcards.md",
    title: "Flashcards",
    defaultRequired: true,
  },
  {
    key: "lab",
    fileName: "lab.md",
    title: "Lab",
    defaultRequired: false,
  },
  {
    key: "links",
    fileName: "links.md",
    title: "Links",
    defaultRequired: false,
  },
  {
    key: "questoes",
    fileName: "questoes.md",
    title: "Questoes",
    defaultRequired: true,
  },
] as const

type StandardResourceDefinition = (typeof standardResources)[number] & {
  order: number
}

const standardResourcesByFileName: Map<string, StandardResourceDefinition> =
  new Map(
  standardResources.map((resource, index) => [
    resource.fileName,
    { ...resource, order: index },
  ])
)

const defaultRequiredResourceKeys = new Set<string>(
  standardResources
    .filter((resource) => resource.defaultRequired)
    .map((resource) => resource.key)
)

export type StudyResourceRole = "required" | "complementary"

export type StudyResource = {
  key: string
  fileName: string
  title: string
  role: StudyResourceRole
  isStandard: boolean
  order: number
}

export type StudyModule = {
  slug: string
  order: number
  title: string
  summary: string
  isLabModule: boolean
  resources: StudyResource[]
  requiredResources: StudyResource[]
  complementaryResources: StudyResource[]
}

export type StudyResourceContent = {
  module: StudyModule
  resource: StudyResource
  markdown: string
}

export const getStudyModules = cache(async (): Promise<StudyModule[]> => {
  const entries = await readContentLibraryEntries()
  const modules = await Promise.all(
    entries.map(async (entry) => {
      const moduleDirectory = path.join(CONTENT_LIBRARY_ROOT, entry)
      const fileNames = await getMarkdownFileNames(moduleDirectory)
      const resources = buildStudyResources(entry, fileNames)
      const readme = fileNames.includes("README.md")
        ? await readMarkdownFile(moduleDirectory, "README.md")
        : ""

      return {
        slug: entry,
        order: getModuleOrder(entry),
        title: getModuleTitle(entry),
        summary: getModuleSummary(readme),
        isLabModule: isLabModule(entry, fileNames),
        resources,
        requiredResources: resources.filter(
          (resource) => resource.role === "required"
        ),
        complementaryResources: resources.filter(
          (resource) => resource.role === "complementary"
        ),
      }
    })
  )

  return modules.sort((first, second) => {
    if (first.order !== second.order) {
      return first.order - second.order
    }

    return first.title.localeCompare(second.title, "pt-BR", {
      numeric: true,
      sensitivity: "base",
    })
  })
})

export const getStudyModule = cache(
  async (slug: string): Promise<StudyModule | undefined> => {
    const modules = await getStudyModules()

    return modules.find((studyModule) => studyModule.slug === slug)
  }
)

export const getStudyResourceContent = cache(
  async (
    moduleSlug: string,
    resourceKey: string
  ): Promise<StudyResourceContent | undefined> => {
    const studyModule = await getStudyModule(moduleSlug)

    if (!studyModule) {
      return undefined
    }

    const resource = studyModule.resources.find(
      (candidate) => candidate.key === resourceKey
    )

    if (!resource) {
      return undefined
    }

    const markdown = await readMarkdownFile(
      path.join(CONTENT_LIBRARY_ROOT, studyModule.slug),
      resource.fileName
    )

    return {
      module: studyModule,
      resource,
      markdown,
    }
  }
)

export function getDefaultStudyResource(
  studyModule: StudyModule
): StudyResource | undefined {
  return studyModule.requiredResources[0] ?? studyModule.resources[0]
}

export function getStudyResourceHref(moduleSlug: string, resourceKey: string) {
  return `/modulos/${moduleSlug}?resource=${encodeURIComponent(resourceKey)}`
}

export function getContentLibraryStats(modules: StudyModule[]) {
  return modules.reduce(
    (stats, studyModule) => {
      stats.modules += 1
      stats.resources += studyModule.resources.length
      stats.requiredResources += studyModule.requiredResources.length
      stats.labModules += studyModule.isLabModule ? 1 : 0

      return stats
    },
    {
      modules: 0,
      resources: 0,
      requiredResources: 0,
      labModules: 0,
    }
  )
}

function buildStudyResources(
  moduleSlug: string,
  fileNames: string[]
): StudyResource[] {
  const labModule = isLabModule(moduleSlug, fileNames)

  return fileNames
    .map((fileName) => {
      const standardResource = standardResourcesByFileName.get(fileName)
      const key = standardResource?.key ?? getResourceKey(fileName)
      const defaultRequired = standardResource?.defaultRequired ?? false
      const role: StudyResourceRole =
        defaultRequired || (key === "lab" && labModule)
          ? "required"
          : "complementary"

      return {
        key,
        fileName,
        title: standardResource?.title ?? getTitleFromSlug(key),
        role,
        isStandard: Boolean(standardResource),
        order: standardResource?.order ?? standardResources.length,
      }
    })
    .sort((first, second) => {
      if (first.order !== second.order) {
        return first.order - second.order
      }

      return first.title.localeCompare(second.title, "pt-BR", {
        numeric: true,
        sensitivity: "base",
      })
    })
}

async function readContentLibraryEntries() {
  try {
    const entries = await readdir(CONTENT_LIBRARY_ROOT, {
      withFileTypes: true,
    })

    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  } catch {
    return []
  }
}

async function getMarkdownFileNames(directory: string) {
  const entries = await readdir(directory, {
    withFileTypes: true,
  })

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
}

async function readMarkdownFile(directory: string, fileName: string) {
  const markdown = await readFile(path.join(directory, fileName), "utf8")

  return markdown.replace(/^\uFEFF/, "")
}

function getModuleOrder(slug: string) {
  const order = /^(\d+)-/.exec(slug)?.[1]

  return order ? Number(order) : Number.MAX_SAFE_INTEGER
}

function getModuleTitle(slug: string) {
  return getTitleFromSlug(slug.replace(/^\d+-/, ""))
}

function getResourceKey(fileName: string) {
  return fileName.replace(/\.md$/, "")
}

function getTitleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word, index) => {
      if (index > 0 && ["a", "as", "da", "de", "do", "dos", "e"].includes(word)) {
        return word
      }

      return word.toUpperCase() === word
        ? word
        : `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`
    })
    .join(" ")
}

function getModuleSummary(markdown: string) {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const firstParagraph = lines.find(
    (line) =>
      !line.startsWith("#") &&
      !line.startsWith("-") &&
      !line.match(/^\d+\./) &&
      !line.startsWith("http")
  )

  return firstParagraph?.replace(/\*\*/g, "") ?? ""
}

function isLabModule(moduleSlug: string, fileNames: string[]) {
  const slugSaysLab = /\bLabs?\b/i.test(moduleSlug.replaceAll("-", " "))
  const hasLab = fileNames.includes("lab.md")
  const hasDefaultRequiredResource = fileNames.some((fileName) => {
    const standardResource = standardResourcesByFileName.get(fileName)

    return (
      standardResource &&
      defaultRequiredResourceKeys.has(standardResource.key)
    )
  })

  return slugSaysLab || (hasLab && !hasDefaultRequiredResource)
}
