import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots, getStaffForDate } from "@/lib/slots";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const menuId = searchParams.get("menuId");

  if (!date || !menuId) {
    return NextResponse.json(
      { error: "date と menuId パラメータが必要です" },
      { status: 400 },
    );
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "日付の形式が正しくありません (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  // Check if date is in the past
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
  if (date < todayStr) {
    return NextResponse.json(
      { error: "過去の日付は指定できません" },
      { status: 400 },
    );
  }

  try {
    const [result, staffForDate] = await Promise.all([
      getAvailableSlots(date, menuId),
      getStaffForDate(date),
    ]);
    return NextResponse.json({ date, ...result, staffForDate });
  } catch (error) {
    console.error("Failed to fetch available slots:", error);
    const message = error instanceof Error ? error.message : "空き枠の取得に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
