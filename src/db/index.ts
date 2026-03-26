import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDb | null = null;
let _initPromise: Promise<void> | null = null;

function createDb(): DrizzleDb {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    // Fallback: use a temporary local SQLite file in /tmp
    // Note: /tmp is writable in Vercel serverless but NOT persistent across cold starts.
    // Data is re-seeded on each cold start via auto-seed logic.
    console.warn("[db] TURSO_DATABASE_URL not set. Using local SQLite at /tmp/sakura.db");
    const client = createClient({ url: "file:/tmp/sakura.db" });
    return drizzle(client, { schema });
  }
  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return drizzle(client, { schema });
}

async function initLocalDb(db: DrizzleDb): Promise<void> {
  const client = (db as unknown as { $client: ReturnType<typeof createClient> }).$client;
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS menus (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      duration INTEGER NOT NULL,
      price INTEGER NOT NULL,
      target_symptoms TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      patient_name TEXT NOT NULL,
      patient_kana TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      menu_id TEXT NOT NULL REFERENCES menus(id),
      staff_id TEXT,
      reservation_date TEXT NOT NULL,
      reservation_time TEXT NOT NULL,
      is_first_visit INTEGER NOT NULL,
      symptoms TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      staff_memo TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      day_of_week INTEGER,
      specific_date TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      slot_interval INTEGER NOT NULL DEFAULT 30,
      max_slots INTEGER NOT NULL DEFAULT 2,
      is_holiday INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'practitioner',
      specialties TEXT,
      profile_image_url TEXT,
      color TEXT NOT NULL DEFAULT '#f472b6',
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS staff_schedules (
      id TEXT PRIMARY KEY,
      staff_id TEXT NOT NULL REFERENCES staff(id),
      day_of_week INTEGER,
      specific_date TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_off INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      staff_id TEXT NOT NULL REFERENCES staff(id),
      date TEXT NOT NULL,
      clock_in TEXT,
      clock_out TEXT,
      break_minutes INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migrate existing tables: add columns that may be missing from older schemas.
  // SQLite doesn't support ADD COLUMN IF NOT EXISTS, so we catch and ignore errors.
  const migrations: string[] = [
    `ALTER TABLE staff ADD COLUMN profile_image_url TEXT`,
  ];
  for (const migrationSql of migrations) {
    try {
      await client.execute(migrationSql);
      console.warn(`[db] Migration applied: ${migrationSql}`);
    } catch {
      // Column already exists — ignore
    }
  }

  const mode = process.env.TURSO_DATABASE_URL ? "Turso" : "local SQLite";
  console.warn(`[db] Tables created (${mode})`);
}

function getInstance(): DrizzleDb {
  if (!_db) {
    _db = createDb();
    _initPromise = initLocalDb(_db).catch((e) =>
      console.error("[db] initLocalDb error:", e)
    );
  }
  return _db;
}

/**
 * Returns a ready-to-use DB instance.
 * Waits for table creation (CREATE TABLE IF NOT EXISTS) to complete.
 * Works for both Turso cloud and local SQLite fallback.
 */
export async function getDbReady(): Promise<DrizzleDb> {
  const db = getInstance();
  if (_initPromise) await _initPromise;
  return db;
}

/**
 * Lazy proxy for convenience — use getDbReady() in API routes where
 * local SQLite fallback table initialization must complete first.
 */
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    const instance = getInstance();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
