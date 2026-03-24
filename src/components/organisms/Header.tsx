"use client";

import { useState } from "react";
import Link from "next/link";
import { CLINIC_INFO } from "@/lib/constants";

const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/menu", label: "施術メニュー" },
  { href: "/about", label: "院の紹介" },
  { href: "/access", label: "アクセス" },
  { href: "/faq", label: "よくある質問" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">&#127800;</span>
            <span className="font-serif text-lg font-bold text-gray-800">
              {CLINIC_INFO.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-gray-600 hover:text-sakura-500 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/reservation"
              className="bg-sakura-400 hover:bg-sakura-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center"
            >
              Web予約
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="メニューを開く"
          >
            <span className="text-2xl">{isOpen ? "\u2715" : "\u2630"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav className="md:hidden bg-white border-t border-gray-100 pb-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block px-6 py-3 text-gray-600 hover:bg-sakura-50 hover:text-sakura-500 transition-colors min-h-[44px] flex items-center"
            >
              {item.label}
            </Link>
          ))}
          <div className="px-4 mt-2">
            <Link
              href="/reservation"
              onClick={() => setIsOpen(false)}
              className="block text-center bg-sakura-400 hover:bg-sakura-500 text-white px-5 py-3 rounded-lg font-medium transition-colors"
            >
              Web予約はこちら
            </Link>
          </div>
          <div className="px-6 mt-3">
            <a
              href={`tel:${CLINIC_INFO.phone.replace(/-/g, "")}`}
              className="flex items-center gap-2 text-gray-600 min-h-[44px]"
            >
              <span>&#9742;</span>
              <span>{CLINIC_INFO.phone}</span>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
