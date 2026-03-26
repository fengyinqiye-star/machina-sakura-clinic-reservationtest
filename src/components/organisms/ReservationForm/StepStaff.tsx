"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/atoms/Button";
import type { Staff } from "@/db/schema";

interface StaffForSelection {
  id: string;
  name: string;
  specialties: string | null;
  profileImageUrl: string | null;
  color: string;
}

interface StepStaffProps {
  menuCategory: string;
  selectedStaffId: string | null;
  onSelect: (staffId: string, staffName: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  acupuncture: "鍼灸",
  chiropractic: "整体",
  massage: "マッサージ",
};

export default function StepStaff({
  menuCategory,
  selectedStaffId,
  onSelect,
  onNext,
  onBack,
}: StepStaffProps) {
  const [staffList, setStaffList] = useState<StaffForSelection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/menus/staff");
      if (r.ok) {
        const data = await r.json();
        const allStaff: StaffForSelection[] = data.staff || [];
        // Filter staff whose specialties include the selected menu category
        const filtered = allStaff.filter((s) => {
          if (!s.specialties) return false;
          try {
            const specs = JSON.parse(s.specialties);
            return Array.isArray(specs) && specs.includes(menuCategory);
          } catch {
            return false;
          }
        });
        // If no staff matches the category, show all staff
        setStaffList(filtered.length > 0 ? filtered : allStaff);
      }
    } catch {
      // Staff selection is optional - fail gracefully
    }
    setLoading(false);
  }, [menuCategory]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Parse specialties for display
  const getSpecialtyLabels = (specialties: string | null): string => {
    if (!specialties) return "";
    try {
      const specs = JSON.parse(specialties);
      if (!Array.isArray(specs)) return "";
      return specs
        .map((s: string) => CATEGORY_LABELS[s] || s)
        .join(" / ");
    } catch {
      return "";
    }
  };

  // Generate initials for staff without profile image
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.slice(0, 2);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        スタッフ情報を読み込み中...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold text-gray-800">
        Step 2: スタッフを選択
      </h3>
      <p className="text-sm text-gray-500">
        ご希望のスタッフを選択してください。「指名なし」の場合は空いているスタッフが担当します。
      </p>

      {/* "No preference" option */}
      <button
        type="button"
        onClick={() => onSelect("", "指名なし")}
        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
          selectedStaffId === ""
            ? "border-sakura-400 bg-sakura-50"
            : "border-gray-200 hover:border-sakura-200"
        }`}
      >
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="text-left">
          <p className="font-medium text-gray-800">指名なし</p>
          <p className="text-sm text-gray-500">空いているスタッフが担当します</p>
        </div>
        {selectedStaffId === "" && (
          <div className="ml-auto shrink-0">
            <div className="w-6 h-6 rounded-full bg-sakura-400 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </button>

      {/* Staff cards */}
      <div className="grid gap-3">
        {staffList.map((s) => {
          const isSelected = selectedStaffId === s.id;
          const specialtyText = getSpecialtyLabels(s.specialties);

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id, s.name)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                isSelected
                  ? "border-sakura-400 bg-sakura-50"
                  : "border-gray-200 hover:border-sakura-200"
              }`}
            >
              {/* Staff avatar */}
              {s.profileImageUrl ? (
                <img
                  src={s.profileImageUrl}
                  alt={s.name}
                  className="w-14 h-14 rounded-full object-cover shrink-0 border-2"
                  style={{ borderColor: s.color }}
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-lg"
                  style={{ backgroundColor: s.color }}
                >
                  {getInitials(s.name)}
                </div>
              )}

              {/* Staff info */}
              <div className="text-left min-w-0 flex-1">
                <p className="font-medium text-gray-800">{s.name}</p>
                {specialtyText && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {specialtyText}
                  </p>
                )}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="ml-auto shrink-0">
                  <div className="w-6 h-6 rounded-full bg-sakura-400 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack}>
          戻る
        </Button>
        <Button onClick={onNext} disabled={selectedStaffId === null}>
          次へ
        </Button>
      </div>
    </div>
  );
}
