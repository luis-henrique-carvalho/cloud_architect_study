# Use Drizzle and SQLite for Learner State

Learner State will be stored in SQLite through Drizzle, with the local database file at `data/study.db`. This keeps the Personal Study Portal local and lightweight while giving the MVP typed schema definitions and migrations for Study Resource progress, Study Notes, Question Attempts, and the Mistake Notebook.
