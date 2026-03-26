import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDbReady } from "@/db";
import { schedules } from "@/db/schema";
import { isNull, isNotNull, asc } from "drizzle-orm";
import { scheduleUpdateSchema } from "@/lib/validators/schedule";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDbReady();
    const allSchedules = await db.select().from(schedules).orderBy(asc(schedules.dayOfWeek));
    return NextResponse.json({ schedules: allSchedules });
  } catch (error) {
    console.error("Admin schedule error:", error);
    return NextResponse.json({ error: "スケジュールの取得に失敗しました" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDbReady();
    const body = await request.json();
    const parsed = scheduleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "入力内容に誤りがあります" },
        { status: 400 },
      );
    }

    const { weeklyDefaults, holidays } = parsed.data;

    // Delete existing weekly defaults (non-specific-date entries)
    await db.delete(schedules).where(isNull(schedules.specificDate));

    // Insert new weekly defaults
    for (const wd of weeklyDefaults) {
      if (wd.isHoliday) {
        await db.insert(schedules).values({
          dayOfWeek: wd.dayOfWeek,
          startTime: "00:00",
          endTime: "00:00",
          isHoliday: true,
          maxSlots: 0,
        });
      } else {
        for (const slot of wd.slots) {
          await db.insert(schedules).values({
            dayOfWeek: wd.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotInterval: slot.slotInterval,
            maxSlots: slot.maxSlots,
            isHoliday: false,
          });
        }
      }
    }

    // Handle specific date holidays
    if (holidays && holidays.length > 0) {
      // Delete existing specific date entries
      await db.delete(schedules).where(isNotNull(schedules.specificDate));

      for (const h of holidays) {
        await db.insert(schedules).values({
          specificDate: h.date,
          startTime: "00:00",
          endTime: "00:00",
          isHoliday: h.isHoliday,
          maxSlots: 0,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin schedule update error:", error);
    return NextResponse.json({ error: "スケジュールの更新に失敗しました" }, { status: 500 });
  }
}
