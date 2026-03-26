import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { attendance, staff, reservations } from "@/db/schema";
import { eq, and, gte, lte, sql, asc, desc, ne } from "drizzle-orm";

/**
 * GET /api/admin/attendance
 * Query params:
 *   - month: YYYY-MM (required)
 *   - staffId: filter by specific staff (optional)
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const month = searchParams.get("month");
    const staffId = searchParams.get("staffId");

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "month パラメータ (YYYY-MM) が必要です" },
        { status: 400 },
      );
    }

    const startDate = `${month}-01`;
    // Calculate end date of month
    const [year, mon] = month.split("-").map(Number);
    const lastDay = new Date(year, mon, 0).getDate();
    const endDate = `${month}-${lastDay.toString().padStart(2, "0")}`;

    // Build conditions
    const conditions = [
      gte(attendance.date, startDate),
      lte(attendance.date, endDate),
    ];
    if (staffId) {
      conditions.push(eq(attendance.staffId, staffId));
    }

    // Get attendance records
    const records = await db
      .select({
        id: attendance.id,
        staffId: attendance.staffId,
        date: attendance.date,
        clockIn: attendance.clockIn,
        clockOut: attendance.clockOut,
        breakMinutes: attendance.breakMinutes,
        note: attendance.note,
        staffName: staff.name,
        staffColor: staff.color,
      })
      .from(attendance)
      .leftJoin(staff, eq(attendance.staffId, staff.id))
      .where(and(...conditions))
      .orderBy(asc(attendance.date), asc(attendance.clockIn));

    // Get all active staff for staff selector
    const allStaff = await db
      .select({ id: staff.id, name: staff.name, color: staff.color })
      .from(staff)
      .where(eq(staff.isActive, true))
      .orderBy(asc(staff.sortOrder));

    // Get reservation counts for each staff per day in this month
    const reservationStats = await db
      .select({
        staffId: reservations.staffId,
        date: reservations.reservationDate,
        count: sql<number>`count(*)`,
      })
      .from(reservations)
      .where(
        and(
          gte(reservations.reservationDate, startDate),
          lte(reservations.reservationDate, endDate),
          ne(reservations.status, "cancelled"),
        ),
      )
      .groupBy(reservations.staffId, reservations.reservationDate);

    // Build monthly summary per staff
    const summaryMap = new Map<string, {
      staffId: string;
      staffName: string;
      totalWorkMinutes: number;
      totalReservations: number;
      workDays: number;
    }>();

    for (const record of records) {
      if (!record.staffId) continue;
      if (!summaryMap.has(record.staffId)) {
        summaryMap.set(record.staffId, {
          staffId: record.staffId,
          staffName: record.staffName || "",
          totalWorkMinutes: 0,
          totalReservations: 0,
          workDays: 0,
        });
      }

      const entry = summaryMap.get(record.staffId)!;
      if (record.clockIn && record.clockOut) {
        const [inH, inM] = record.clockIn.split(":").map(Number);
        const [outH, outM] = record.clockOut.split(":").map(Number);
        const workMin = (outH * 60 + outM) - (inH * 60 + inM) - record.breakMinutes;
        if (workMin > 0) {
          entry.totalWorkMinutes += workMin;
          entry.workDays += 1;
        }
      }
    }

    // Add reservation counts to summaries
    for (const stat of reservationStats) {
      if (stat.staffId && summaryMap.has(stat.staffId)) {
        summaryMap.get(stat.staffId)!.totalReservations += stat.count;
      }
    }

    return NextResponse.json({
      records,
      staff: allStaff,
      summary: Array.from(summaryMap.values()),
      reservationStats,
    });
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: "勤怠情報の取得に失敗しました" }, { status: 500 });
  }
}

/**
 * POST /api/admin/attendance
 * Create or update attendance record (clock in/out)
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { staffId, date, action, note } = body;

    if (!staffId || !date || !action) {
      return NextResponse.json(
        { error: "staffId, date, action が必要です" },
        { status: 400 },
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "日付の形式が正しくありません" },
        { status: 400 },
      );
    }

    // Get current time in HH:MM format
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    // Check for existing record today
    const existing = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.staffId, staffId), eq(attendance.date, date)))
      .limit(1);

    if (action === "clockIn") {
      if (existing.length > 0 && existing[0].clockIn) {
        return NextResponse.json(
          { error: "本日は既に出勤打刻済みです" },
          { status: 400 },
        );
      }

      if (existing.length > 0) {
        await db
          .update(attendance)
          .set({ clockIn: currentTime, updatedAt: sql`(datetime('now'))` })
          .where(eq(attendance.id, existing[0].id));
      } else {
        await db.insert(attendance).values({
          staffId,
          date,
          clockIn: currentTime,
        });
      }
    } else if (action === "clockOut") {
      if (existing.length === 0 || !existing[0].clockIn) {
        return NextResponse.json(
          { error: "出勤打刻がありません" },
          { status: 400 },
        );
      }
      if (existing[0].clockOut) {
        return NextResponse.json(
          { error: "本日は既に退勤打刻済みです" },
          { status: 400 },
        );
      }

      await db
        .update(attendance)
        .set({ clockOut: currentTime, updatedAt: sql`(datetime('now'))` })
        .where(eq(attendance.id, existing[0].id));
    } else if (action === "update") {
      // Manual update of record
      const { clockIn, clockOut, breakMinutes } = body;
      if (existing.length === 0) {
        await db.insert(attendance).values({
          staffId,
          date,
          clockIn: clockIn || null,
          clockOut: clockOut || null,
          breakMinutes: breakMinutes || 0,
          note: note || null,
        });
      } else {
        const updateData: Record<string, unknown> = {
          updatedAt: sql`(datetime('now'))`,
        };
        if (clockIn !== undefined) updateData.clockIn = clockIn || null;
        if (clockOut !== undefined) updateData.clockOut = clockOut || null;
        if (breakMinutes !== undefined) updateData.breakMinutes = breakMinutes;
        if (note !== undefined) updateData.note = note || null;
        await db
          .update(attendance)
          .set(updateData)
          .where(eq(attendance.id, existing[0].id));
      }
    } else {
      return NextResponse.json(
        { error: "action は clockIn, clockOut, update のいずれかです" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ error: "勤怠記録の更新に失敗しました" }, { status: 500 });
  }
}
