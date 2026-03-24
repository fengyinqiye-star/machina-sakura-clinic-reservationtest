"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import { MENU_CATEGORY_LABELS, type MenuCategory } from "@/types";
import type { Menu } from "@/db/schema";

// Fallback menu data — used when the API returns 0 menus or fetch fails.
// Matches the seed data so the user always sees the full menu list.
const FALLBACK_MENUS: Menu[] = [
  // 鍼灸
  {
    id: "fallback-acupuncture-1",
    category: "acupuncture",
    name: "はり治療",
    description:
      "経験豊富な鍼灸師が、お身体の状態に合わせてツボを選び、痛みやコリを改善します。使い捨ての鍼を使用し、衛生面も安心です。",
    duration: 30,
    price: 4400,
    targetSymptoms: JSON.stringify(["肩こり", "腰痛", "頭痛", "神経痛"]),
    sortOrder: 1,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-acupuncture-2",
    category: "acupuncture",
    name: "お灸治療",
    description:
      "じんわりとした温熱で血行を促進し、冷え性や慢性的な痛みを和らげます。リラックス効果も高く、自律神経の調整にも効果的です。",
    duration: 30,
    price: 3300,
    targetSymptoms: JSON.stringify(["冷え性", "むくみ", "自律神経の乱れ", "不眠"]),
    sortOrder: 2,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-acupuncture-3",
    category: "acupuncture",
    name: "鍼灸総合コース",
    description:
      "はりとお灸を組み合わせた総合的な施術です。お身体全体のバランスを整え、様々な症状に対応します。じっくりとしたカウンセリングの後、最適な施術プランをご提案します。",
    duration: 60,
    price: 6600,
    targetSymptoms: JSON.stringify(["全身の不調", "疲労回復", "体質改善", "ストレス"]),
    sortOrder: 3,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-acupuncture-4",
    category: "acupuncture",
    name: "美容鍼",
    description:
      "お顔のツボに鍼を刺すことで、血行促進・リフトアップ・肌のハリ改善を目指します。エイジングケアやお肌のお悩みにおすすめです。",
    duration: 50,
    price: 7700,
    targetSymptoms: JSON.stringify(["たるみ", "くすみ", "ほうれい線", "むくみ"]),
    sortOrder: 4,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  // 整体
  {
    id: "fallback-chiropractic-1",
    category: "chiropractic",
    name: "骨盤矯正",
    description:
      "骨盤の歪みを丁寧に整え、姿勢改善と腰痛予防を行います。デスクワークの方や立ち仕事の方に特におすすめです。",
    duration: 30,
    price: 4400,
    targetSymptoms: JSON.stringify(["骨盤の歪み", "腰痛", "姿勢の悪さ", "脚の長さの違い"]),
    sortOrder: 5,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-chiropractic-2",
    category: "chiropractic",
    name: "姿勢改善コース",
    description:
      "全身の筋肉・骨格のバランスを調整し、正しい姿勢を取り戻します。猫背やストレートネックの改善に効果的です。",
    duration: 45,
    price: 5500,
    targetSymptoms: JSON.stringify(["猫背", "ストレートネック", "肩こり", "首の痛み"]),
    sortOrder: 6,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-chiropractic-3",
    category: "chiropractic",
    name: "産後骨盤ケア",
    description:
      "出産後に開いた骨盤を優しく整えます。産後の腰痛や体型の変化にお悩みの方に最適なコースです。",
    duration: 40,
    price: 5500,
    targetSymptoms: JSON.stringify(["産後の腰痛", "骨盤の開き", "体型変化", "尿漏れ"]),
    sortOrder: 7,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  // マッサージ
  {
    id: "fallback-massage-1",
    category: "massage",
    name: "全身マッサージ 30分",
    description: "全身をほぐす30分のショートコース。お時間のない方にもおすすめです。",
    duration: 30,
    price: 3300,
    targetSymptoms: JSON.stringify(["全身の疲れ", "肩こり", "腰痛"]),
    sortOrder: 8,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-massage-2",
    category: "massage",
    name: "全身マッサージ 60分",
    description:
      "じっくり60分かけて全身をほぐします。疲れが溜まっている方、リラックスしたい方におすすめです。",
    duration: 60,
    price: 5500,
    targetSymptoms: JSON.stringify(["全身の疲れ", "慢性的な肩こり", "腰痛", "リラクゼーション"]),
    sortOrder: 9,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-massage-3",
    category: "massage",
    name: "肩・首集中ケア",
    description:
      "肩と首を集中的にほぐします。デスクワークやスマートフォンの使いすぎによる肩こり・首の痛みに効果的です。",
    duration: 30,
    price: 3300,
    targetSymptoms: JSON.stringify(["肩こり", "首の痛み", "頭痛", "眼精疲労"]),
    sortOrder: 10,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "fallback-massage-4",
    category: "massage",
    name: "フットケア",
    description:
      "足裏からふくらはぎまでを丁寧にケアします。立ち仕事やむくみが気になる方におすすめです。",
    duration: 30,
    price: 3300,
    targetSymptoms: JSON.stringify(["足のむくみ", "足の疲れ", "冷え性", "立ち仕事の疲労"]),
    sortOrder: 11,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  },
];

const CATEGORY_ICONS: Record<MenuCategory, string> = {
  acupuncture: "\u{1F9F7}",
  chiropractic: "\u{1F9B4}",
  massage: "\u{1F486}",
};

interface StepMenuProps {
  selectedMenuId: string | null;
  onSelect: (menu: Menu) => void;
  onNext: () => void;
}

export default function StepMenu({ selectedMenuId, onSelect, onNext }: StepMenuProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    const MAX_RETRIES = 2;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const r = await fetch("/api/menus", { signal: controller.signal });
        clearTimeout(timeout);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const fetched: Menu[] = Array.isArray(data.menus) ? data.menus : [];
        if (fetched.length > 0) {
          setMenus(fetched);
          setUsingFallback(false);
          setLoading(false);
          return;
        }
      } catch {
        // Retry on next iteration
      }
    }
    // All attempts failed or returned empty — use fallback
    setMenus(FALLBACK_MENUS);
    setUsingFallback(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // Group menus by category, preserving sortOrder
  const categories = Object.keys(MENU_CATEGORY_LABELS) as MenuCategory[];
  const groupedMenus = categories.reduce(
    (acc, cat) => {
      const items = menus
        .filter((m) => m.category === cat && m.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      if (items.length > 0) {
        acc.push({ category: cat, items });
      }
      return acc;
    },
    [] as { category: MenuCategory; items: Menu[] }[],
  );

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        メニューを読み込み中...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold text-gray-800">
        Step 1: 施術メニューを選択
      </h3>

      {usingFallback && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-sm text-amber-800">
          <p className="font-medium">⚠ メニュー情報を取得できませんでした</p>
          <p className="mt-1">
            下記は参考メニューです。Web予約が完了しない場合は、お手数ですがお電話にてご予約ください。
          </p>
        </div>
      )}

      {groupedMenus.map(({ category, items }) => (
        <div key={category} className="space-y-3">
          {/* Category heading */}
          <h4 className="text-base font-bold text-gray-700 flex items-center gap-2 border-b border-sakura-200 pb-2">
            <span>{CATEGORY_ICONS[category]}</span>
            <span>{MENU_CATEGORY_LABELS[category]}</span>
          </h4>

          {items.map((menu) => {
            const isSelected = selectedMenuId === menu.id;
            return (
              <Card
                key={menu.id}
                className={`p-4 cursor-pointer border-2 transition-colors ${
                  isSelected
                    ? "border-sakura-400 bg-sakura-50"
                    : "border-transparent hover:border-sakura-200"
                }`}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => onSelect(menu)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Check mark for selected menu */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "border-sakura-400 bg-sakura-400"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{menu.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{menu.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-lg font-bold text-sakura-500">
                        {menu.price.toLocaleString()}円
                      </p>
                      <p className="text-xs text-gray-500">{menu.duration}分</p>
                    </div>
                  </div>
                </button>
              </Card>
            );
          })}
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!selectedMenuId}>
          次へ
        </Button>
      </div>
    </div>
  );
}
