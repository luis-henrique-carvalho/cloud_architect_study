import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/lib/drizzle/schema",
  out: "./src/lib/drizzle/migrations",
  dbCredentials: {
    url: "./data/study.db",
  },
  verbose: true,
  strict: true,
});
