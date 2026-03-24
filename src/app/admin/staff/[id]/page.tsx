"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/templates/AdminLayout";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import { DAY_OF_WEEK_LABELS, STAFF_ROLE_LABELS, type StaffRole } from "@/types";
import type { Staff, StaffSchedule } from "@/db/schema";

interface WeeklyEntry {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

interface SpecificDateEntry {
  specificDate: string;
  startTime: string;
  endTime: string;
  isOff: boolean;
}

const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";

function createDefaultWeekly(): WeeklyEntry[] {
  return Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    startTime: DEFAULT_START,
    endTime: DEFAULT_END,
    isOff: i === 0, // Sunday off by default
  }));
}

export default function StaffSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [staffData, setStaffData] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekly, setWeekly] = useState<WeeklyEntry[]>(createDefaultWeekly());
  const [specificDates, setSpecificDates] = useState<SpecificDateEntry[]>([]);
  const [newDate, setNewDate] = useState("");
  const [activeTab, setActiveTab] = useState<"weekly" | "specific">("weekly");

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/staff/${id}`).then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      }),
      fetch(`/api/admin/staff/${id}/schedule`).then((r) => {
        if (r.status === 401) return null;
        return r.json();
      }),
    ])
      .then(([staffRes, scheduleRes]) => {
        if (staffRes?.staff) setStaffData(staffRes.staff);
        if (scheduleRes?.schedules) {
          const schedules: StaffSchedule[] = scheduleRes.schedules;
          const weeklySchedules = schedules.filter((s) => s.specificDate === null);
          const specificSchedules = schedules.filter((s) => s.specificDate !== null);

          if (weeklySchedules.length > 0) {
            const merged = createDefaultWeekly();
            for (const ws of weeklySchedules) {
              if (ws.dayOfWeek !== null) {
                const idx = merged.findIndex((m) => m.dayOfWeek === ws.dayOfWeek);
                if (idx >= 0) {
                  merged[idx] = {
                    dayOfWeek: ws.dayOfWeek,
                    startTime: ws.startTime,
                    endTime: ws.endTime,
                    isOff: ws.isOff,
                  };
                }
              }
            }
            setWeekly(merged);
          }

          if (specificSchedules.length > 0) {
            setSpecificDates(
              specificSchedules.map((s) => ({
                specificDate: s.specificDate!,
                startTime: s.startTime,
                endTime: s.endTime,
                isOff: s.isOff,
              })),
            );
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/staff/${id}/schedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weeklyDefaults: weekly,
        specificDates: specificDates.length > 0 ? specificDates : undefined,
      }),
    });

    if (res.ok) {
      alert("勤務スケジュールを保存しました");
    } else {
      alert("保存に失敗しました");
    }
    setSaving(false);
  };

  const addSpecificDate = () => {
    if (!newDate) return;
    if (specificDates.some((d) => d.specificDate === newDate)) {
      alert("この日付は既に追加されています");
      return;
    }
    setSpecificDates((prev) => [
      ...prev,
      { specificDate: newDate, startTime: DEFAULT_START, endTime: DEFAULT_END, isOff: false },
    ]);
    setNewDate("");
  };

  const removeSpecificDate = (date: string) => {
    setSpecificDates((prev) => prev.filter((d) => d.specificDate !== date));
  };

  const updateWeekly = (dayOfWeek: number, field: keyof WeeklyEntry, value: string | boolean) => {
    setWeekly((prev) =>
      prev.map((w) => (w.dayOfWeek === dayOfWeek ? { ...w, [field]: value } : w)),
    );
  };

  const updateSpecific = (
    date: string,
    field: keyof SpecificDateEntry,
    value: string | boolean,
  ) => {
    setSpecificDates((prev) =>
      prev.map((s) => (s.specificDate === date ? { ...s, [field]: value } : s)),
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-gray-400 text-center py-12">読み込み中...</p>
      </AdminLayout>
    );
  }

  if (!staffData) {
    return (
      <AdminLayout>
        <p className="text-gray-400 text-center py-12">スタッフが見つかりません</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/staff">
            <Button variant="ghost" className="text-sm">
              &larr; スタッフ一覧
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-4 h-10 rounded-full shrink-0"
            style={{ backgroundColor: staffData.color }}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{staffData.name} の勤務設定</h1>
            <p className="text-sm text-gray-500">
              {STAFF_ROLE_LABELS[staffData.role as StaffRole] || staffData.role}
              {!staffData.isActive && " (無効)"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "weekly"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            曜日別デフォルト
          </button>
          <button
            onClick={() => setActiveTab("specific")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "specific"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            特定日設定
            {specificDates.length > 0 && (
              <Badge className="bg-sakura-100 text-sakura-700 ml-2">{specificDates.length}</Badge>
            )}
          </button>
        </div>

        {/* Weekly Schedule */}
        {activeTab === "weekly" && (
          <Card className="p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">曜日別デフォルト勤務時間</h2>
            <p className="text-sm text-gray-500 mb-4">
              各曜日の基本的な勤務時間を設定してください。
            </p>
            <div className="space-y-3">
              {weekly.map((w) => (
                <div
                  key={w.dayOfWeek}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    w.isOff ? "bg-gray-50 border-gray-200" : "bg-white border-gray-100"
                  }`}
                >
                  <span
                    className={`w-8 text-center font-bold text-sm ${
                      w.dayOfWeek === 0
                        ? "text-red-500"
                        : w.dayOfWeek === 6
                          ? "text-blue-500"
                          : "text-gray-700"
                    }`}
                  >
                    {DAY_OF_WEEK_LABELS[w.dayOfWeek]}
                  </span>

                  <label className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={w.isOff}
                      onChange={(e) => updateWeekly(w.dayOfWeek, "isOff", e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">休み</span>
                  </label>

                  {!w.isOff && (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={w.startTime}
                        onChange={(e) => updateWeekly(w.dayOfWeek, "startTime", e.target.value)}
                        className="!py-2 !min-h-0"
                      />
                      <span className="text-gray-400">~</span>
                      <Input
                        type="time"
                        value={w.endTime}
                        onChange={(e) => updateWeekly(w.dayOfWeek, "endTime", e.target.value)}
                        className="!py-2 !min-h-0"
                      />
                    </div>
                  )}

                  {w.isOff && (
                    <span className="text-sm text-gray-400 flex-1">休日</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Specific Date Schedule */}
        {activeTab === "specific" && (
          <Card className="p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">特定日の勤務設定</h2>
            <p className="text-sm text-gray-500 mb-4">
              シフト変更や臨時休みなど、通常と異なる勤務日を設定してください。特定日の設定は曜日別デフォルトより優先されます。
            </p>

            {/* Add new date */}
            <div className="flex gap-2 mb-4">
              <FormField label="">
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="!py-2 !min-h-0"
                />
              </FormField>
              <Button variant="secondary" onClick={addSpecificDate} className="self-end">
                + 日付を追加
              </Button>
            </div>

            {specificDates.length === 0 ? (
              <p className="text-gray-400 text-center py-6 text-sm">
                特定日の設定はありません
              </p>
            ) : (
              <div className="space-y-3">
                {specificDates
                  .sort((a, b) => a.specificDate.localeCompare(b.specificDate))
                  .map((s) => {
                    const d = new Date(s.specificDate + "T00:00:00");
                    const dayLabel = DAY_OF_WEEK_LABELS[d.getDay()];
                    return (
                      <div
                        key={s.specificDate}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                          s.isOff ? "bg-gray-50 border-gray-200" : "bg-white border-gray-100"
                        }`}
                      >
                        <div className="shrink-0 w-24">
                          <p className="text-sm font-medium text-gray-800">{s.specificDate}</p>
                          <p className="text-xs text-gray-500">({dayLabel})</p>
                        </div>

                        <label className="flex items-center gap-2 shrink-0">
                          <input
                            type="checkbox"
                            checked={s.isOff}
                            onChange={(e) =>
                              updateSpecific(s.specificDate, "isOff", e.target.checked)
                            }
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-600">休み</span>
                        </label>

                        {!s.isOff && (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={s.startTime}
                              onChange={(e) =>
                                updateSpecific(s.specificDate, "startTime", e.target.value)
                              }
                              className="!py-2 !min-h-0"
                            />
                            <span className="text-gray-400">~</span>
                            <Input
                              type="time"
                              value={s.endTime}
                              onChange={(e) =>
                                updateSpecific(s.specificDate, "endTime", e.target.value)
                              }
                              className="!py-2 !min-h-0"
                            />
                          </div>
                        )}

                        {s.isOff && (
                          <span className="text-sm text-gray-400 flex-1">臨時休み</span>
                        )}

                        <Button
                          variant="ghost"
                          className="text-sm text-red-500 shrink-0"
                          onClick={() => removeSpecificDate(s.specificDate)}
                        >
                          削除
                        </Button>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        )}

        {/* Save Button */}
        <div className="flex gap-3">
          <Button onClick={handleSave} isLoading={saving}>
            勤務スケジュールを保存
          </Button>
          <Link href="/admin/staff">
            <Button variant="secondary">戻る</Button>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
