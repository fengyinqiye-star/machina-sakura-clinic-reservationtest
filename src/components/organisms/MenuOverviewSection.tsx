import Link from "next/link";
import Card from "@/components/atoms/Card";

const menuCategories = [
  {
    title: "鍼灸",
    icon: "\uD83E\uDDF6",
    description: "はり・お灸で痛みやコリを改善。美容鍼も。",
    href: "/menu#acupuncture",
  },
  {
    title: "整体",
    icon: "\uD83E\uDDB4",
    description: "骨盤矯正・姿勢改善で体のバランスを整えます。",
    href: "/menu#chiropractic",
  },
  {
    title: "マッサージ",
    icon: "\uD83D\uDC90",
    description: "全身ほぐしからピンポイントケアまで。",
    href: "/menu#massage",
  },
];

export default function MenuOverviewSection() {
  return (
    <section className="py-16 bg-sakura-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4">
          施術メニュー
        </h2>
        <p className="text-center text-gray-500 mb-10">
          あなたの症状に合わせた施術をお選びいただけます
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {menuCategories.map((cat) => (
            <Link key={cat.title} href={cat.href}>
              <Card className="p-8 text-center h-full" hover>
                <span className="text-4xl mb-4 inline-block">{cat.icon}</span>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{cat.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{cat.description}</p>
                <span className="text-sakura-400 text-sm font-medium">
                  詳しく見る &rarr;
                </span>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/menu"
            className="inline-block border-2 border-sakura-400 text-sakura-500 hover:bg-sakura-400 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors min-h-[44px]"
          >
            全メニューを見る
          </Link>
        </div>
      </div>
    </section>
  );
}
