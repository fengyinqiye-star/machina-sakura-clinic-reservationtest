"use client";

interface TimeSlotButtonProps {
  time: string;
  available: boolean;
  selected: boolean;
  onClick: () => void;
}

export default function TimeSlotButton({
  time,
  available,
  selected,
  onClick,
}: TimeSlotButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!available}
      className={`
        px-4 py-3 rounded-lg text-sm font-medium
        transition-colors duration-200
        min-w-[80px] min-h-[44px]
        ${
          selected
            ? "bg-sakura-400 text-white ring-2 ring-sakura-300"
            : available
              ? "bg-white border border-gray-300 hover:border-sakura-400 hover:bg-sakura-50 text-gray-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
        }
      `}
    >
      {time}
    </button>
  );
}
