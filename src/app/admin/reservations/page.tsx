"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/templates/AdminLayout";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import { STATUS_LABELS, STATUS_COLORS, type ReservationStatus, type ReservationWithMenu } from "@/types";
import Link from "next/link";

function ReservationsContent() {
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationWithMenu[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchReservations = (p: number, status: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", p.toString());
    if (status) params.set("status", status);

    fetch(`/api/admin/reservations?${params}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setReservations(data.reservations || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations(page, statusFilter);
  }, [page, statusFilter]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">予約管理</h1>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-48">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: "", label: "全てのステータス" },
                  { value: "new", label: "新規" },
                  { value: "confirmed", label: "確認済み" },
                  { value: "completed", label: "完了" },
                  { value: "cancelled", label: "キャンセル" },
                ]}
              />
            </div>
            <p className="text-sm text-gray-500">全{total}件</p>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-center py-12">読み込み中...</p>
          ) : reservations.length === 0 ? (
            <p className="text-gray-400 text-center py-12">予約がありません</p>
          ) : (
            <>
              {/* Header */}
              <div className="hidden md:grid grid-cols-[120px_1fr_120px_140px_100px] gap-2 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 border-b">
                <span>予約日時</span>
                <span>患者名</span>
                <span>電話番号</span>
                <span>メニュー</span>
                <span>ステータス</span>
              </div>

              {/* Rows */}
              {reservations.map((r) => (
                <Link
                  key={r.id}
                  href={`/admin/reservations/${r.id}`}
                  className="block hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-[120px_1fr_120px_140px_100px] gap-2 items-center px-4 py-3 text-sm">
                    <span className="text-gray-700">
                      {r.reservationDate}
                      <br />
                      <span className="text-gray-500">{r.reservationTime}</span>
                    </span>
                    <span className="text-gray-800 font-medium">{r.patientName}</span>
                    <span className="text-gray-600">{r.phone}</span>
                    <span className="text-gray-600">{r.menuName}</span>
                    <Badge className={STATUS_COLORS[r.status]}>
                      {STATUS_LABELS[r.status]}
                    </Badge>
                  </div>
                  {/* Mobile */}
                  <div className="md:hidden px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{r.patientName}</p>
                      <p className="text-sm text-gray-500">
                        {r.reservationDate} {r.reservationTime} - {r.menuName}
                      </p>
                    </div>
                    <Badge className={STATUS_COLORS[r.status]}>
                      {STATUS_LABELS[r.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              前へ
            </Button>
            <span className="text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              次へ
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminReservationsPage() {
  return (
    <Suspense fallback={<AdminLayout><p className="text-gray-400 text-center py-12">読み込み中...</p></AdminLayout>}>
      <ReservationsContent />
    </Suspense>
  );
}
