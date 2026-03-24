"use client";

interface CalendarDayProps {
  day: number;
  isCurrentMonth: boolean;
  isPast: boolean;
  isHoliday: boolean;
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
}

export default function CalendarDay({
  day,
  isCurrentMonth,
  isPast,
  isHoliday,
  isSelected,
  isToday,
  onClick,
}: CalendarDayProps) {
  const disabled = !isCurrentMonth || isPast || isHoliday;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full aspect-square flex items-center justify-center rounded-lg
        text-sm font-medium transition-colors duration-200
        min-h-[44px]
        ${
          isSelected
            ? "bg-sakura-400 text-white"
            : disabled
              ? "text-gray-300 cursor-not-allowed"
              : isToday
                ? "bg-sakura-50 text-sakura-600 hover:bg-sakura-100"
                : "text-gray-700 hover:bg-sakura-50"
        }
        ${!isCurrentMonth ? "invisible" : ""}
      `}
    >
      <span className="flex flex-col items-center">
        {day}
        {isHoliday && isCurrentMonth && !isPast && (
          <span className="text-[10px] text-red-400 leading-none">休</span>
        )}
      </span>
    </button>
  );
}
