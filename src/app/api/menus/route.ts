import { NextResponse } from "next/server";
import { db } from "@/db";
import { menus } from "@/db/schema";
import { asc, sql } from "drizzle-orm";

export async function GET() {
  try {
    // SQLite stores booleans as 0/1 integers.
    // eq(menus.isActive, true) can produce "is_active = true" which some
    // SQLite drivers do not evaluate correctly. Use a raw SQL fragment
    // to ensure the comparison is against the integer literal 1.
    const allMenus = await db
      .select()
      .from(menus)
      .where(sql`${menus.isActive} = 1`)
      .orderBy(asc(menus.sortOrder));

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
