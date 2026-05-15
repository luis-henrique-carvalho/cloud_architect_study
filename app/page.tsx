export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-6 px-6 py-12">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">AWS SAA-C03</p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Portal de Estudos Pessoal
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Base Next.js preparada. A proxima fase conecta os modulos em Markdown,
            progresso local e componentes shadcn/ui.
          </p>
        </div>
      </section>
    </main>
  );
}
