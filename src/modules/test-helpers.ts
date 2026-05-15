import path from "path";
import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../lib/drizzle/schema";

export type TestDb = BetterSQLite3Database<typeof schema>;

const MIGRATIONS_FOLDER = path.join(
  process.cwd(),
  "src/lib/drizzle/migrations",
);

export function createTestDb(): TestDb {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite, { schema });

  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

  return db;
}
