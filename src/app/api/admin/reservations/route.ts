import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { reservations, menus, staff } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions: SQL[] = [];
    if (status) {
      conditions.push(eq(reservations.status, status as "new" | "confirmed" | "completed" | "cancelled"));
    }
    if (from) {
      conditions.push(gte(reservations.reservationDate, from));
    }
    if (to) {
      conditions.push(lte(reservations.reservationDate, to));
    }
    if (category) {
      conditions.push(eq(menus.category, category as "acupuncture" | "chiropractic" | "massage"));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reservations)
      .leftJoin(menus, eq(reservations.menuId, menus.id))
      .leftJoin(staff, eq(reservations.staffId, staff.id))
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Get paginated results
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
        staffName: staff.name,
      })
      .from(reservations)
      .leftJoin(menus, eq(reservations.menuId, menus.id))
      .leftJoin(staff, eq(reservations.staffId, staff.id))
      .where(whereClause)
      .orderBy(desc(reservations.reservationDate), desc(reservations.reservationTime))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      reservations: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin reservations error:", error);
    return NextResponse.json({ error: "予約一覧の取得に失敗しました" }, { status: 500 });
  }
}
