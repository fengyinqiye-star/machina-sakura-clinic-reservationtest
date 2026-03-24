import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { asc } from "drizzle-orm";
import { staffSchema } from "@/lib/validators/staff";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allStaff = await db.select().from(staff).orderBy(asc(staff.sortOrder));
    return NextResponse.json({ staff: allStaff });
  } catch (error) {
    console.error("Admin staff error:", error);
    return NextResponse.json({ error: "スタッフ一覧の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = staffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "入力内容に誤りがあります" },
        { status: 400 },
      );
    }

    const result = await db.insert(staff).values(parsed.data).returning();
    return NextResponse.json({ staff: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Admin staff create error:", error);
    return NextResponse.json({ error: "スタッフの作成に失敗しました" }, { status: 500 });
  }
}
