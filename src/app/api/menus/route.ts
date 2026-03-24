import { NextResponse } from "next/server";
import { db } from "@/db";
import { menus } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const allMenus = await db
      .select()
      .from(menus)
      .where(eq(menus.isActive, true))
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
