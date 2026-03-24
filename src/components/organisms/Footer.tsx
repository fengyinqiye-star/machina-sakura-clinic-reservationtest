import Link from "next/link";
import { CLINIC_INFO } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Clinic Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">&#127800;</span>
              <span className="font-serif text-lg font-bold text-white">{CLINIC_INFO.name}</span>
            </div>
            <p className="text-sm leading-relaxed">{CLINIC_INFO.address}</p>
            <a
              href={`tel:${CLINIC_INFO.phone.replace(/-/g, "")}`}
              className="inline-flex items-center gap-2 mt-2 text-sakura-300 hover:text-sakura-200 transition-colors min-h-[44px]"
            >
              <span>&#9742;</span>
              <span className="text-lg font-bold">{CLINIC_INFO.phone}</span>
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-bold mb-4">ページ一覧</h3>
            <nav className="space-y-2">
              {[
                { href: "/", label: "ホーム" },
                { href: "/menu", label: "施術メニュー" },
                { href: "/about", label: "院の紹介" },
                { href: "/reservation", label: "Web予約" },
                { href: "/access", label: "アクセス" },
                { href: "/faq", label: "よくある質問" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm hover:text-sakura-300 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-white font-bold mb-4">営業時間</h3>
            <div className="text-sm space-y-1">
              <p>月〜金: 9:00 - 12:30 / 15:00 - 20:00</p>
              <p>土: 9:00 - 14:00</p>
              <p>定休日: {CLINIC_INFO.closedDays}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
            プライバシーポリシー
          </Link>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {CLINIC_INFO.name} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
