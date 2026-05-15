export type ParsedQuestion = {
  id: string;
  ordinal: number;
  prompt: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
};

export type ParseResult =
  | { type: "success"; questions: ParsedQuestion[] }
  | { type: "unparseable"; reason: string };

// Matches a level-2 heading that starts a question block.
const QUESTION_HEADING_RE = /^## .+$/m;

// Matches a single answer option line (with optional leading whitespace).
const OPTION_LINE_RE = /^\s*([A-E])\)\s*(.+)$/;

// Extracts the correct-answer letter from inside a <details> block.
// Tolerates optional Markdown bold/italic emphasis around the letter.
const CORRECT_ANSWER_RE =
  /\*\*Resposta correta:\*\*\s*\*{0,2}\*{0,1}([A-E])\*{0,1}\*{0,2}/;

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function splitIntoBlocks(markdown: string): string[] {
  // Split on lines that start a level-2 heading, keeping the heading in the block.
  const normalized = normalizeLineEndings(markdown);
  const parts = normalized.split(/(?=^## )/m);
  return parts.filter((p) => QUESTION_HEADING_RE.test(p));
}

function parseBlock(
  block: string,
  ordinal: number,
): ParsedQuestion | { error: string } {
  // Separate the <details>…</details> region from the rest.
  const detailsMatch = block.match(/<details>([\s\S]*?)<\/details>/);
  if (!detailsMatch) {
    return { error: `question ${ordinal}: missing <details> block` };
  }

  const detailsContent = detailsMatch[1];
  const bodyBeforeDetails = block.slice(0, block.indexOf("<details>"));

  // Parse options from the body before <details>.
  const bodyLines = bodyBeforeDetails.split("\n");
  const options: { key: string; text: string }[] = [];
  const optionLineIndices: number[] = [];

  for (let i = 0; i < bodyLines.length; i++) {
    const m = bodyLines[i].match(OPTION_LINE_RE);
    if (m) {
      options.push({ key: m[1], text: m[2].trim() });
      optionLineIndices.push(i);
    }
  }

  if (options.length === 0) {
    return { error: `question ${ordinal}: no options found` };
  }

  // Duplicate key check.
  const keySet = new Set(options.map((o) => o.key));
  if (keySet.size !== options.length) {
    return { error: `question ${ordinal}: duplicate option keys` };
  }

  // Extract correct answer from details block.
  const correctMatch = detailsContent.match(CORRECT_ANSWER_RE);
  if (!correctMatch) {
    return { error: `question ${ordinal}: no correct-answer marker found` };
  }
  const correctAnswer = correctMatch[1];

  // Validate that the correct answer key exists in parsed options.
  if (!keySet.has(correctAnswer)) {
    return {
      error: `question ${ordinal}: correct answer key "${correctAnswer}" not among option keys`,
    };
  }

  // Build prompt: lines before the first option line (skip the heading line).
  const firstOptionIdx =
    optionLineIndices.length > 0 ? optionLineIndices[0] : bodyLines.length;
  const promptLines = bodyLines
    .slice(1, firstOptionIdx) // skip heading line (index 0)
    .join("\n")
    .trim();

  // Build explanation: content inside <details> after the correct-answer line.
  const detailsLines = detailsContent.split("\n");
  const correctAnswerLineIdx = detailsLines.findIndex((l) =>
    CORRECT_ANSWER_RE.test(l),
  );
  const explanation =
    correctAnswerLineIdx >= 0
      ? detailsLines
          .slice(correctAnswerLineIdx + 1)
          .join("\n")
          .trim()
      : "";

  return {
    id: `q${ordinal}`,
    ordinal,
    prompt: promptLines,
    options,
    correctAnswer,
    explanation,
  };
}

export function parsePracticeQuestions(markdown: string): ParseResult {
  if (!markdown.trim()) {
    return { type: "success", questions: [] };
  }

  const blocks = splitIntoBlocks(markdown);

  if (blocks.length === 0) {
    return { type: "success", questions: [] };
  }

  const questions: ParsedQuestion[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const ordinal = i + 1;
    const parsed = parseBlock(blocks[i], ordinal);
    if ("error" in parsed) {
      return { type: "unparseable", reason: parsed.error };
    }
    questions.push(parsed);
  }

  return { type: "success", questions };
}
