import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { menus, schedules } from "./schema";
import { menuSeedData, scheduleSeedData } from "./menu-data";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function seed() {
  console.log("Seeding database...");

  // Check if menus already exist — skip seed if data is present
  const existingMenus = await db.select().from(menus);
  if (existingMenus.length > 0) {
    console.log(`Menus already exist (${existingMenus.length} rows), skipping seed.`);
    return;
  }

  // Insert menus
  for (const menu of menuSeedData) {
    await db.insert(menus).values(menu);
  }
  console.log(`Inserted ${menuSeedData.length} menus`);

  // Insert schedules only if empty (preserve admin-customised schedules)
  const existingSchedules = await db.select().from(schedules);
  if (existingSchedules.length > 0) {
    console.log(`Schedules already exist (${existingSchedules.length} rows), skipping.`);
  } else {
    for (const schedule of scheduleSeedData) {
      await db.insert(schedules).values(schedule);
    }
    console.log(`Inserted ${scheduleSeedData.length} schedules`);
  }

  console.log("Seed completed!");
}

seed().catch(console.error);
