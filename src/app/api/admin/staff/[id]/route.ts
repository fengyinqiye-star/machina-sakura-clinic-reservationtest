import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDbReady } from "@/db";
import { staff, staffSchedules } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { staffSchema } from "@/lib/validators/staff";

const staffPatchSchema = staffSchema.partial();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const db = await getDbReady();
    const result = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: "スタッフが見つかりません" }, { status: 404 });
    }
    return NextResponse.json({ staff: result[0] });
  } catch (error) {
    console.error("Admin staff detail error:", error);
    return NextResponse.json({ error: "スタッフ情報の取得に失敗しました" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const db = await getDbReady();
    const body = await request.json();
    const parsed = staffPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "入力内容に誤りがあります" },
        { status: 400 },
      );
    }

    const existing = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "スタッフが見つかりません" }, { status: 404 });
    }

    const validatedData = parsed.data;
    const updateData: Record<string, unknown> = {
      updatedAt: sql`(datetime('now'))`,
    };

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.role !== undefined) updateData.role = validatedData.role;
    if (validatedData.specialties !== undefined) updateData.specialties = validatedData.specialties;
    if (validatedData.color !== undefined) updateData.color = validatedData.color;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    if (validatedData.sortOrder !== undefined) updateData.sortOrder = validatedData.sortOrder;

    await db.update(staff).set(updateData).where(eq(staff.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin staff update error:", error);
    return NextResponse.json({ error: "スタッフの更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const db = await getDbReady();
    const existing = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "スタッフが見つかりません" }, { status: 404 });
    }

    // Delete staff and related schedules in a transaction
    await db.transaction(async (tx) => {
      await tx.delete(staffSchedules).where(eq(staffSchedules.staffId, id));
      await tx.delete(staff).where(eq(staff.id, id));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin staff delete error:", error);
    return NextResponse.json({ error: "スタッフの削除に失敗しました" }, { status: 500 });
  }
}
