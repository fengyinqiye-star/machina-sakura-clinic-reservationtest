"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicLayout from "@/components/templates/PublicLayout";
import FirstVisitNotice from "@/components/organisms/ReservationForm/FirstVisitNotice";
import { CLINIC_INFO } from "@/lib/constants";

interface ReservationResult {
  id: string;
  menuName: string;
  reservationDate: string;
  reservationTime: string;
  patientName: string;
  isFirstVisit: boolean;
}

export default function ThanksPage() {
  const [reservation, setReservation] = useState<ReservationResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("reservationResult");
    if (stored) {
      setReservation(JSON.parse(stored));
      sessionStorage.removeItem("reservationResult");
    }
  }, []);

  return (
    <PublicLayout>
      <div className="py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <span className="text-5xl mb-6 inline-block">&#127800;</span>
          <h1 className="font-serif text-3xl font-bold text-gray-800 mb-4">
            ご予約を受け付けました
          </h1>

          {reservation && (
            <div className="bg-sakura-50 rounded-xl p-6 text-left mb-6">
              <h2 className="font-bold text-gray-800 mb-3">予約内容</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-4">
                  <dt className="text-gray-500 w-24 shrink-0">施術メニュー</dt>
                  <dd className="text-gray-800">{reservation.menuName}</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="text-gray-500 w-24 shrink-0">予約日時</dt>
                  <dd className="text-gray-800">
                    {reservation.reservationDate} {reservation.reservationTime}
                  </dd>
                </div>
                <div className="flex gap-4">
                  <dt className="text-gray-500 w-24 shrink-0">お名前</dt>
                  <dd className="text-gray-800">{reservation.patientName}様</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Email confirmation note */}
          <div className="bg-sakura-50 border border-sakura-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-sakura-700 leading-relaxed">
              メールアドレスをご入力いただいた方には、予約確認メールを送信しております。
              届かない場合は迷惑メールフォルダをご確認ください。
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-bold text-amber-800 mb-2">ご注意</h3>
            <p className="text-sm text-amber-700 leading-relaxed">
              こちらは<strong>仮予約</strong>です。院からの確認連絡をもって予約確定となります。
              確認のお電話またはメールをお待ちください。
            </p>
          </div>

          {/* Phone Number - Prominent */}
          <div className="bg-white border-2 border-sakura-300 rounded-xl p-6 mb-6">
            <p className="text-gray-600 text-sm mb-2">
              お急ぎの場合、キャンセル・変更のご連絡はこちら
            </p>
            <a
              href={`tel:${CLINIC_INFO.phone.replace(/-/g, "")}`}
              className="inline-flex items-center gap-2 text-sakura-500 hover:text-sakura-600 min-h-[44px]"
            >
              <span className="text-2xl">&#9742;</span>
              <span className="text-2xl font-bold">{CLINIC_INFO.phone}</span>
            </a>
          </div>

          {/* First Visit Notice */}
          {reservation?.isFirstVisit && (
            <div className="mb-6 text-left">
              <FirstVisitNotice />
            </div>
          )}

          {/* Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              href="/faq"
              className="text-sakura-500 hover:underline min-h-[44px] flex items-center"
            >
              よくある質問を見る
            </Link>
            <Link
              href="/access"
              className="text-sakura-500 hover:underline min-h-[44px] flex items-center"
            >
              アクセス情報を見る
            </Link>
            <Link
              href="/"
              className="text-gray-500 hover:underline min-h-[44px] flex items-center"
            >
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
