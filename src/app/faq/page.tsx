import type { Metadata } from "next";
import PublicLayout from "@/components/templates/PublicLayout";
import AccordionItem from "@/components/molecules/AccordionItem";
import { faqData } from "@/data/faq";
import { CLINIC_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "よくある質問",
  description:
    "さくら鍼灸整骨院のよくある質問（FAQ）。予約方法、キャンセル、初診の流れ、料金などについてお答えします。",
};

export default function FaqPage() {
  return (
    <PublicLayout>
      <div className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            よくある質問
          </h1>
          <p className="text-center text-gray-500 mb-10">
            ご不明な点がございましたらお気軽にお問い合わせください
          </p>

          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-200">
            {faqData.map((item, i) => (
              <AccordionItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-500 mb-3">
              その他ご質問がございましたらお電話にてお問い合わせください
            </p>
            <a
              href={`tel:${CLINIC_INFO.phone.replace(/-/g, "")}`}
              className="inline-flex items-center gap-2 text-sakura-500 hover:text-sakura-600 text-lg font-bold min-h-[44px]"
            >
              <span>&#9742;</span>
              {CLINIC_INFO.phone}
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
