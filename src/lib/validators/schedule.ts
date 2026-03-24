import { z } from "zod";

const timeSlotSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "時間の形式が正しくありません"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "時間の形式が正しくありません"),
  slotInterval: z.number().int().min(15).max(120).default(30),
  maxSlots: z.number().int().min(1).max(10).default(2),
});

export const weeklyDefaultSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isHoliday: z.boolean(),
  slots: z.array(timeSlotSchema),
});

export const holidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  isHoliday: z.boolean(),
});

export const scheduleUpdateSchema = z.object({
  weeklyDefaults: z.array(weeklyDefaultSchema),
  holidays: z.array(holidaySchema).optional(),
});

export type ScheduleUpdateInput = z.infer<typeof scheduleUpdateSchema>;
