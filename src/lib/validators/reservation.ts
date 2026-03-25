import { z } from "zod";

export const reservationSchema = z.object({
  menuId: z.string().min(1, "メニューを選択してください"),
  reservationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形式が正しくありません"),
  reservationTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "時間の形式が正しくありません"),
  patientName: z
    .string()
    .min(1, "氏名を入力してください")
    .max(50, "氏名は50文字以内で入力してください"),
  patientKana: z
    .string()
    .min(1, "フリガナを入力してください")
    .regex(/^[ァ-ヶー\s　]+$/, "フリガナはカタカナで入力してください"),
  phone: z
    .string()
    .regex(/^0\d{9,10}$/, "電話番号は0から始まる10〜11桁の数字で入力してください"),
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("メールアドレスの形式が正しくありません"),
  isFirstVisit: z.boolean(),
  symptoms: z
    .string()
    .max(500, "症状・ご要望は500文字以内で入力してください")
    .optional()
    .or(z.literal("")),
  honeypot: z.string().max(0, "").optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

export const patientInfoSchema = z.object({
  patientName: reservationSchema.shape.patientName,
  patientKana: reservationSchema.shape.patientKana,
  phone: reservationSchema.shape.phone,
  email: reservationSchema.shape.email,
  isFirstVisit: reservationSchema.shape.isFirstVisit,
  symptoms: reservationSchema.shape.symptoms,
});

export type PatientInfoInput = z.infer<typeof patientInfoSchema>;
