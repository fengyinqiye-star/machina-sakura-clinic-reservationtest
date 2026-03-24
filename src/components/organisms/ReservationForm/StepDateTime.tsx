"use client";

import { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Calendar from "./Calendar";
import TimeSlotButton from "@/components/molecules/TimeSlotButton";
import type { TimeSlot } from "@/types";

interface StepDateTimeProps {
  menuId: string;
  selectedDate: string | null;
  selectedTime: string | null;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepDateTime({
  menuId,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onNext,
  onBack,
}: StepDateTimeProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isHoliday, setIsHoliday] = useState(false);
  const [loading, setLoading] = useState(false);
  const [holidays, setHolidays] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    fetch(`/api/schedule/available?date=${selectedDate}&menuId=${menuId}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || []);
        setIsHoliday(data.isHoliday || false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDate, menuId]);

  const handleDateSelect = (date: string) => {
    onSelectDate(date);
    onSelectTime("");
  };

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold text-gray-800">
        Step 2: 日時を選択
      </h3>

      {/* Calendar */}
      <Calendar
        selectedDate={selectedDate}
        onSelectDate={handleDateSelect}
        holidays={holidays}
      />

      {/* Time Slots */}
      {selectedDate && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-3">
            {selectedDate} の空き時間
          </h4>
          {loading ? (
            <p className="text-gray-400 text-center py-4">読み込み中...</p>
          ) : isHoliday ? (
            <p className="text-red-500 text-center py-4">休業日です</p>
          ) : slots.length === 0 ? (
            <p className="text-gray-500 text-center py-4">空き枠がありません</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <TimeSlotButton
                    key={slot.time}
                    time={slot.time}
                    available={slot.available}
                    availableStaffCount={slot.availableStaffCount}
                    selected={selectedTime === slot.time}
                    onClick={() => onSelectTime(slot.time)}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span><span className="text-emerald-500 font-bold">◎</span> 余裕あり</span>
                <span><span className="text-amber-500 font-bold">△</span> 残りわずか</span>
                <span><span className="text-gray-400 font-bold">×</span> 満席</span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack}>
          戻る
        </Button>
        <Button onClick={onNext} disabled={!selectedDate || !selectedTime}>
          次へ
        </Button>
      </div>
    </div>
  );
}
