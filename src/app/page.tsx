import { BookOpenCheck, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-8 px-6 py-16">
        <div className="flex max-w-3xl flex-col gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            AWS SAA-C03
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Cloud Architect Study
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Base recriada com create-next-app, TypeScript, Tailwind, src/
            directory e shadcn/ui. A proxima etapa conecta os modulos Markdown
            ao dashboard de estudos.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button>
            <BookOpenCheck data-icon="inline-start" />
            Comecar dashboard
          </Button>
          <Button variant="outline">
            <FolderOpen data-icon="inline-start" />
            Ver modulos
          </Button>
        </div>
      </section>
    </main>
  );
}
