import { describe, it, expect } from "vitest";
import { parsePracticeQuestions } from "./parser";

// ---------------------------------------------------------------------------
// Realistic questoes.md snippet matching the actual Content Library format.
// The "âœ…" and "QuestÃ£o" characters reflect the mojibake present in authored
// files so the parser is tested against real-world input.
// ---------------------------------------------------------------------------

const SINGLE_QUESTION = `
## QuestÃ£o 1

Um cenario exige decisao correta em IAM. Qual abordagem e mais aderente?

A) Aplicar solucao generica sem considerar least privilege.
B) Usar least privilege com configuracao orientada ao requisito e operacao enxuta.
C) Adicionar componentes sem necessidade do enunciado.
D) Ignorar requisito explicito de seguranca, disponibilidade ou custo.

<details>
<summary><strong>Ver resposta</strong></summary>

âœ… **Resposta correta:** B

**ExplicaÃ§Ã£o:**
A alternativa B cobre o objetivo tecnico com melhor equilibrio.

**Por que a alternativa A estÃ¡ errada:**
Ela nao atende o requisito principal.

</details>
`.trim();

const TWO_QUESTIONS = `
## QuestÃ£o 1

Prompt da questao um.

A) Opcao incorreta.
B) Opcao correta.
C) Outra opcao incorreta.
D) Mais uma opcao incorreta.

<details>
<summary><strong>Ver resposta</strong></summary>

âœ… **Resposta correta:** B

**ExplicaÃ§Ã£o:**
Explicacao da questao um.

</details>

## QuestÃ£o 2

Prompt da questao dois.

A) Opcao correta.
B) Opcao incorreta.
C) Outra opcao incorreta.
D) Mais uma opcao incorreta.

<details>
<summary><strong>Ver resposta</strong></summary>

âœ… **Resposta correta:** A

**ExplicaÃ§Ã£o:**
Explicacao da questao dois.

</details>
`.trim();

// ---------------------------------------------------------------------------
// Tracer bullet
// ---------------------------------------------------------------------------

describe("parsePracticeQuestions — success", () => {
  it("parses a single realistic question", () => {
    const result = parsePracticeQuestions(SINGLE_QUESTION);

    expect(result.type).toBe("success");
    if (result.type !== "success") return;

    expect(result.questions).toHaveLength(1);

    const q = result.questions[0];
    expect(q.id).toBe("q1");
    expect(q.ordinal).toBe(1);
    expect(q.correctAnswer).toBe("B");
    expect(q.options).toHaveLength(4);
    expect(q.options.map((o) => o.key)).toEqual(["A", "B", "C", "D"]);
  });

  it("parses multiple questions assigning sequential ordinals and ids", () => {
    const result = parsePracticeQuestions(TWO_QUESTIONS);

    expect(result.type).toBe("success");
    if (result.type !== "success") return;

    expect(result.questions).toHaveLength(2);
    expect(result.questions[0].id).toBe("q1");
    expect(result.questions[0].correctAnswer).toBe("B");
    expect(result.questions[1].id).toBe("q2");
    expect(result.questions[1].correctAnswer).toBe("A");
  });

  it("returns success with empty questions for an empty string", () => {
    const result = parsePracticeQuestions("");
    expect(result.type).toBe("success");
    if (result.type !== "success") return;
    expect(result.questions).toHaveLength(0);
  });

  it("returns success with empty questions for a file with no question headings", () => {
    const result = parsePracticeQuestions(
      "# Questoes de Revisao\n\nApenas texto.",
    );
    expect(result.type).toBe("success");
    if (result.type !== "success") return;
    expect(result.questions).toHaveLength(0);
  });

  it("prompt does not include option lines", () => {
    const result = parsePracticeQuestions(SINGLE_QUESTION);
    if (result.type !== "success") return;
    const prompt = result.questions[0].prompt;
    expect(prompt).not.toMatch(/^A\)/m);
    expect(prompt).toContain("IAM");
  });

  it("explanation captures text after correct-answer marker", () => {
    const result = parsePracticeQuestions(SINGLE_QUESTION);
    if (result.type !== "success") return;
    expect(result.questions[0].explanation).toContain("equilibrio");
  });

  it("option text is trimmed", () => {
    const result = parsePracticeQuestions(SINGLE_QUESTION);
    if (result.type !== "success") return;
    const optA = result.questions[0].options.find((o) => o.key === "A");
    expect(optA?.text).toBe(
      "Aplicar solucao generica sem considerar least privilege.",
    );
  });
});

// ---------------------------------------------------------------------------
// Tolerance
// ---------------------------------------------------------------------------

describe("parsePracticeQuestions — tolerance", () => {
  it("tolerates extra blank lines between options", () => {
    const md = `
## QuestÃ£o 1

Prompt.

A) Opcao A.

B) Opcao B.

C) Opcao C.

D) Opcao D.

<details>
<summary><strong>Ver resposta</strong></summary>

âœ… **Resposta correta:** C

**ExplicaÃ§Ã£o:**
Texto.

</details>
`.trim();

    const result = parsePracticeQuestions(md);
    expect(result.type).toBe("success");
    if (result.type !== "success") return;
    expect(result.questions[0].options).toHaveLength(4);
    expect(result.questions[0].correctAnswer).toBe("C");
  });

  it("tolerates Windows CR+LF line endings", () => {
    const md = SINGLE_QUESTION.replace(/\n/g, "\r\n");
    const result = parsePracticeQuestions(md);
    expect(result.type).toBe("success");
    if (result.type !== "success") return;
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].correctAnswer).toBe("B");
  });

  it("tolerates Markdown bold emphasis around the correct-answer letter", () => {
    const md = `
## QuestÃ£o 1

Prompt.

A) Opcao A.
B) Opcao B.
C) Opcao C.
D) Opcao D.

<details>
<summary><strong>Ver resposta</strong></summary>

âœ… **Resposta correta:** **B**

</details>
`.trim();

    const result = parsePracticeQuestions(md);
    expect(result.type).toBe("success");
    if (result.type !== "success") return;
    expect(result.questions[0].correctAnswer).toBe("B");
  });

  it("tolerates italic emphasis around the correct-answer letter", () => {
    const md = `
## QuestÃ£o 1

Prompt.

A) Opcao A.
B) Opcao B.
C) Opcao C.
D) Opcao D.

<details>
<summary><strong>Ver resposta</strong></summary>

âœ… **Resposta correta:** *B*

</details>
`.trim();

    const result = parsePracticeQuestions(md);
    expect(result.type).toBe("success");
    if (result.type !== "success") return;
    expect(result.questions[0].correctAnswer).toBe("B");
  });

  it("tolerates leading whitespace before option key", () => {
    const md = `
## QuestÃ£o 1

Prompt.

  A) Opcao A.
  B) Opcao B.
  C) Opcao C.
  D) Opcao D.

<details>
<summary><strong>Ver resposta</strong></summary>

âœ… **Resposta correta:** A

</details>
`.trim();

    const result = parsePracticeQuestions(md);
    expect(result.type).toBe("success");
    if (result.type !== "success") return;
    expect(result.questions[0].options).toHaveLength(4);
    expect(result.questions[0].correctAnswer).toBe("A");
  });
});

// ---------------------------------------------------------------------------
// Failure cases
// ---------------------------------------------------------------------------

describe("parsePracticeQuestions — unparseable", () => {
  it("returns unparseable when a question has no options", () => {
    const md = `
## QuestÃ£o 1

Prompt sem opcoes.

<details>
<summary><strong>Ver resposta</strong></summary>

âœ… **Resposta correta:** B

</details>
`.trim();

    const result = parsePracticeQuestions(md);
    expect(result.type).toBe("unparseable");
  });

  it("returns unparseable when a question has no correct-answer marker", () => {
    const md = `
## QuestÃ£o 1

Prompt.

A) Opcao A.
B) Opcao B.

<details>
<summary><strong>Ver resposta</strong></summary>

Sem marcador de resposta.

</details>
`.trim();

    const result = parsePracticeQuestions(md);
    expect(result.type).toBe("unparseable");
  });

  it("returns unparseable when option keys are duplicated", () => {
    const md = `
## QuestÃ£o 1

Prompt.

A) Opcao A.
A) Opcao A duplicada.
C) Opcao C.
D) Opcao D.

<details>
<summary><strong>Ver resposta</strong></summary>

âœ… **Resposta correta:** A

</details>
`.trim();

    const result = parsePracticeQuestions(md);
    expect(result.type).toBe("unparseable");
  });

  it("returns unparseable when correct-answer key is not among option keys", () => {
    const md = `
## QuestÃ£o 1

Prompt.

A) Opcao A.
B) Opcao B.
C) Opcao C.
D) Opcao D.

<details>
<summary><strong>Ver resposta</strong></summary>

âœ… **Resposta correta:** E

</details>
`.trim();

    const result = parsePracticeQuestions(md);
    expect(result.type).toBe("unparseable");
  });

  it("returns unparseable when details block is missing entirely", () => {
    const md = `
## QuestÃ£o 1

Prompt.

A) Opcao A.
B) Opcao B.
C) Opcao C.
D) Opcao D.
`.trim();

    const result = parsePracticeQuestions(md);
    expect(result.type).toBe("unparseable");
  });
});
