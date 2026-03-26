import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDbReady } from "@/db";
import { staff, staffSchedules } from "@/db/schema";
import { eq, isNull, isNotNull, and, asc } from "drizzle-orm";
import { staffScheduleUpdateSchema } from "@/lib/validators/staff";

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
    // Verify staff exists
    const staffResult = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
    if (staffResult.length === 0) {
      return NextResponse.json({ error: "スタッフが見つかりません" }, { status: 404 });
    }

    const schedules = await db
      .select()
      .from(staffSchedules)
      .where(eq(staffSchedules.staffId, id))
      .orderBy(asc(staffSchedules.dayOfWeek));

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Admin staff schedule error:", error);
    return NextResponse.json({ error: "勤務スケジュールの取得に失敗しました" }, { status: 500 });
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
    // Verify staff exists
    const staffResult = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
    if (staffResult.length === 0) {
      return NextResponse.json({ error: "スタッフが見つかりません" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = staffScheduleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "入力内容に誤りがあります" },
        { status: 400 },
      );
    }

    const { weeklyDefaults, specificDates } = parsed.data;

    // Update all schedules in a transaction to prevent data inconsistency
    await db.transaction(async (tx) => {
      // Delete existing weekly defaults for this staff
      await tx
        .delete(staffSchedules)
        .where(
          and(
            eq(staffSchedules.staffId, id),
            isNull(staffSchedules.specificDate),
          ),
        );

      // Batch insert new weekly defaults
      if (weeklyDefaults.length > 0) {
        await tx.insert(staffSchedules).values(
          weeklyDefaults.map((wd) => ({
            staffId: id,
            dayOfWeek: wd.dayOfWeek,
            startTime: wd.isOff ? "00:00" : wd.startTime,
            endTime: wd.isOff ? "00:00" : wd.endTime,
            isOff: wd.isOff,
          })),
        );
      }

      // Handle specific dates if provided
      if (specificDates && specificDates.length > 0) {
        // Delete existing specific date entries for this staff
        await tx
          .delete(staffSchedules)
          .where(
            and(
              eq(staffSchedules.staffId, id),
              isNotNull(staffSchedules.specificDate),
            ),
          );

        await tx.insert(staffSchedules).values(
          specificDates.map((sd) => ({
            staffId: id,
            specificDate: sd.specificDate,
            startTime: sd.isOff ? "00:00" : sd.startTime,
            endTime: sd.isOff ? "00:00" : sd.endTime,
            isOff: sd.isOff,
          })),
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin staff schedule update error:", error);
    return NextResponse.json({ error: "勤務スケジュールの更新に失敗しました" }, { status: 500 });
  }
}
