import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { menus, schedules } from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

const menuData = [
  // 鍼灸
  {
    category: "acupuncture" as const,
    name: "はり治療",
    description:
      "経験豊富な鍼灸師が、お身体の状態に合わせてツボを選び、痛みやコリを改善します。使い捨ての鍼を使用し、衛生面も安心です。",
    duration: 30,
    price: 4400,
    targetSymptoms: JSON.stringify(["肩こり", "腰痛", "頭痛", "神経痛"]),
    sortOrder: 1,
  },
  {
    category: "acupuncture" as const,
    name: "お灸治療",
    description:
      "じんわりとした温熱で血行を促進し、冷え性や慢性的な痛みを和らげます。リラックス効果も高く、自律神経の調整にも効果的です。",
    duration: 30,
    price: 3300,
    targetSymptoms: JSON.stringify(["冷え性", "むくみ", "自律神経の乱れ", "不眠"]),
    sortOrder: 2,
  },
  {
    category: "acupuncture" as const,
    name: "鍼灸総合コース",
    description:
      "はりとお灸を組み合わせた総合的な施術です。お身体全体のバランスを整え、様々な症状に対応します。じっくりとしたカウンセリングの後、最適な施術プランをご提案します。",
    duration: 60,
    price: 6600,
    targetSymptoms: JSON.stringify(["全身の不調", "疲労回復", "体質改善", "ストレス"]),
    sortOrder: 3,
  },
  {
    category: "acupuncture" as const,
    name: "美容鍼",
    description:
      "お顔のツボに鍼を刺すことで、血行促進・リフトアップ・肌のハリ改善を目指します。エイジングケアやお肌のお悩みにおすすめです。",
    duration: 50,
    price: 7700,
    targetSymptoms: JSON.stringify(["たるみ", "くすみ", "ほうれい線", "むくみ"]),
    sortOrder: 4,
  },
  // 整体
  {
    category: "chiropractic" as const,
    name: "骨盤矯正",
    description:
      "骨盤の歪みを丁寧に整え、姿勢改善と腰痛予防を行います。デスクワークの方や立ち仕事の方に特におすすめです。",
    duration: 30,
    price: 4400,
    targetSymptoms: JSON.stringify(["骨盤の歪み", "腰痛", "姿勢の悪さ", "脚の長さの違い"]),
    sortOrder: 5,
  },
  {
    category: "chiropractic" as const,
    name: "姿勢改善コース",
    description:
      "全身の筋肉・骨格のバランスを調整し、正しい姿勢を取り戻します。猫背やストレートネックの改善に効果的です。",
    duration: 45,
    price: 5500,
    targetSymptoms: JSON.stringify(["猫背", "ストレートネック", "肩こり", "首の痛み"]),
    sortOrder: 6,
  },
  {
    category: "chiropractic" as const,
    name: "産後骨盤ケア",
    description:
      "出産後に開いた骨盤を優しく整えます。産後の腰痛や体型の変化にお悩みの方に最適なコースです。",
    duration: 40,
    price: 5500,
    targetSymptoms: JSON.stringify(["産後の腰痛", "骨盤の開き", "体型変化", "尿漏れ"]),
    sortOrder: 7,
  },
  // マッサージ
  {
    category: "massage" as const,
    name: "全身マッサージ 30分",
    description: "全身をほぐす30分のショートコース。お時間のない方にもおすすめです。",
    duration: 30,
    price: 3300,
    targetSymptoms: JSON.stringify(["全身の疲れ", "肩こり", "腰痛"]),
    sortOrder: 8,
  },
  {
    category: "massage" as const,
    name: "全身マッサージ 60分",
    description:
      "じっくり60分かけて全身をほぐします。疲れが溜まっている方、リラックスしたい方におすすめです。",
    duration: 60,
    price: 5500,
    targetSymptoms: JSON.stringify(["全身の疲れ", "慢性的な肩こり", "腰痛", "リラクゼーション"]),
    sortOrder: 9,
  },
  {
    category: "massage" as const,
    name: "肩・首集中ケア",
    description:
      "肩と首を集中的にほぐします。デスクワークやスマートフォンの使いすぎによる肩こり・首の痛みに効果的です。",
    duration: 30,
    price: 3300,
    targetSymptoms: JSON.stringify(["肩こり", "首の痛み", "頭痛", "眼精疲労"]),
    sortOrder: 10,
  },
  {
    category: "massage" as const,
    name: "フットケア",
    description:
      "足裏からふくらはぎまでを丁寧にケアします。立ち仕事やむくみが気になる方におすすめです。",
    duration: 30,
    price: 3300,
    targetSymptoms: JSON.stringify(["足のむくみ", "足の疲れ", "冷え性", "立ち仕事の疲労"]),
    sortOrder: 11,
  },
];

const scheduleData = [
  // 月曜（1）午前
  { dayOfWeek: 1, startTime: "09:00", endTime: "12:30", slotInterval: 30, maxSlots: 2, isHoliday: false },
  // 月曜（1）午後
  { dayOfWeek: 1, startTime: "15:00", endTime: "20:00", slotInterval: 30, maxSlots: 2, isHoliday: false },
  // 火曜（2）
  { dayOfWeek: 2, startTime: "09:00", endTime: "12:30", slotInterval: 30, maxSlots: 2, isHoliday: false },
  { dayOfWeek: 2, startTime: "15:00", endTime: "20:00", slotInterval: 30, maxSlots: 2, isHoliday: false },
  // 水曜（3）
  { dayOfWeek: 3, startTime: "09:00", endTime: "12:30", slotInterval: 30, maxSlots: 2, isHoliday: false },
  { dayOfWeek: 3, startTime: "15:00", endTime: "20:00", slotInterval: 30, maxSlots: 2, isHoliday: false },
  // 木曜（4）
  { dayOfWeek: 4, startTime: "09:00", endTime: "12:30", slotInterval: 30, maxSlots: 2, isHoliday: false },
  { dayOfWeek: 4, startTime: "15:00", endTime: "20:00", slotInterval: 30, maxSlots: 2, isHoliday: false },
  // 金曜（5）
  { dayOfWeek: 5, startTime: "09:00", endTime: "12:30", slotInterval: 30, maxSlots: 2, isHoliday: false },
  { dayOfWeek: 5, startTime: "15:00", endTime: "20:00", slotInterval: 30, maxSlots: 2, isHoliday: false },
  // 土曜（6）
  { dayOfWeek: 6, startTime: "09:00", endTime: "14:00", slotInterval: 30, maxSlots: 2, isHoliday: false },
  // 日曜（0）休業
  { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", slotInterval: 30, maxSlots: 0, isHoliday: true },
];

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(menus);
  await db.delete(schedules);

  // Insert menus
  for (const menu of menuData) {
    await db.insert(menus).values(menu);
  }
  console.log(`Inserted ${menuData.length} menus`);

  // Insert schedules
  for (const schedule of scheduleData) {
    await db.insert(schedules).values(schedule);
  }
  console.log(`Inserted ${scheduleData.length} schedules`);

  console.log("Seed completed!");
}

seed().catch(console.error);
