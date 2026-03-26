"use client";

import { useState } from "react";

interface TimeSlotButtonProps {
  time: string;
  available: boolean;
  selected: boolean;
  availableStaffCount?: number;
  availableStaffNames?: string[];
  onClick: () => void;
}

export default function TimeSlotButton({
  time,
  available,
  selected,
  availableStaffCount,
  availableStaffNames,
  onClick,
}: TimeSlotButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine availability indicator
  let indicator = "";
  if (!available) {
    indicator = "×";
  } else if (availableStaffCount !== undefined) {
    if (availableStaffCount >= 2) {
      indicator = "◎";
    } else if (availableStaffCount === 1) {
      indicator = "△";
    }
  }

  const staffTooltipText =
    available && availableStaffNames && availableStaffNames.length > 0
      ? availableStaffNames.join(", ")
      : "";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={!available}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => setShowTooltip(true)}
        onTouchEnd={() => setShowTooltip(false)}
        className={`
          px-4 py-3 rounded-lg text-sm font-medium
          transition-colors duration-200
          min-w-[80px] min-h-[44px]
          flex flex-col items-center justify-center gap-0.5
          ${
            selected
              ? "bg-sakura-400 text-white ring-2 ring-sakura-300"
              : available
                ? "bg-white border border-gray-300 hover:border-sakura-400 hover:bg-sakura-50 text-gray-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
          }
        `}
      >
        <span>{time}</span>
        {indicator && (
          <span
            className={`text-xs leading-none ${
              !available
                ? "text-gray-400"
                : availableStaffCount === 1
                  ? "text-amber-500"
                  : "text-emerald-500"
            } ${selected ? "!text-white/80" : ""}`}
          >
            {indicator}
            {available && availableStaffCount !== undefined && (
              <span className="ml-0.5">残{availableStaffCount}枠</span>
            )}
          </span>
        )}
      </button>

      {/* Staff names tooltip */}
      {showTooltip && staffTooltipText && (
        <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
          {staffTooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}
