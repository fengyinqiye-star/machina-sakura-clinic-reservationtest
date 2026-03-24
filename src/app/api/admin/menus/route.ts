import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { menus } from "@/db/schema";
import { asc } from "drizzle-orm";
import { menuSchema } from "@/lib/validators/menu";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allMenus = await db.select().from(menus).orderBy(asc(menus.sortOrder));
    return NextResponse.json({ menus: allMenus });
  } catch (error) {
    console.error("Admin menus error:", error);
    return NextResponse.json({ error: "メニュー一覧の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = menuSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "入力内容に誤りがあります" },
        { status: 400 },
      );
    }

    const result = await db.insert(menus).values(parsed.data).returning();
    return NextResponse.json({ menu: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Admin menu create error:", error);
    return NextResponse.json({ error: "メニューの作成に失敗しました" }, { status: 500 });
  }
}
