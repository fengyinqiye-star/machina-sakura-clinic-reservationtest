"use client";

import { useEffect, useState } from "react";
import PublicLayout from "@/components/templates/PublicLayout";
import MenuCard from "@/components/molecules/MenuCard";
import CancelPolicy from "@/components/organisms/ReservationForm/CancelPolicy";
import { MENU_CATEGORY_LABELS, type MenuCategory } from "@/types";
import { FIRST_VISIT_DISCOUNT } from "@/lib/constants";
import Link from "next/link";
import type { Menu } from "@/db/schema";

export default function MenuPage() {
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menus")
      .then((r) => r.json())
      .then((data) => {
        setAllMenus(data.menus || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = Object.keys(MENU_CATEGORY_LABELS) as MenuCategory[];

  return (
    <PublicLayout>
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            施術メニュー・料金
          </h1>
          <p className="text-center text-gray-500 mb-12">
            お一人おひとりの症状に合わせた施術をお選びいただけます
          </p>

          {/* First Visit Discount */}
          <div className="bg-gradient-to-r from-sakura-100 to-sakura-50 rounded-xl p-6 mb-12 text-center">
            <h2 className="text-xl font-bold text-sakura-600 mb-2">
              {FIRST_VISIT_DISCOUNT.title}
            </h2>
            <p className="text-lg text-gray-700">{FIRST_VISIT_DISCOUNT.description}</p>
            <p className="text-sm text-gray-500 mt-1">{FIRST_VISIT_DISCOUNT.note}</p>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-12">メニューを読み込み中...</p>
          ) : (
            <>
              {/* Menu by Category */}
              {categories.map((cat) => {
                const categoryMenus = allMenus.filter((m) => m.category === cat);
                if (categoryMenus.length === 0) return null;
                return (
                  <section key={cat} id={cat} className="mb-12">
                    <h2 className="font-serif text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-sakura-200">
                      {MENU_CATEGORY_LABELS[cat]}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {categoryMenus.map((menu) => (
                        <MenuCard
                          key={menu.id}
                          name={menu.name}
                          description={menu.description}
                          duration={menu.duration}
                          price={menu.price}
                          targetSymptoms={
                            menu.targetSymptoms ? JSON.parse(menu.targetSymptoms) : []
                          }
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          )}

          {/* Cancel Policy */}
          <div className="max-w-2xl mx-auto mt-8">
            <CancelPolicy />
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              href="/reservation"
              className="inline-block bg-sakura-400 hover:bg-sakura-500 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors shadow-md"
            >
              Web予約はこちら
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
