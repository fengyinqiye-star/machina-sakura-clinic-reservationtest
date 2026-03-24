"use client";

import { useState, useMemo } from "react";
import CalendarDay from "@/components/molecules/CalendarDay";

interface CalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  holidays?: string[];
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export default function Calendar({ selectedDate, onSelectDate, holidays = [] }: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: {
      day: number;
      date: string;
      isCurrentMonth: boolean;
      isPast: boolean;
      isHoliday: boolean;
      isToday: boolean;
    }[] = [];

    // Fill in empty days before the first of month
    for (let i = 0; i < firstDay; i++) {
      result.push({
        day: 0,
        date: "",
        isCurrentMonth: false,
        isPast: true,
        isHoliday: false,
        isToday: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
      const dayOfWeek = dateObj.getDay();
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isSunday = dayOfWeek === 0;
      const isHoliday = isSunday || holidays.includes(dateStr);
      const isToday =
        d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

      result.push({
        day: d,
        date: dateStr,
        isCurrentMonth: true,
        isPast,
        isHoliday,
        isToday,
      });
    }

    return result;
  }, [year, month, holidays]);

  const prevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(prev);
    }
  };

  const nextMonth = () => {
    const next = new Date(year, month + 1, 1);
    // Allow up to 3 months ahead
    const limit = new Date(today.getFullYear(), today.getMonth() + 3, 1);
    if (next <= limit) {
      setCurrentMonth(next);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          &lsaquo;
        </button>
        <span className="font-bold text-gray-800">
          {year}年{month + 1}月
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          &rsaquo;
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={`text-center text-xs font-medium py-1 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-500"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <CalendarDay
            key={i}
            day={day.day}
            isCurrentMonth={day.isCurrentMonth}
            isPast={day.isPast}
            isHoliday={day.isHoliday}
            isSelected={selectedDate === day.date}
            isToday={day.isToday}
            onClick={() => day.date && onSelectDate(day.date)}
          />
        ))}
      </div>
    </div>
  );
}
