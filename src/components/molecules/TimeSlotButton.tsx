"use client";

interface TimeSlotButtonProps {
  time: string;
  available: boolean;
  selected: boolean;
  availableStaffCount?: number;
  onClick: () => void;
}

export default function TimeSlotButton({
  time,
  available,
  selected,
  availableStaffCount,
  onClick,
}: TimeSlotButtonProps) {
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

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!available}
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
  );
}
