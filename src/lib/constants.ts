export const CLINIC_INFO = {
  name: "さくら鍼灸整骨院",
  nameEn: "Sakura Acupuncture Clinic",
  postalCode: "〒123-4567",
  address: "東京都渋谷区桜丘町1-2-3 さくらビル1F",
  phone: process.env.NEXT_PUBLIC_CLINIC_PHONE || "03-1234-5678",
  email: "info@sakura-clinic.example",
  description:
    "さくら鍼灸整骨院は、鍼灸・整体・マッサージで皆さまの健康をサポートします。丁寧なカウンセリングと国家資格を持つスタッフによる安心の施術をお届けします。",
  catchphrase: "かんたん予約、スムーズな体験",
  nearestStation: "JR渋谷駅 南口より徒歩5分",
  parking: "近隣にコインパーキングあり（院提携駐車場はございません）",
  businessHours: {
    weekday: { morning: "9:00 - 12:30", afternoon: "15:00 - 20:00" },
    saturday: { morning: "9:00 - 14:00", afternoon: null },
    sunday: null,
  },
  closedDays: "日曜・祝日",
};

export const CANCEL_POLICY =
  "予約のキャンセル・変更はお電話にてご連絡ください。前日までのキャンセルは無料です。当日キャンセルの場合も、まずはお電話にてご一報ください。無断キャンセルが続く場合は、次回以降のご予約をお断りする場合がございます。";

export const FIRST_VISIT_NOTICE = {
  title: "初めてご来院の方へ",
  items: [
    "予約時間の10分前にお越しください（問診票のご記入があります）",
    "動きやすい服装でお越しください（お着替えのご用意もございます）",
    "健康保険証をお持ちください",
    "現在服用中のお薬がある方は、お薬手帳をお持ちください",
    "症状の経過や気になることがあれば、メモしてお持ちいただくとスムーズです",
  ],
};

export const FIRST_VISIT_DISCOUNT = {
  title: "初回限定割引",
  description: "初めてご来院の方は、全メニュー10%OFF！",
  note: "※他の割引との併用はできません",
};
