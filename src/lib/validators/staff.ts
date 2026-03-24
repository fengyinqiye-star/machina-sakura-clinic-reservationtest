import { z } from "zod";

export const staffSchema = z.object({
  name: z.string().min(1, "スタッフ名を入力してください").max(50),
  role: z.enum(["practitioner", "reception"], {
    errorMap: () => ({ message: "役割を選択してください" }),
  }),
  specialties: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "有効なカラーコードを入力してください").default("#f472b6"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export type StaffInput = z.infer<typeof staffSchema>;

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const staffScheduleUpdateSchema = z.object({
  weeklyDefaults: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(timeRegex, "時刻はHH:MM形式で入力してください"),
      endTime: z.string().regex(timeRegex, "時刻はHH:MM形式で入力してください"),
      isOff: z.boolean(),
    }),
  ),
  specificDates: z
    .array(
      z.object({
        specificDate: z.string().regex(dateRegex, "日付はYYYY-MM-DD形式で入力してください"),
        startTime: z.string().regex(timeRegex, "時刻はHH:MM形式で入力してください"),
        endTime: z.string().regex(timeRegex, "時刻はHH:MM形式で入力してください"),
        isOff: z.boolean(),
      }),
    )
    .optional(),
});

export type StaffScheduleUpdateInput = z.infer<typeof staffScheduleUpdateSchema>;
