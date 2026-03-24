import Link from "next/link";
import PublicLayout from "@/components/templates/PublicLayout";

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">&#127800;</p>
          <h1 className="font-serif text-3xl font-bold text-gray-800 mb-4">
            ページが見つかりません
          </h1>
          <p className="text-gray-500 mb-8">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
          <Link
            href="/"
            className="bg-sakura-400 hover:bg-sakura-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            トップページへ戻る
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
