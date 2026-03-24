import { getDbReady } from "@/db";
import { schedules, reservations, menus, staff, staffSchedules } from "@/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";
import type { TimeSlot } from "@/types";
import { autoSeedMenusIfEmpty, autoSeedSchedulesIfEmpty, autoSeedStaffIfEmpty } from "@/db/auto-seed";

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

/**
 * Count how many active practitioners are working at a given time slot
 * on a given date, using the staffSchedules table.
 *
 * Returns 0 if no staff is available at that time.
 * Returns -1 if staff system is not configured (no staff OR no staffSchedules at all),
 * signaling the caller should fall back to schedules.maxSlots.
 */
async function getAvailableStaffCount(
  date: string,
  slotTime: string,
): Promise<number> {
  const db = await getDbReady();

  // Get all active practitioners
  const activeStaff = await db
    .select({ id: staff.id })
    .from(staff)
    .where(and(eq(staff.isActive, true), eq(staff.role, "practitioner")));

  if (activeStaff.length === 0) {
    return -1; // No staff registered -> fallback
  }

  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  const [slotH, slotM] = slotTime.split(":").map(Number);
  const slotMinutes = slotH * 60 + slotM;

  let availableCount = 0;
  let hasAnySchedule = false;

  for (const s of activeStaff) {
    // Check specific date schedules first
    let staffScheds = await db
      .select()
      .from(staffSchedules)
      .where(
        and(
          eq(staffSchedules.staffId, s.id),
          eq(staffSchedules.specificDate, date),
        ),
      );

    // Fall back to day-of-week schedules
    if (staffScheds.length === 0) {
      staffScheds = await db
        .select()
        .from(staffSchedules)
        .where(
          and(
            eq(staffSchedules.staffId, s.id),
            eq(staffSchedules.dayOfWeek, dayOfWeek),
          ),
        );
    }

    if (staffScheds.length === 0) continue;
    hasAnySchedule = true;

    // If any schedule says isOff, this staff is off for the day
    if (staffScheds.some((ss) => ss.isOff)) continue;

    // Check if the slot time falls within any of this staff's working periods
    const isWorking = staffScheds.some((ss) => {
      const [startH, startM] = ss.startTime.split(":").map(Number);
      const [endH, endM] = ss.endTime.split(":").map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      return slotMinutes >= startMin && slotMinutes < endMin;
    });

    if (isWorking) {
      availableCount++;
    }
  }

  // If staff exist but none have schedules at all -> fallback
  if (!hasAnySchedule) {
    return -1;
  }

  return availableCount;
}

export async function getAvailableSlots(
  date: string,
  menuId: string,
): Promise<{ slots: TimeSlot[]; isHoliday: boolean }> {
  const db = await getDbReady();

  // メニューが空の場合は auto-seed してから再クエリ
  let menu = await db.select().from(menus).where(eq(menus.id, menuId)).limit(1);
  if (menu.length === 0) {
    await autoSeedMenusIfEmpty();
    menu = await db.select().from(menus).where(eq(menus.id, menuId)).limit(1);
  }
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

  // If still empty, the DB may not have been seeded yet — auto-seed and retry
  if (scheduleRows.length === 0) {
    await autoSeedSchedulesIfEmpty();
    await autoSeedStaffIfEmpty();
    scheduleRows = await db
      .select()
      .from(schedules)
      .where(eq(schedules.specificDate, date));
    if (scheduleRows.length === 0) {
      scheduleRows = await db
        .select()
        .from(schedules)
        .where(eq(schedules.dayOfWeek, dayOfWeek));
    }
  } else {
    // Ensure staff are seeded even if schedules already exist
    await autoSeedStaffIfEmpty();
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
  let fallbackMaxSlots = 2;
  for (const schedule of scheduleRows) {
    const times = generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.slotInterval,
      menuDuration,
    );
    allSlotTimes.push(...times);
    fallbackMaxSlots = schedule.maxSlots;
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

  // Build slots with staff-based availability
  const slots: TimeSlot[] = [];
  for (const time of uniqueSlotTimes) {
    const count = reservationCountMap.get(time) || 0;

    // Get staff count for this specific time slot
    const staffCount = await getAvailableStaffCount(date, time);

    // Use staff count if available, otherwise fall back to schedules.maxSlots
    const maxSlots = staffCount >= 0 ? staffCount : fallbackMaxSlots;

    let available = count < maxSlots;

    if (isToday) {
      const [slotH, slotM] = time.split(":").map(Number);
      const slotMinutes = slotH * 60 + slotM;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (slotMinutes <= nowMinutes) {
        available = false;
      }
    }

    slots.push({
      time,
      available,
      availableStaffCount: maxSlots,
    });
  }

  return { slots, isHoliday: false };
}

/**
 * Get the max slots (available staff count) for a specific date/time,
 * used by the reservation POST endpoint for double-check.
 */
export async function getMaxSlotsForTime(
  date: string,
  time: string,
  fallbackMaxSlots: number,
): Promise<number> {
  await autoSeedStaffIfEmpty();
  const staffCount = await getAvailableStaffCount(date, time);
  return staffCount >= 0 ? staffCount : fallbackMaxSlots;
}
