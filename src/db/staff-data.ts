import type { NewStaff, NewStaffSchedule } from "./schema";

export const staffSeedData: Omit<NewStaff, "id" | "isActive" | "createdAt" | "updatedAt">[] = [
  {
    name: "田中 花子",
    role: "practitioner",
    specialties: JSON.stringify(["acupuncture", "chiropractic"]),
    color: "#f472b6",
    sortOrder: 1,
  },
  {
    name: "鈴木 太郎",
    role: "practitioner",
    specialties: JSON.stringify(["chiropractic", "massage"]),
    color: "#60a5fa",
    sortOrder: 2,
  },
  {
    name: "佐藤 美咲",
    role: "practitioner",
    specialties: JSON.stringify(["acupuncture", "massage"]),
    color: "#34d399",
    sortOrder: 3,
  },
];

/**
 * Generate default staff schedules for a given staffId.
 * - Mon-Fri: 09:00-12:30, 15:00-20:00
 * - Sat: 09:00-14:00
 * - Sun: isOff=true
 */
export function generateStaffScheduleSeedData(
  staffId: string,
): Omit<NewStaffSchedule, "id" | "createdAt" | "updatedAt">[] {
  const schedules: Omit<NewStaffSchedule, "id" | "createdAt" | "updatedAt">[] = [];

  // Monday(1) - Friday(5): two periods
  for (let day = 1; day <= 5; day++) {
    schedules.push(
      {
        staffId,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "12:30",
        isOff: false,
      },
      {
        staffId,
        dayOfWeek: day,
        startTime: "15:00",
        endTime: "20:00",
        isOff: false,
      },
    );
  }

  // Saturday(6): one period
  schedules.push({
    staffId,
    dayOfWeek: 6,
    startTime: "09:00",
    endTime: "14:00",
    isOff: false,
  });

  // Sunday(0): off
  schedules.push({
    staffId,
    dayOfWeek: 0,
    startTime: "00:00",
    endTime: "00:00",
    isOff: true,
  });

  return schedules;
}
