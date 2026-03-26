"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/templates/AdminLayout";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { STATUS_LABELS, STATUS_COLORS, type ReservationStatus, type DashboardData } from "@/types";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setDashboard(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
            <p className="text-sm text-gray-500">
              {session?.user?.email && `${session.user.email} でログイン中`}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            ログアウト
          </Button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-12">読み込み中...</p>
        ) : !dashboard ? (
          <p className="text-gray-400 text-center py-12">データの取得に失敗しました</p>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card className="p-6">
                <p className="text-sm text-gray-500">本日の予約</p>
                <p className="text-3xl font-bold text-gray-800">
                  {dashboard.todayReservations.length}件
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-gray-500">未確認の予約</p>
                <p className="text-3xl font-bold text-red-500">
                  {dashboard.newCount}件
                </p>
              </Card>
              <Card className="p-6">
                <p className="text-sm text-gray-500">今週の予約数</p>
                <p className="text-3xl font-bold text-gray-800">
                  {Object.values(dashboard.weekSummary).reduce((a, b) => a + b, 0)}件
                </p>
              </Card>
            </div>

            {/* Today's Reservations */}
            <Card className="p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">本日の予約</h2>
              {dashboard.todayReservations.length === 0 ? (
                <p className="text-gray-400 text-center py-6">本日の予約はありません</p>
              ) : (
                <div className="space-y-3">
                  {dashboard.todayReservations.map((r) => (
                    <Link
                      key={r.id}
                      href={`/admin/reservations/${r.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-gray-700 w-16">
                            {r.reservationTime}
                          </span>
                          <div>
                            <p className="font-medium text-gray-800">{r.patientName}</p>
                            <p className="text-sm text-gray-500">{r.menuName}</p>
                          </div>
                        </div>
                        <Badge className={STATUS_COLORS[r.status as ReservationStatus]}>
                          {STATUS_LABELS[r.status as ReservationStatus]}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Week Summary */}
            <Card className="p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">今週の予約件数</h2>
              <div className="grid grid-cols-7 gap-2">
                {Object.entries(dashboard.weekSummary).map(([date, count]) => {
                  const d = new Date(date + "T00:00:00");
                  const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];
                  return (
                    <div key={date} className="text-center">
                      <p className="text-xs text-gray-500">{dayLabels[d.getDay()]}</p>
                      <p className="text-xs text-gray-400">
                        {(d.getMonth() + 1)}/{d.getDate()}
                      </p>
                      <p
                        className={`text-lg font-bold mt-1 ${count > 0 ? "text-sakura-500" : "text-gray-300"}`}
                      >
                        {count}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <Link href="/admin/reservations">
                <Card className="p-6 text-center cursor-pointer" hover>
                  <span className="text-2xl mb-2 inline-block">&#128197;</span>
                  <p className="font-medium text-gray-800">予約一覧</p>
                </Card>
              </Link>
              <Link href="/admin/menu">
                <Card className="p-6 text-center cursor-pointer" hover>
                  <span className="text-2xl mb-2 inline-block">&#128203;</span>
                  <p className="font-medium text-gray-800">メニュー管理</p>
                </Card>
              </Link>
              <Link href="/admin/schedule">
                <Card className="p-6 text-center cursor-pointer" hover>
                  <span className="text-2xl mb-2 inline-block">&#9200;</span>
                  <p className="font-medium text-gray-800">営業日設定</p>
                </Card>
              </Link>
              <Link href="/admin/staff">
                <Card className="p-6 text-center cursor-pointer" hover>
                  <span className="text-2xl mb-2 inline-block">&#128100;</span>
                  <p className="font-medium text-gray-800">スタッフ管理</p>
                </Card>
              </Link>
              <Link href="/admin/attendance">
                <Card className="p-6 text-center cursor-pointer" hover>
                  <span className="text-2xl mb-2 inline-block">&#128338;</span>
                  <p className="font-medium text-gray-800">勤怠管理</p>
                </Card>
              </Link>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
