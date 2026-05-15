export {
  getProgress,
  upsertProgress,
  calculateModuleProgress,
  deriveOverallStats,
} from "./progress/progress";
export type {
  ResourceProgress,
  ModuleProgress,
  OverallStats,
} from "./progress/progress";

export { recordVisit, getLastVisit } from "./visits/visits";
export type { ResourceVisit } from "./visits/visits";

export { getNote, upsertNote, deleteNote } from "./notes/notes";
export type { StudyNote } from "./notes/notes";

export {
  recordAttempt,
  getLatestAttempt,
  listAttempts,
  listIncorrectAttempts,
  countMistakes,
} from "./attempts/attempts";
export type { QuestionAttempt } from "./attempts/attempts";

export { resolveContinueTarget } from "./continue-target/continue-target";
export type { ContinueTarget } from "./continue-target/continue-target";
