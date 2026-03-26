"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: "\uD83D\uDCCA" },
  { href: "/admin/reservations", label: "予約管理", icon: "\uD83D\uDCC5" },
  { href: "/admin/menu", label: "メニュー管理", icon: "\uD83D\uDCCB" },
  { href: "/admin/schedule", label: "営業日設定", icon: "\u23F0" },
  { href: "/admin/staff", label: "スタッフ管理", icon: "\uD83D\uDC64" },
  { href: "/admin/attendance", label: "勤怠管理", icon: "\uD83D\uDD52" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4 shrink-0 hidden md:block">
      <div className="mb-8">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl">&#127800;</span>
          <span className="font-serif font-bold">管理画面</span>
        </Link>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px] ${
                isActive
                  ? "bg-sakura-500/20 text-sakura-300"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-8">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-gray-300 transition-colors text-sm min-h-[44px]"
        >
          &larr; 公開サイトへ
        </Link>
      </div>
    </aside>
  );
}
