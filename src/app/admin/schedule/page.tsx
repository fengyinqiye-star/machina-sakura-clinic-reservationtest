"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/templates/AdminLayout";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import type { Schedule } from "@/db/schema";

const DAY_LABELS = ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"];

interface DaySchedule {
  isHoliday: boolean;
  slots: { startTime: string; endTime: string; slotInterval: number; maxSlots: number }[];
}

export default function AdminSchedulePage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [newHoliday, setNewHoliday] = useState("");

  // Weekly defaults state
  const [weeklyDefaults, setWeeklyDefaults] = useState<Record<number, DaySchedule>>({});

  useEffect(() => {
    fetch("/api/admin/schedule")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setSchedules(data.schedules || []);
          parseSchedules(data.schedules || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const parseSchedules = (scheds: Schedule[]) => {
    const defaults: Record<number, DaySchedule> = {};
    const holidayDates: string[] = [];

    for (let d = 0; d < 7; d++) {
      defaults[d] = { isHoliday: false, slots: [] };
    }

    for (const s of scheds) {
      if (s.specificDate) {
        if (s.isHoliday) {
          holidayDates.push(s.specificDate);
        }
      } else if (s.dayOfWeek !== null) {
        if (s.isHoliday) {
          defaults[s.dayOfWeek].isHoliday = true;
        } else {
          defaults[s.dayOfWeek].slots.push({
            startTime: s.startTime,
            endTime: s.endTime,
            slotInterval: s.slotInterval,
            maxSlots: s.maxSlots,
          });
        }
      }
    }

    setWeeklyDefaults(defaults);
    setHolidays(holidayDates);
  };

  const updateDaySlot = (day: number, index: number, field: string, value: string | number) => {
    setWeeklyDefaults((prev) => {
      const updated = { ...prev };
      const dayData = { ...updated[day] };
      const slots = [...dayData.slots];
      slots[index] = { ...slots[index], [field]: value };
      dayData.slots = slots;
      updated[day] = dayData;
      return updated;
    });
  };

  const toggleHoliday = (day: number) => {
    setWeeklyDefaults((prev) => {
      const updated = { ...prev };
      const dayData = { ...updated[day] };
      dayData.isHoliday = !dayData.isHoliday;
      if (dayData.isHoliday) {
        dayData.slots = [];
      } else {
        dayData.slots = [
          { startTime: "09:00", endTime: "12:30", slotInterval: 30, maxSlots: 2 },
        ];
      }
      updated[day] = dayData;
      return updated;
    });
  };

  const addSlot = (day: number) => {
    setWeeklyDefaults((prev) => {
      const updated = { ...prev };
      const dayData = { ...updated[day] };
      dayData.slots = [
        ...dayData.slots,
        { startTime: "15:00", endTime: "20:00", slotInterval: 30, maxSlots: 2 },
      ];
      updated[day] = dayData;
      return updated;
    });
  };

  const removeSlot = (day: number, index: number) => {
    setWeeklyDefaults((prev) => {
      const updated = { ...prev };
      const dayData = { ...updated[day] };
      dayData.slots = dayData.slots.filter((_, i) => i !== index);
      updated[day] = dayData;
      return updated;
    });
  };

  const addHoliday = () => {
    if (newHoliday && !holidays.includes(newHoliday)) {
      setHolidays((prev) => [...prev, newHoliday].sort());
      setNewHoliday("");
    }
  };

  const removeHoliday = (date: string) => {
    setHolidays((prev) => prev.filter((d) => d !== date));
  };

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      weeklyDefaults: Object.entries(weeklyDefaults).map(([day, data]) => ({
        dayOfWeek: parseInt(day),
        isHoliday: data.isHoliday,
        slots: data.slots,
      })),
      holidays: holidays.map((date) => ({ date, isHoliday: true })),
    };

    const res = await fetch("/api/admin/schedule", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("保存しました");
    } else {
      alert("保存に失敗しました");
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

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">営業日設定</h1>
          <Button onClick={handleSave} isLoading={saving}>
            設定を保存
          </Button>
        </div>

        {/* Weekly Defaults */}
        <Card className="p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">曜日別デフォルト営業時間</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => {
              const dayData = weeklyDefaults[day] || { isHoliday: false, slots: [] };
              return (
                <div key={day} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">{DAY_LABELS[day]}</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dayData.isHoliday}
                        onChange={() => toggleHoliday(day)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600">休業日</span>
                    </label>
                  </div>
                  {!dayData.isHoliday && (
                    <div className="space-y-2">
                      {dayData.slots.map((slot, i) => (
                        <div key={i} className="flex items-center gap-2 flex-wrap">
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateDaySlot(day, i, "startTime", e.target.value)}
                            className="w-32"
                          />
                          <span className="text-gray-400">〜</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateDaySlot(day, i, "endTime", e.target.value)}
                            className="w-32"
                          />
                          <span className="text-sm text-gray-500">間隔</span>
                          <Input
                            type="number"
                            value={slot.slotInterval}
                            onChange={(e) =>
                              updateDaySlot(day, i, "slotInterval", parseInt(e.target.value) || 30)
                            }
                            className="w-20"
                            min={15}
                          />
                          <span className="text-sm text-gray-500">分 / 最大</span>
                          <Input
                            type="number"
                            value={slot.maxSlots}
                            onChange={(e) =>
                              updateDaySlot(day, i, "maxSlots", parseInt(e.target.value) || 1)
                            }
                            className="w-16"
                            min={1}
                          />
                          <span className="text-sm text-gray-500">名</span>
                          <Button
                            variant="ghost"
                            onClick={() => removeSlot(day, i)}
                            className="text-red-400 hover:text-red-600"
                          >
                            &#10005;
                          </Button>
                        </div>
                      ))}
                      <Button variant="ghost" onClick={() => addSlot(day)} className="text-sm">
                        + 時間帯を追加
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Specific Holidays */}
        <Card className="p-6">
          <h2 className="font-bold text-gray-800 mb-4">特定日の休業設定</h2>
          <div className="flex items-center gap-3 mb-4">
            <Input
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              className="w-48"
            />
            <Button variant="secondary" onClick={addHoliday}>
              休業日を追加
            </Button>
          </div>
          {holidays.length === 0 ? (
            <p className="text-sm text-gray-400">特定日の休業設定はありません</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {holidays.map((date) => (
                <span
                  key={date}
                  className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm"
                >
                  {date}
                  <button
                    onClick={() => removeHoliday(date)}
                    className="hover:text-red-800 ml-1"
                  >
                    &#10005;
                  </button>
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
