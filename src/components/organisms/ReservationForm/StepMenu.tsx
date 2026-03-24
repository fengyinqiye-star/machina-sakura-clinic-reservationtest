"use client";

import { useState, useEffect, useCallback } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import { MENU_CATEGORY_LABELS, type MenuCategory } from "@/types";
import type { Menu } from "@/db/schema";

interface StepMenuProps {
  selectedMenuId: string | null;
  onSelect: (menu: Menu) => void;
  onNext: () => void;
}

export default function StepMenu({ selectedMenuId, onSelect, onNext }: StepMenuProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMenus = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch("/api/menus")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const fetched: Menu[] = Array.isArray(data.menus) ? data.menus : [];
        setMenus(fetched);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const categories = Object.keys(MENU_CATEGORY_LABELS) as MenuCategory[];
  const filteredMenus = selectedCategory
    ? menus.filter((m) => m.category === selectedCategory)
    : [];

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        メニューを読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-500">メニューの読み込みに失敗しました。</p>
        <Button onClick={fetchMenus}>再読み込み</Button>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        現在ご予約可能なメニューがありません。お電話にてお問い合わせください。
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold text-gray-800">
        Step 1: 施術メニューを選択
      </h3>

      {/* Category Selection */}
      <div>
        <p className="text-sm text-gray-600 mb-3">カテゴリを選択してください</p>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`p-4 rounded-lg border-2 text-center transition-colors min-h-[44px] ${
                selectedCategory === cat
                  ? "border-sakura-400 bg-sakura-50 text-sakura-600"
                  : "border-gray-200 hover:border-sakura-300 text-gray-600"
              }`}
            >
              <span className="text-sm font-medium">{MENU_CATEGORY_LABELS[cat]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Selection */}
      {selectedCategory && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">メニューを選択してください</p>
          {filteredMenus.length === 0 ? (
            <p className="text-center py-6 text-gray-400">
              このカテゴリにはメニューがありません。
            </p>
          ) : (
            filteredMenus.map((menu) => {
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
            })
          )}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!selectedMenuId}>
          次へ
        </Button>
      </div>
    </div>
  );
}
