import type { Metadata } from "next";
import PublicLayout from "@/components/templates/PublicLayout";
import StaffCard from "@/components/molecules/StaffCard";
import { staffMembers, qualificationsList } from "@/data/clinic-info";
import Badge from "@/components/atoms/Badge";

export const metadata: Metadata = {
  title: "院の紹介",
  description:
    "さくら鍼灸整骨院の院長挨拶、スタッフ紹介、治療方針のご案内。国家資格を持つスタッフが丁寧に施術いたします。",
};

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            院の紹介
          </h1>

          {/* Director's Message */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="bg-sakura-100 rounded-xl aspect-[4/3] flex items-center justify-center">
                <span className="text-6xl">&#128100;</span>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-800 mb-4">院長挨拶</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  さくら鍼灸整骨院 院長の田中さくらです。
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  当院は「患者様一人ひとりに寄り添った施術」をモットーに、開院以来多くの方のお身体のお悩みに向き合ってまいりました。
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  痛みやコリの原因は人それぞれです。そのため、当院では初回のカウンセリングを特に大切にし、
                  お身体の状態をしっかり把握した上で最適な施術プランをご提案しています。
                </p>
                <p className="text-gray-600 leading-relaxed">
                  どんな小さなお悩みでも、お気軽にご相談ください。
                  皆さまの健康で笑顔あふれる毎日をサポートできることを楽しみにしております。
                </p>
              </div>
            </div>
          </section>

          {/* Treatment Philosophy */}
          <section className="mb-16 bg-sakura-50 rounded-xl p-8">
            <h2 className="font-serif text-2xl font-bold text-center text-gray-800 mb-6">
              治療方針・コンセプト
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 text-gray-600 leading-relaxed">
              <p>
                当院では、「その場しのぎの治療」ではなく、
                <strong className="text-gray-800">痛みの根本原因にアプローチする施術</strong>
                を心がけています。
              </p>
              <p>
                東洋医学の知見を活かした鍼灸治療と、現代医学に基づいた整体・マッサージを組み合わせ、
                患者様お一人おひとりに最適な治療プランをご提案します。
              </p>
              <p>
                また、施術後のセルフケア指導にも力を入れ、
                日常生活での姿勢改善やストレッチのアドバイスを通じて、
                再発予防までトータルにサポートいたします。
              </p>
            </div>
          </section>

          {/* Staff */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl font-bold text-center text-gray-800 mb-8">
              スタッフ紹介
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {staffMembers.map((staff) => (
                <StaffCard key={staff.name} {...staff} />
              ))}
            </div>
          </section>

          {/* Qualifications */}
          <section className="mb-16 text-center">
            <h2 className="font-serif text-2xl font-bold text-gray-800 mb-6">保有資格一覧</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {qualificationsList.map((q) => (
                <Badge key={q} className="bg-wgreen-50 text-wgreen-600 text-sm px-4 py-2">
                  {q}
                </Badge>
              ))}
            </div>
          </section>

          {/* Clinic Photos */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-center text-gray-800 mb-8">
              院内の様子
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["受付", "待合室", "施術室1", "施術室2", "鍼灸室", "院外観"].map((label) => (
                <div
                  key={label}
                  className="aspect-[4/3] bg-sakura-100 rounded-lg flex items-center justify-center"
                >
                  <span className="text-gray-400 text-sm">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">
              ※ 写真はプレースホルダーです。実際の院内写真に差し替えます。
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
