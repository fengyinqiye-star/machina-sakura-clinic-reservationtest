import type { Metadata } from "next";
import PublicLayout from "@/components/templates/PublicLayout";
import ReservationForm from "@/components/organisms/ReservationForm";

export const metadata: Metadata = {
  title: "Web予約",
  description:
    "さくら鍼灸整骨院のWeb予約ページ。24時間いつでもご予約いただけます。鍼灸・整体・マッサージのご予約はこちらから。",
};

export default function ReservationPage() {
  return (
    <PublicLayout>
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Web予約
          </h1>
          <p className="text-center text-gray-500 mb-10">
            以下のステップに沿ってご予約ください。24時間受付可能です。
          </p>
          <ReservationForm />
        </div>
      </div>
    </PublicLayout>
  );
}
