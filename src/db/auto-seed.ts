/**
 * Auto-seed module — ensures DB has initial data on first access.
 *
 * Design decisions:
 * - Module-level lock prevents concurrent seed operations (race condition fix)
 * - Checks ALL menus (not just isActive=1) to avoid re-seeding when admin
 *   intentionally deactivates all menus
 * - Uses INSERT ... ON CONFLICT DO NOTHING for idempotent inserts
 * - Runs at most once per cold start (seedCompleted flag)
 */

import { db } from "@/db";
import { menus, schedules } from "@/db/schema";
import { sql } from "drizzle-orm";
import { menuSeedData, scheduleSeedData } from "@/db/menu-data";

/** Module-level flags to prevent concurrent/duplicate seeding */
let menuSeedInProgress = false;
let menuSeedCompleted = false;
let scheduleSeedInProgress = false;
let scheduleSeedCompleted = false;

/**
 * Auto-seed menus if the table is completely empty.
 * Safe against concurrent invocations and admin-deactivated menus.
 */
export async function autoSeedMenusIfEmpty(): Promise<void> {
  // Skip if already seeded this cold-start cycle
  if (menuSeedCompleted) return;
  // Skip if another request is already seeding
  if (menuSeedInProgress) {
    // Wait briefly for the other seed to finish
    await new Promise((r) => setTimeout(r, 1000));
    return;
  }

  menuSeedInProgress = true;
  try {
    // Count ALL menus (including inactive) to avoid re-seeding when admin
    // deactivated all menus intentionally
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(menus);
    const totalCount = result[0]?.count ?? 0;

    if (totalCount > 0) {
      menuSeedCompleted = true;
      return;
    }

    console.warn("[auto-seed] No menus found in DB, inserting seed data...");

    // Batch insert with conflict guard for idempotency
    for (const menu of menuSeedData) {
      await db.insert(menus).values(menu).onConflictDoNothing();
    }

    console.warn(`[auto-seed] Inserted ${menuSeedData.length} menus`);
    menuSeedCompleted = true;
  } catch (error) {
    console.error("[auto-seed] Failed to seed menus:", error);
    throw error;
  } finally {
    menuSeedInProgress = false;
  }
}

/**
 * Auto-seed schedules if the table is completely empty.
 * Safe against concurrent invocations.
 */
export async function autoSeedSchedulesIfEmpty(): Promise<void> {
  if (scheduleSeedCompleted) return;
  if (scheduleSeedInProgress) {
    await new Promise((r) => setTimeout(r, 1000));
    return;
  }

  scheduleSeedInProgress = true;
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(schedules);
    const totalCount = result[0]?.count ?? 0;

    if (totalCount > 0) {
      scheduleSeedCompleted = true;
      return;
    }

    console.warn("[auto-seed] No schedules found in DB, inserting seed data...");

    for (const schedule of scheduleSeedData) {
      await db.insert(schedules).values(schedule).onConflictDoNothing();
    }

    console.warn(`[auto-seed] Inserted ${scheduleSeedData.length} schedules`);
    scheduleSeedCompleted = true;
  } catch (error) {
    console.error("[auto-seed] Failed to seed schedules:", error);
    throw error;
  } finally {
    scheduleSeedInProgress = false;
  }
}
