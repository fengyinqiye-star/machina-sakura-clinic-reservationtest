"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/templates/AdminLayout";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";

interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  breakMinutes: number;
  note: string | null;
  staffName: string | null;
  staffColor: string | null;
}

interface StaffOption {
  id: string;
  name: string;
  color: string;
}

interface StaffSummary {
  staffId: string;
  staffName: string;
  totalWorkMinutes: number;
  totalReservations: number;
  workDays: number;
}

interface ReservationStat {
  staffId: string | null;
  date: string;
  count: number;
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}時間${m > 0 ? `${m}分` : ""}`;
}

function getWorkMinutes(record: AttendanceRecord): number {
  if (!record.clockIn || !record.clockOut) return 0;
  const [inH, inM] = record.clockIn.split(":").map(Number);
  const [outH, outM] = record.clockOut.split(":").map(Number);
  const total = (outH * 60 + outM) - (inH * 60 + inM) - record.breakMinutes;
  return total > 0 ? total : 0;
}

export default function AdminAttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [summaries, setSummaries] = useState<StaffSummary[]>([]);
  const [reservationStats, setReservationStats] = useState<ReservationStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffFilter, setStaffFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Current month
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
  );

  // Edit modal state
  const [editRecord, setEditRecord] = useState<{
    staffId: string;
    date: string;
    clockIn: string;
    clockOut: string;
    breakMinutes: number;
    note: string;
  } | null>(null);

  const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ month: selectedMonth });
    if (staffFilter) params.set("staffId", staffFilter);

    try {
      const res = await fetch(`/api/admin/attendance?${params}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setRecords(data.records || []);
      setStaffList(data.staff || []);
      setSummaries(data.summary || []);
      setReservationStats(data.reservationStats || []);
    } catch {
      // fail silently
    }
    setLoading(false);
  }, [selectedMonth, staffFilter, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClockAction = async (staffId: string, action: "clockIn" | "clockOut") => {
    setActionLoading(`${staffId}-${action}`);
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, date: today, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "操作に失敗しました");
      } else {
        fetchData();
      }
    } catch {
      alert("操作に失敗しました");
    }
    setActionLoading(null);
  };

  const handleEditSave = async () => {
    if (!editRecord) return;
    setActionLoading("edit");
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: editRecord.staffId,
          date: editRecord.date,
          action: "update",
          clockIn: editRecord.clockIn,
          clockOut: editRecord.clockOut,
          breakMinutes: editRecord.breakMinutes,
          note: editRecord.note,
        }),
      });
      if (res.ok) {
        setEditRecord(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "保存に失敗しました");
      }
    } catch {
      alert("保存に失敗しました");
    }
    setActionLoading(null);
  };

  // Get today's records per staff for quick clock buttons
  const todayRecords = new Map<string, AttendanceRecord>();
  for (const r of records) {
    if (r.date === today) {
      todayRecords.set(r.staffId, r);
    }
  }

  // Get reservation count per staff per date
  const getReservationCount = (staffId: string, date: string): number => {
    const stat = reservationStats.find(
      (s) => s.staffId === staffId && s.date === date
    );
    return stat?.count || 0;
  };

  // Build calendar data for the selected month
  const [yearNum, monthNum] = selectedMonth.split("-").map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const calendarDates = Array.from({ length: daysInMonth }, (_, i) => {
    const day = (i + 1).toString().padStart(2, "0");
    return `${selectedMonth}-${day}`;
  });

  // Navigate months
  const prevMonth = () => {
    const d = new Date(yearNum, monthNum - 2, 1);
    setSelectedMonth(
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
    );
  };
  const nextMonth = () => {
    const d = new Date(yearNum, monthNum, 1);
    setSelectedMonth(
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
    );
  };

  // Get display staff list
  const displayStaff = staffFilter
    ? staffList.filter((s) => s.id === staffFilter)
    : staffList;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">勤怠管理</h1>
        </div>

        {/* Today's Clock In/Out */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            本日の打刻 ({today})
          </h2>
          {staffList.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              スタッフが登録されていません
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {staffList.map((s) => {
                const todayRec = todayRecords.get(s.id);
                const clockedIn = !!todayRec?.clockIn;
                const clockedOut = !!todayRec?.clockOut;

                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200"
                  >
                    <div
                      className="w-3 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                      <p className="text-xs text-gray-500">
                        {clockedIn ? `出勤: ${todayRec!.clockIn}` : "未出勤"}
                        {clockedOut ? ` / 退勤: ${todayRec!.clockOut}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!clockedIn && (
                        <Button
                          variant="primary"
                          className="text-xs px-3 py-1.5"
                          onClick={() => handleClockAction(s.id, "clockIn")}
                          isLoading={actionLoading === `${s.id}-clockIn`}
                        >
                          出勤
                        </Button>
                      )}
                      {clockedIn && !clockedOut && (
                        <Button
                          variant="secondary"
                          className="text-xs px-3 py-1.5"
                          onClick={() => handleClockAction(s.id, "clockOut")}
                          isLoading={actionLoading === `${s.id}-clockOut`}
                        >
                          退勤
                        </Button>
                      )}
                      {clockedIn && clockedOut && (
                        <Badge className="bg-green-100 text-green-700">完了</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Monthly Summary */}
        {summaries.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {yearNum}年{monthNum}月 月次集計
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">
                      スタッフ
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      出勤日数
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      総勤務時間
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      予約件数
                    </th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">
                      稼働率
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((s) => {
                    // Estimate utilization: assume each reservation = 45min avg
                    const estimatedTreatmentMin = s.totalReservations * 45;
                    const utilization =
                      s.totalWorkMinutes > 0
                        ? Math.round((estimatedTreatmentMin / s.totalWorkMinutes) * 100)
                        : 0;
                    return (
                      <tr key={s.staffId} className="border-b border-gray-100">
                        <td className="py-2 px-3 font-medium text-gray-800">
                          {s.staffName}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-700">
                          {s.workDays}日
                        </td>
                        <td className="py-2 px-3 text-right text-gray-700">
                          {formatMinutes(s.totalWorkMinutes)}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-700">
                          {s.totalReservations}件
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`font-medium ${
                              utilization >= 70
                                ? "text-green-600"
                                : utilization >= 40
                                  ? "text-amber-600"
                                  : "text-gray-500"
                            }`}
                          >
                            {utilization}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-sm px-2" onClick={prevMonth}>
                &larr;
              </Button>
              <span className="font-medium text-gray-800 min-w-[100px] text-center">
                {yearNum}年{monthNum}月
              </span>
              <Button variant="ghost" className="text-sm px-2" onClick={nextMonth}>
                &rarr;
              </Button>
            </div>
            <div className="w-48">
              <Select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                options={[
                  { value: "", label: "全スタッフ" },
                  ...staffList.map((s) => ({ value: s.id, label: s.name })),
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Attendance Table */}
        <Card className="overflow-hidden mb-6">
          {loading ? (
            <p className="text-gray-400 text-center py-12">読み込み中...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 sticky left-0 bg-gray-50 min-w-[80px]">
                      日付
                    </th>
                    {displayStaff.map((s) => (
                      <th
                        key={s.id}
                        className="text-center py-2 px-3 text-xs font-medium text-gray-500 min-w-[140px]"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calendarDates.map((date) => {
                    const d = new Date(date + "T00:00:00");
                    const dayOfWeek = d.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const isToday = date === today;

                    return (
                      <tr
                        key={date}
                        className={`border-b border-gray-100 ${
                          isToday ? "bg-sakura-50/50" : isWeekend ? "bg-gray-50/50" : ""
                        }`}
                      >
                        <td
                          className={`py-2 px-3 sticky left-0 ${
                            isToday ? "bg-sakura-50/80" : isWeekend ? "bg-gray-50/80" : "bg-white"
                          }`}
                        >
                          <span
                            className={`text-sm ${
                              dayOfWeek === 0
                                ? "text-red-500"
                                : dayOfWeek === 6
                                  ? "text-blue-500"
                                  : "text-gray-700"
                            } ${isToday ? "font-bold" : ""}`}
                          >
                            {d.getDate()} ({DAY_LABELS[dayOfWeek]})
                          </span>
                        </td>
                        {displayStaff.map((s) => {
                          const rec = records.find(
                            (r) => r.staffId === s.id && r.date === date
                          );
                          const resCount = getReservationCount(s.id, date);
                          const workMin = rec ? getWorkMinutes(rec) : 0;

                          return (
                            <td key={s.id} className="py-2 px-3 text-center">
                              {rec ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditRecord({
                                      staffId: s.id,
                                      date,
                                      clockIn: rec.clockIn || "",
                                      clockOut: rec.clockOut || "",
                                      breakMinutes: rec.breakMinutes,
                                      note: rec.note || "",
                                    })
                                  }
                                  className="text-left w-full hover:bg-gray-100 rounded p-1 transition-colors"
                                >
                                  <p className="text-xs text-gray-700">
                                    {rec.clockIn || "--:--"} ~ {rec.clockOut || "--:--"}
                                  </p>
                                  {workMin > 0 && (
                                    <p className="text-xs text-gray-400">
                                      {formatMinutes(workMin)}
                                    </p>
                                  )}
                                  {resCount > 0 && (
                                    <p className="text-xs text-sakura-500">
                                      {resCount}件予約
                                    </p>
                                  )}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditRecord({
                                      staffId: s.id,
                                      date,
                                      clockIn: "",
                                      clockOut: "",
                                      breakMinutes: 0,
                                      note: "",
                                    })
                                  }
                                  className="text-gray-300 text-xs hover:text-gray-500 transition-colors w-full p-1"
                                >
                                  {resCount > 0 ? (
                                    <p className="text-xs text-sakura-400">
                                      {resCount}件予約
                                    </p>
                                  ) : (
                                    "-"
                                  )}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Edit Modal */}
        {editRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                勤怠編集 - {editRecord.date}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {staffList.find((s) => s.id === editRecord.staffId)?.name}
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="出勤時刻">
                    <Input
                      type="time"
                      value={editRecord.clockIn}
                      onChange={(e) =>
                        setEditRecord((p) =>
                          p ? { ...p, clockIn: e.target.value } : null
                        )
                      }
                    />
                  </FormField>
                  <FormField label="退勤時刻">
                    <Input
                      type="time"
                      value={editRecord.clockOut}
                      onChange={(e) =>
                        setEditRecord((p) =>
                          p ? { ...p, clockOut: e.target.value } : null
                        )
                      }
                    />
                  </FormField>
                </div>
                <FormField label="休憩時間（分）">
                  <Input
                    type="number"
                    value={editRecord.breakMinutes}
                    onChange={(e) =>
                      setEditRecord((p) =>
                        p
                          ? { ...p, breakMinutes: parseInt(e.target.value) || 0 }
                          : null
                      )
                    }
                    min={0}
                  />
                </FormField>
                <FormField label="備考">
                  <Input
                    value={editRecord.note}
                    onChange={(e) =>
                      setEditRecord((p) =>
                        p ? { ...p, note: e.target.value } : null
                      )
                    }
                    placeholder="備考（任意）"
                  />
                </FormField>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleEditSave}
                  isLoading={actionLoading === "edit"}
                >
                  保存
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setEditRecord(null)}
                >
                  キャンセル
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
