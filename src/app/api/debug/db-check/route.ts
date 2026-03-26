import { NextResponse } from "next/server";
import { getDbReady } from "@/db";
import { sql } from "drizzle-orm";
import { staff } from "@/db/schema";
import { autoSeedStaffIfEmpty } from "@/db/auto-seed";

export async function GET() {
  const results: Record<string, unknown> = {};
  try {
    const db = await getDbReady();

    // 1. List all tables
    const tables = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table'`);
    results.tables = tables;

    // 2. Staff table info
    const staffInfo = await db.all(sql`PRAGMA table_info(staff)`);
    results.staffColumns = staffInfo;

    // 3. Staff count
    const staffCount = await db.all(sql`SELECT count(*) as cnt FROM staff`);
    results.staffCount = staffCount;

    // 4. All staff rows
    const staffRows = await db.all(sql`SELECT * FROM staff`);
    results.staffRows = staffRows;

    // 5. Try auto-seed
    try {
      await autoSeedStaffIfEmpty();
      results.seedResult = "success";
    } catch (seedError) {
      results.seedResult = "failed";
      results.seedError = String(seedError);
    }

    // 6. Re-check staff count after seed
    const staffCountAfter = await db.all(sql`SELECT count(*) as cnt FROM staff`);
    results.staffCountAfterSeed = staffCountAfter;

    // 7. Check active practitioners
    const activePractitioners = await db.select().from(staff);
    results.allStaffViaOrm = activePractitioners;

  } catch (error) {
    results.error = String(error);
  }

  return NextResponse.json(results, {
    headers: { "Cache-Control": "no-store" }
  });
}
