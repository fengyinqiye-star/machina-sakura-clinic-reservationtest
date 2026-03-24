import NewsCard from "@/components/molecules/NewsCard";
import { newsData } from "@/data/news";

export default function NewsSection() {
  const latestNews = newsData.slice(0, 3);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-center text-gray-800 mb-10">
          お知らせ
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          {latestNews.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
