import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { reservations, menus, staff } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

    // Today's reservations
    const todayReservations = await db
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
        staffName: staff.name,
      })
      .from(reservations)
      .leftJoin(menus, eq(reservations.menuId, menus.id))
      .leftJoin(staff, eq(reservations.staffId, staff.id))
      .where(eq(reservations.reservationDate, today))
      .orderBy(reservations.reservationTime);

    // New (unconfirmed) count
    const newCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reservations)
      .where(eq(reservations.status, "new"));
    const newCount = newCountResult[0]?.count || 0;

    // Week summary
    const weekSummary: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(reservations)
        .where(eq(reservations.reservationDate, dateStr));
      weekSummary[dateStr] = countResult[0]?.count || 0;
    }

    return NextResponse.json({
      todayReservations,
      newCount,
      weekSummary,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "ダッシュボード情報の取得に失敗しました" }, { status: 500 });
  }
}
