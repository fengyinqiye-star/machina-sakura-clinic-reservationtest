import { z } from "zod";

export const menuSchema = z.object({
  name: z.string().min(1, "メニュー名を入力してください").max(100),
  category: z.enum(["acupuncture", "chiropractic", "massage"], {
    errorMap: () => ({ message: "カテゴリを選択してください" }),
  }),
  description: z.string().max(1000, "説明は1000文字以内で入力してください").default(""),
  duration: z.number().min(10, "10分以上で設定してください").max(180, "180分以内で設定してください"),
  price: z.number().min(0, "0円以上で設定してください"),
  targetSymptoms: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type MenuInput = z.infer<typeof menuSchema>;
