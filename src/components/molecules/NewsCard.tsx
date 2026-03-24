import Badge from "@/components/atoms/Badge";
import { CATEGORY_LABELS, CATEGORY_COLORS, type NewsItem } from "@/data/news";

interface NewsCardProps {
  item: NewsItem;
}

export default function NewsCard({ item }: NewsCardProps) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <time className="text-sm text-gray-400 whitespace-nowrap mt-0.5">{item.date}</time>
      <Badge className={CATEGORY_COLORS[item.category]}>{CATEGORY_LABELS[item.category]}</Badge>
      <p className="text-gray-700 text-sm flex-1">{item.title}</p>
    </div>
  );
}
