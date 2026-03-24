import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

interface MenuCardProps {
  name: string;
  description: string;
  duration: number;
  price: number;
  targetSymptoms?: string[];
  onReserve?: () => void;
}

export default function MenuCard({
  name,
  description,
  duration,
  price,
  targetSymptoms,
  onReserve,
}: MenuCardProps) {
  return (
    <Card className="p-6" hover>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{name}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="flex items-center gap-4 mb-3">
        <span className="text-sm text-gray-500">
          <span className="inline-block w-4 mr-1">&#9201;</span>
          {duration}分
        </span>
        <span className="text-lg font-bold text-sakura-500">
          {price.toLocaleString()}円<span className="text-xs text-gray-500 ml-1">(税込)</span>
        </span>
      </div>
      {targetSymptoms && targetSymptoms.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">こんな方におすすめ</p>
          <div className="flex flex-wrap gap-1">
            {targetSymptoms.map((s) => (
              <Badge key={s} className="bg-sakura-50 text-sakura-600">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {onReserve && (
        <button
          onClick={onReserve}
          className="w-full mt-2 py-2 px-4 bg-sakura-400 hover:bg-sakura-500 text-white rounded-lg transition-colors text-sm font-medium min-h-[44px]"
        >
          このメニューを予約する
        </button>
      )}
    </Card>
  );
}
