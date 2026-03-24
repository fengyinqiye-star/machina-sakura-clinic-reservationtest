import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { menus } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { menuSchema } from "@/lib/validators/menu";

// Partial schema for PATCH updates - all fields optional
const menuPatchSchema = menuSchema.partial();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    // Validate with Zod partial schema
    const parsed = menuPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "入力内容に誤りがあります" },
        { status: 400 },
      );
    }

    // Validate that menu exists
    const existing = await db.select().from(menus).where(eq(menus.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "メニューが見つかりません" }, { status: 404 });
    }

    const validatedData = parsed.data;
    const updateData: Record<string, unknown> = {
      updatedAt: sql`(datetime('now'))`,
    };

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.duration !== undefined) updateData.duration = validatedData.duration;
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.targetSymptoms !== undefined) updateData.targetSymptoms = validatedData.targetSymptoms;
    if (validatedData.sortOrder !== undefined) updateData.sortOrder = validatedData.sortOrder;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    await db.update(menus).set(updateData).where(eq(menus.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin menu update error:", error);
    return NextResponse.json({ error: "メニューの更新に失敗しました" }, { status: 500 });
  }
}
