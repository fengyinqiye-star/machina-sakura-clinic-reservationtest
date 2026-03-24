import Link from "next/link";
import { CLINIC_INFO } from "@/lib/constants";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-sakura-50 via-warm-white to-sakura-100 py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <span className="text-5xl md:text-6xl mb-6 inline-block">&#127800;</span>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
          {CLINIC_INFO.name}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 font-serif">
          {CLINIC_INFO.catchphrase}
        </p>
        <p className="text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          鍼灸・整体・マッサージで、あなたの健康を丁寧にサポートいたします。
          国家資格を持つスタッフが、お一人おひとりに合わせた施術をお届けします。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/reservation"
            className="bg-sakura-400 hover:bg-sakura-500 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors shadow-md min-h-[44px]"
          >
            Web予約はこちら
          </Link>
          <a
            href={`tel:${CLINIC_INFO.phone.replace(/-/g, "")}`}
            className="flex items-center gap-2 text-gray-600 hover:text-sakura-500 transition-colors min-h-[44px] px-4 py-2"
          >
            <span className="text-xl">&#9742;</span>
            <span className="text-lg font-bold">{CLINIC_INFO.phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
