# Plano do Portal de Estudos Pessoal

## Objetivo

Construir um MVP rapido e simples do Personal Study Portal para estudar AWS SAA-C03 localmente, navegando o conteudo Markdown existente e acompanhando progresso, notas, questoes, acertos, erros e revisoes basicas.

## Decisoes confirmadas

- O produto e um Personal Study Portal local para um unico aprendiz.
- O app Next.js fica na raiz do repositorio.
- O Study Content fica em `content/modules/`.
- O Markdown continua sendo a fonte da verdade do conteudo.
- O Learner State fica separado em SQLite.
- O SQLite sera acessado com Drizzle.
- O banco local sera `data/study.db`.
- O MVP nao tera autenticacao.
- O MVP usara TypeScript.
- O gerenciador de pacotes sera npm.
- A UI sera baseada em shadcn/ui.
- O tema inicial sera claro, calmo, legivel e pouco cansativo.
- O `index.html` atual sera movido para `docs/reference/index-ui-reference.html` como referencia de UI/UX.
- Links antigos do GitHub para os Markdown nao precisam ser preservados no MVP.

## Escopo do MVP

- Dashboard de estudo com progresso geral, Continue Target e resumo do Caderno de Erros.
- Catalogo de modulos com busca por modulo/recurso e filtros simples.
- Pagina de modulo com recursos existentes em abas, na ordem padrao.
- Renderizacao Markdown para recursos nao interativos.
- Toggle de conclusao para recursos nao interativos.
- Questoes interativas quando `questoes.md` for parseavel.
- Registro historico de Question Attempts.
- Classificacao automatica de Correct Answer e Incorrect Answer.
- Caderno de Erros em rota dedicada `/erros`.
- Study Notes por Study Resource.
- Review History simples com datas de conclusao e ultima revisao.

## Fora de escopo inicial

- Autenticacao.
- Multiusuario.
- Deploy publico.
- Compatibilidade com GitHub Pages.
- Preservar todos os links Markdown antigos do README.
- Busca full-text em todo o conteudo.
- Flashcards interativos.
- Revisao espacada com agenda inteligente.
- Importar Study Content para o banco.

## Estrutura alvo

```txt
.
├── app/
│   ├── page.tsx
│   ├── modulos/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── erros/page.tsx
│   ├── configuracoes/page.tsx
│   └── api/
├── components/
│   ├── app/
│   └── ui/
├── content/
│   └── modules/
│       └── 01-Introducao-SAA-C03/
│           ├── README.md
│           ├── casos-de-uso.md
│           ├── cheatsheet.md
│           ├── flashcards.md
│           ├── lab.md
│           ├── links.md
│           └── questoes.md
├── data/
│   └── study.db
├── db/
│   ├── schema.ts
│   └── migrations/
├── docs/
│   ├── PLAN.md
│   ├── adr/
│   └── reference/
│       └── index-ui-reference.html
├── lib/
│   ├── content.ts
│   ├── markdown.ts
│   ├── questions.ts
│   ├── progress.ts
│   └── db.ts
└── package.json
```

## Recursos padrao

Ordem de apresentacao dos Study Resources:

```txt
README -> casos-de-uso -> cheatsheet -> flashcards -> lab -> links -> questoes
```

Recursos requeridos por padrao:

```txt
README, cheatsheet, flashcards, questoes
```

Recursos complementares por padrao:

```txt
casos-de-uso, lab, links
```

Excecao:

```txt
lab e requerido quando o Study Module for um Lab Module.
```

Recursos ausentes nao aparecem na experiencia do modulo e nao contam como pendencia.

## Modelo de dados inicial

```txt
resource_progress
- module_slug
- resource_key
- completed_at
- last_reviewed_at
- updated_at

resource_visits
- id
- module_slug
- resource_key
- visited_at

study_notes
- id
- module_slug
- resource_key
- content
- created_at
- updated_at

question_attempts
- id
- module_slug
- resource_key
- question_id
- selected_answer
- correct_answer
- is_correct
- created_at
```

## Regras principais

- Module Progress e calculado a partir dos Required Study Resources existentes.
- Recurso nao interativo e concluido por toggle manual.
- `questoes.md` e concluido quando todas as Practice Questions existentes tiverem pelo menos uma Question Attempt.
- Question Attempts sao historicas.
- Current Question State vem da tentativa mais recente.
- O Mistake Notebook mostra questoes com pelo menos uma Incorrect Answer.
- Corrected Mistakes continuam no Mistake Notebook com status de corrigida.
- Continue Target usa o ultimo recurso aberto se ele ainda estiver incompleto; caso contrario usa o proximo Required Study Resource incompleto.

## Rotas do MVP

- `/`: Study Dashboard.
- `/modulos`: Module Catalog.
- `/modulos/[slug]`: Study Module com abas de recursos.
- `/erros`: Mistake Notebook.
- `/configuracoes`: configuracoes locais basicas.

## Fases de implementacao

1. Preparar estrutura do projeto: mover conteudo, mover `index.html`, criar Next.js, npm, TypeScript, shadcn/ui e tema base.
2. Criar camada de conteudo: descobrir modulos em `content/modules/`, listar recursos existentes e renderizar Markdown.
3. Criar camada de persistencia: Drizzle, SQLite, schema inicial e `.gitignore` para `data/*.db`.
4. Criar Dashboard e Catalogo de Modulos.
5. Criar pagina de modulo com abas, progresso, notas e Review History.
6. Criar parser de `questoes.md` e experiencia interativa de Practice Questions.
7. Criar Caderno de Erros.
8. Revisar UI, acessibilidade, estados vazios e fluxo de estudo diario.
