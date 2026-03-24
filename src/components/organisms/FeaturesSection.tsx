import Card from "@/components/atoms/Card";
import { features } from "@/data/features";

const iconMap: Record<string, string> = {
  heart: "\u2764\uFE0F",
  certificate: "\uD83C\uDFC5",
  menu: "\uD83D\uDCCB",
};

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4">
          当院の3つの特徴
        </h2>
        <p className="text-center text-gray-500 mb-10">
          安心して施術を受けていただくために
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="p-8 text-center" hover>
              <span className="text-4xl mb-4 inline-block">
                {iconMap[feature.icon] || "\u2728"}
              </span>
              <h3 className="text-lg font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
