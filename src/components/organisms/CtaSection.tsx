import Link from "next/link";
import { CLINIC_INFO } from "@/lib/constants";

export default function CtaSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-sakura-400 to-sakura-500">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">
          ご予約・お問い合わせ
        </h2>
        <p className="text-white/90 mb-8">
          24時間いつでもWeb予約可能です。お電話でのご予約も承っております。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/reservation"
            className="bg-white text-sakura-500 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-bold transition-colors shadow-md min-h-[44px]"
          >
            Web予約はこちら
          </Link>
          <a
            href={`tel:${CLINIC_INFO.phone.replace(/-/g, "")}`}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors min-h-[44px] px-4 py-2"
          >
            <span className="text-xl">&#9742;</span>
            <span className="text-xl font-bold">{CLINIC_INFO.phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
