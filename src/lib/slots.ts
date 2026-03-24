import { db } from "@/db";
import { schedules, reservations, menus } from "@/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";
import type { TimeSlot } from "@/types";

function generateTimeSlots(
  startTime: string,
  endTime: string,
  interval: number,
  menuDuration: number,
): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let m = startMinutes; m + menuDuration <= endMinutes; m += interval) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
  }
  return slots;
}

export async function getAvailableSlots(
  date: string,
  menuId: string,
): Promise<{ slots: TimeSlot[]; isHoliday: boolean }> {
  // Get the menu to know duration
  const menu = await db.select().from(menus).where(eq(menus.id, menuId)).limit(1);
  if (menu.length === 0) {
    throw new Error("メニューが見つかりません");
  }
  const menuDuration = menu[0].duration;

  // Get date's day of week (0=Sun, 6=Sat)
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // Check specific date schedule first, then fall back to day-of-week default
  let scheduleRows = await db
    .select()
    .from(schedules)
    .where(eq(schedules.specificDate, date));

  if (scheduleRows.length === 0) {
    scheduleRows = await db
      .select()
      .from(schedules)
      .where(eq(schedules.dayOfWeek, dayOfWeek));
  }

  if (scheduleRows.length === 0) {
    return { slots: [], isHoliday: true };
  }

  // Check if it's a holiday
  if (scheduleRows.some((s) => s.isHoliday)) {
    return { slots: [], isHoliday: true };
  }

  // Generate all time slots from all schedule periods
  const allSlotTimes: string[] = [];
  let maxSlots = 2;
  for (const schedule of scheduleRows) {
    const times = generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.slotInterval,
      menuDuration,
    );
    allSlotTimes.push(...times);
    maxSlots = schedule.maxSlots;
  }

  // Remove duplicates and sort
  const uniqueSlotTimes = Array.from(new Set(allSlotTimes)).sort();

  // Get existing reservations for this date (not cancelled)
  const existingReservations = await db
    .select({
      time: reservations.reservationTime,
      count: sql<number>`count(*)`,
    })
    .from(reservations)
    .where(
      and(
        eq(reservations.reservationDate, date),
        ne(reservations.status, "cancelled"),
      ),
    )
    .groupBy(reservations.reservationTime);

  const reservationCountMap = new Map<string, number>();
  for (const r of existingReservations) {
    reservationCountMap.set(r.time, r.count);
  }

  // Check if current time has passed (for today)
  const now = new Date();
  const isToday =
    date ===
    `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

  const slots: TimeSlot[] = uniqueSlotTimes.map((time) => {
    const count = reservationCountMap.get(time) || 0;
    let available = count < maxSlots;

    if (isToday) {
      const [slotH, slotM] = time.split(":").map(Number);
      const slotMinutes = slotH * 60 + slotM;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (slotMinutes <= nowMinutes) {
        available = false;
      }
    }

    return { time, available };
  });

  return { slots, isHoliday: false };
}
