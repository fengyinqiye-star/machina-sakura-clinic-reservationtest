export interface NewsItem {
  id: string;
  date: string;
  category: "info" | "holiday" | "campaign";
  title: string;
  content: string;
}

export const CATEGORY_LABELS: Record<NewsItem["category"], string> = {
  info: "お知らせ",
  holiday: "休業案内",
  campaign: "キャンペーン",
};

export const CATEGORY_COLORS: Record<NewsItem["category"], string> = {
  info: "bg-blue-100 text-blue-700",
  holiday: "bg-red-100 text-red-700",
  campaign: "bg-green-100 text-green-700",
};

export const newsData: NewsItem[] = [
  {
    id: "1",
    date: "2026-03-20",
    category: "campaign",
    title: "春のキャンペーン！全メニュー10%OFF",
    content:
      "3月20日〜4月30日まで、全施術メニューが10%OFFになります。この機会にぜひお試しください。初めての方も大歓迎です！",
  },
  {
    id: "2",
    date: "2026-03-15",
    category: "holiday",
    title: "3月29日（日）〜3月30日（月）臨時休業のお知らせ",
    content:
      "3月29日（日）・30日（月）は研修のため臨時休業いたします。ご不便をおかけしますが、ご了承ください。",
  },
  {
    id: "3",
    date: "2026-03-10",
    category: "info",
    title: "新メニュー「美容鍼」始めました",
    content:
      "多くの患者様からご要望いただいていた「美容鍼」メニューを開始しました。お顔のリフトアップ、肌のハリ改善を目指す施術です。詳しくはメニューページをご覧ください。",
  },
  {
    id: "4",
    date: "2026-02-28",
    category: "info",
    title: "ホームページをリニューアルしました",
    content:
      "この度、ホームページをリニューアルいたしました。Web予約も可能になりましたので、ぜひご活用ください。",
  },
];
