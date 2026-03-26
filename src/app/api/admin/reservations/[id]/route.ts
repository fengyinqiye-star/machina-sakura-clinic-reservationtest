import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { reservations, menus, staff } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  status: z
    .enum(["new", "confirmed", "completed", "cancelled"])
    .optional(),
  staffMemo: z.string().optional(),
});

const VALID_TRANSITIONS: Record<string, string[]> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const rows = await db
      .select({
        id: reservations.id,
        patientName: reservations.patientName,
        patientKana: reservations.patientKana,
        phone: reservations.phone,
        email: reservations.email,
        menuId: reservations.menuId,
        staffId: reservations.staffId,
        reservationDate: reservations.reservationDate,
        reservationTime: reservations.reservationTime,
        isFirstVisit: reservations.isFirstVisit,
        symptoms: reservations.symptoms,
        status: reservations.status,
        staffMemo: reservations.staffMemo,
        createdAt: reservations.createdAt,
        updatedAt: reservations.updatedAt,
        menuName: menus.name,
        menuCategory: menus.category,
        menuDuration: menus.duration,
        menuPrice: menus.price,
        staffName: staff.name,
      })
      .from(reservations)
      .leftJoin(menus, eq(reservations.menuId, menus.id))
      .leftJoin(staff, eq(reservations.staffId, staff.id))
      .where(eq(reservations.id, id))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ reservation: rows[0] });
  } catch (error) {
    console.error("Admin reservation detail error:", error);
    return NextResponse.json({ error: "予約詳細の取得に失敗しました" }, { status: 500 });
  }
}

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
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "入力内容に誤りがあります" }, { status: 400 });
    }

    const { status: newStatus, staffMemo } = parsed.data;

    // Get current reservation
    const current = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, id))
      .limit(1);

    if (current.length === 0) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    // Validate status transition
    if (newStatus) {
      const validTransitions = VALID_TRANSITIONS[current[0].status] || [];
      if (!validTransitions.includes(newStatus)) {
        return NextResponse.json(
          { error: `${current[0].status} から ${newStatus} への変更はできません` },
          { status: 400 },
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      updatedAt: sql`(datetime('now'))`,
    };
    if (newStatus) updateData.status = newStatus;
    if (staffMemo !== undefined) updateData.staffMemo = staffMemo;

    await db.update(reservations).set(updateData).where(eq(reservations.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin reservation update error:", error);
    return NextResponse.json({ error: "予約の更新に失敗しました" }, { status: 500 });
  }
}
