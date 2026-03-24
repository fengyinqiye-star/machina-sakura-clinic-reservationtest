"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/templates/AdminLayout";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Textarea from "@/components/atoms/Textarea";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  MENU_CATEGORY_LABELS,
  type ReservationStatus,
  type ReservationWithMenu,
  type MenuCategory,
} from "@/types";
import Link from "next/link";

const VALID_TRANSITIONS: Record<string, string[]> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export default function AdminReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [reservation, setReservation] = useState<ReservationWithMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/reservations/${id}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.reservation) {
          setReservation(data.reservation);
          setMemo(data.reservation.staffMemo || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`ステータスを「${STATUS_LABELS[newStatus as ReservationStatus]}」に変更しますか？`)) {
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setReservation((prev) => prev ? { ...prev, status: newStatus as ReservationStatus } : prev);
    } else {
      alert("ステータスの更新に失敗しました");
    }
    setSaving(false);
  };

  const handleMemoSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffMemo: memo }),
    });

    if (res.ok) {
      setReservation((prev) => prev ? { ...prev, staffMemo: memo } : prev);
      alert("メモを保存しました");
    } else {
      alert("メモの保存に失敗しました");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-gray-400 text-center py-12">読み込み中...</p>
      </AdminLayout>
    );
  }

  if (!reservation) {
    return (
      <AdminLayout>
        <p className="text-gray-400 text-center py-12">予約が見つかりません</p>
      </AdminLayout>
    );
  }

  const transitions = VALID_TRANSITIONS[reservation.status] || [];

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <Link
          href="/admin/reservations"
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
        >
          &larr; 予約一覧に戻る
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">予約詳細</h1>
          <Badge className={`${STATUS_COLORS[reservation.status]} text-sm px-3 py-1`}>
            {STATUS_LABELS[reservation.status]}
          </Badge>
        </div>

        {/* Reservation Details */}
        <Card className="p-6 mb-6">
          <dl className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-sm text-gray-500">患者名</dt>
              <dd className="text-gray-800 font-medium">
                {reservation.patientName} ({reservation.patientKana})
              </dd>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-sm text-gray-500">電話番号</dt>
              <dd>
                <a
                  href={`tel:${reservation.phone}`}
                  className="text-sakura-500 hover:underline min-h-[44px] inline-flex items-center"
                >
                  {reservation.phone}
                </a>
              </dd>
            </div>
            {reservation.email && (
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <dt className="text-sm text-gray-500">メール</dt>
                <dd className="text-gray-800">{reservation.email}</dd>
              </div>
            )}
            <hr className="border-gray-100" />
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-sm text-gray-500">施術メニュー</dt>
              <dd className="text-gray-800">
                {reservation.menuName}
                {reservation.menuCategory && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({MENU_CATEGORY_LABELS[reservation.menuCategory as MenuCategory]})
                  </span>
                )}
              </dd>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-sm text-gray-500">予約日時</dt>
              <dd className="text-gray-800 font-medium">
                {reservation.reservationDate} {reservation.reservationTime}
              </dd>
            </div>
            {reservation.menuDuration && (
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <dt className="text-sm text-gray-500">施術時間・料金</dt>
                <dd className="text-gray-800">
                  {reservation.menuDuration}分 / {reservation.menuPrice?.toLocaleString()}円
                </dd>
              </div>
            )}
            <hr className="border-gray-100" />
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-sm text-gray-500">来院歴</dt>
              <dd className="text-gray-800">
                {reservation.isFirstVisit ? "初診" : "再診"}
              </dd>
            </div>
            {reservation.symptoms && (
              <div className="grid grid-cols-[120px_1fr] gap-2">
                <dt className="text-sm text-gray-500">症状・ご要望</dt>
                <dd className="text-gray-800">{reservation.symptoms}</dd>
              </div>
            )}
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <dt className="text-sm text-gray-500">予約受付日時</dt>
              <dd className="text-gray-500 text-sm">{reservation.createdAt}</dd>
            </div>
          </dl>
        </Card>

        {/* Status Change */}
        {transitions.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">ステータス変更</h2>
            <div className="flex flex-wrap gap-3">
              {transitions.map((status) => (
                <Button
                  key={status}
                  variant={status === "cancelled" ? "danger" : "primary"}
                  onClick={() => handleStatusChange(status)}
                  disabled={saving}
                >
                  {STATUS_LABELS[status as ReservationStatus]}にする
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Staff Memo */}
        <Card className="p-6">
          <h2 className="font-bold text-gray-800 mb-4">スタッフメモ</h2>
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモを入力（患者には非公開）"
            className="mb-4"
          />
          <Button onClick={handleMemoSave} disabled={saving} isLoading={saving}>
            メモを保存
          </Button>
        </Card>
      </div>
    </AdminLayout>
  );
}
