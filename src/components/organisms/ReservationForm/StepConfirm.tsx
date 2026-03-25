"use client";

import { useState } from "react";
import Button from "@/components/atoms/Button";
import CancelPolicy from "./CancelPolicy";
import Link from "next/link";
import type { ReservationFormData } from "@/types";
import { MENU_CATEGORY_LABELS, type MenuCategory } from "@/types";

interface StepConfirmProps {
  data: ReservationFormData;
  onSubmit: () => Promise<void>;
  onEditStep: (step: number) => void;
}

export default function StepConfirm({ data, onSubmit, onEditStep }: StepConfirmProps) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!agreed) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "予約の送信に失敗しました。もう一度お試しください。");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold text-gray-800">
        Step 4: 予約内容の確認
      </h3>

      <div className="bg-sakura-50 rounded-xl p-6 space-y-4">
        {/* Menu */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500">施術メニュー</p>
            <p className="font-medium text-gray-800">
              {data.menuName}
              <span className="text-sm text-gray-500 ml-2">
                ({MENU_CATEGORY_LABELS[data.category as MenuCategory]})
              </span>
            </p>
            <p className="text-sm text-gray-600">
              {data.duration}分 / {data.price.toLocaleString()}円(税込)
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-sm text-sakura-500 hover:underline min-h-[44px] px-2"
          >
            修正
          </button>
        </div>

        <hr className="border-gray-200" />

        {/* Date/Time */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500">予約日時</p>
            <p className="font-medium text-gray-800">
              {data.date} {data.time}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-sm text-sakura-500 hover:underline min-h-[44px] px-2"
          >
            修正
          </button>
        </div>

        <hr className="border-gray-200" />

        {/* Patient Info */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">お客様情報</p>
            <p className="text-gray-800">{data.patientName} ({data.patientKana})</p>
            <p className="text-sm text-gray-600">TEL: {data.phone}</p>
            <p className="text-sm text-gray-600">Email: {data.email}</p>
            <p className="text-sm text-gray-600">
              来院歴: {data.isFirstVisit ? "初診" : "再診"}
            </p>
            {data.symptoms && (
              <p className="text-sm text-gray-600">症状・ご要望: {data.symptoms}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="text-sm text-sakura-500 hover:underline min-h-[44px] px-2"
          >
            修正
          </button>
        </div>
      </div>

      {/* Cancel Policy */}
      <CancelPolicy />

      {/* Privacy Policy Agreement */}
      <label className="flex items-start gap-3 cursor-pointer min-h-[44px] py-2">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-5 h-5 mt-0.5 text-sakura-400 rounded"
        />
        <span className="text-sm text-gray-700">
          <Link href="/privacy" target="_blank" className="text-sakura-500 underline">
            プライバシーポリシー
          </Link>
          に同意する
        </span>
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={() => onEditStep(3)}>
          戻る
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!agreed || submitting}
          isLoading={submitting}
        >
          予約を確定する
        </Button>
      </div>
    </div>
  );
}
