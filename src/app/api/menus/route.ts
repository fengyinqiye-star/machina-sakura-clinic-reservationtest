import { NextResponse } from "next/server";
import { db } from "@/db";
import { menus } from "@/db/schema";
import { asc, sql } from "drizzle-orm";
import { autoSeedMenusIfEmpty, autoSeedSchedulesIfEmpty } from "@/db/auto-seed";

export async function GET() {
  try {
    let allMenus = await db
      .select()
      .from(menus)
      .where(sql`${menus.isActive} = 1`)
      .orderBy(asc(menus.sortOrder));

    // If no active menus, check if DB is truly empty (vs admin deactivated all)
    if (allMenus.length === 0) {
      // Count ALL menus including inactive
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(menus);
      const totalCount = totalResult[0]?.count ?? 0;

      if (totalCount === 0) {
        // DB is empty — auto-seed menus and schedules
        console.warn("[menus/GET] DB empty, triggering auto-seed...");
        await autoSeedMenusIfEmpty();
        await autoSeedSchedulesIfEmpty();

        // Re-fetch after seeding
        allMenus = await db
          .select()
          .from(menus)
          .where(sql`${menus.isActive} = 1`)
          .orderBy(asc(menus.sortOrder));
      }
      // If totalCount > 0 but allMenus is empty, admin deactivated all — return empty normally
    }

    return NextResponse.json(
      { menus: allMenus },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch menus:", error);
    return NextResponse.json({ error: "メニューの取得に失敗しました" }, { status: 500 });
  }
}
