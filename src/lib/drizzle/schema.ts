import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const resourceProgress = sqliteTable(
  "resource_progress",
  {
    moduleSlug: text("module_slug").notNull(),
    resourceKey: text("resource_key").notNull(),
    completedAt: integer("completed_at"), // nullable — null means not yet completed
    lastReviewedAt: integer("last_reviewed_at"), // nullable
    updatedAt: integer("updated_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.moduleSlug, t.resourceKey] })],
);

export const resourceVisits = sqliteTable("resource_visits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleSlug: text("module_slug").notNull(),
  resourceKey: text("resource_key").notNull(),
  visitedAt: integer("visited_at").notNull(),
});

export const studyNotes = sqliteTable("study_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleSlug: text("module_slug").notNull(),
  resourceKey: text("resource_key").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const questionAttempts = sqliteTable("question_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  moduleSlug: text("module_slug").notNull(),
  resourceKey: text("resource_key").notNull(),
  questionId: text("question_id").notNull(),
  selectedAnswer: text("selected_answer").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at").notNull(),
});
