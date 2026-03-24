import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reservations, menus, schedules } from "@/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";
import { reservationSchema } from "@/lib/validators/reservation";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendClinicNotification, sendPatientConfirmation } from "@/lib/email/send";
import { MENU_CATEGORY_LABELS, type MenuCategory } from "@/types";

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: "リクエストが多すぎます。しばらくしてからお試しください。" },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();

    // Honeypot check
    if (body.honeypot) {
      // Silently discard bot submissions
      return NextResponse.json({ success: true, reservation: { id: "dummy" } });
    }

    // Validate
    const parsed = reservationSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "入力内容に誤りがあります";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const data = parsed.data;

    // Get menu info
    const menuRows = await db.select().from(menus).where(eq(menus.id, data.menuId)).limit(1);
    if (menuRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "指定されたメニューが見つかりません" },
        { status: 400 },
      );
    }
    const menu = menuRows[0];

    // Check slot availability (re-verify to prevent conflicts)
    const dateObj = new Date(data.reservationDate + "T00:00:00");
    const dayOfWeek = dateObj.getDay();

    let scheduleRows = await db
      .select()
      .from(schedules)
      .where(eq(schedules.specificDate, data.reservationDate));

    if (scheduleRows.length === 0) {
      scheduleRows = await db
        .select()
        .from(schedules)
        .where(eq(schedules.dayOfWeek, dayOfWeek));
    }

    if (scheduleRows.length === 0 || scheduleRows.some((s) => s.isHoliday)) {
      return NextResponse.json(
        { success: false, error: "指定された日は休業日です" },
        { status: 400 },
      );
    }

    const maxSlots = scheduleRows[0].maxSlots;

    // Count existing reservations for this slot
    const existingCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(reservations)
      .where(
        and(
          eq(reservations.reservationDate, data.reservationDate),
          eq(reservations.reservationTime, data.reservationTime),
          ne(reservations.status, "cancelled"),
        ),
      );

    const count = existingCount[0]?.count || 0;
    if (count >= maxSlots) {
      return NextResponse.json(
        { success: false, error: "指定の時間枠は既に予約が埋まっています" },
        { status: 409 },
      );
    }

    // Insert reservation
    const newReservation = await db
      .insert(reservations)
      .values({
        patientName: data.patientName,
        patientKana: data.patientKana,
        phone: data.phone,
        email: data.email || null,
        menuId: data.menuId,
        reservationDate: data.reservationDate,
        reservationTime: data.reservationTime,
        isFirstVisit: data.isFirstVisit,
        symptoms: data.symptoms || null,
        status: "new",
      })
      .returning();

    const reservation = newReservation[0];

    // Send emails (non-blocking)
    const emailData = {
      id: reservation.id,
      patientName: data.patientName,
      patientKana: data.patientKana,
      phone: data.phone,
      email: data.email || null,
      menuName: menu.name,
      menuCategory: MENU_CATEGORY_LABELS[menu.category as MenuCategory],
      reservationDate: data.reservationDate,
      reservationTime: data.reservationTime,
      isFirstVisit: data.isFirstVisit,
      symptoms: data.symptoms || null,
    };

    // Send emails without waiting
    sendClinicNotification(emailData).catch(console.error);
    sendPatientConfirmation(emailData).catch(console.error);

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        menuName: menu.name,
        reservationDate: data.reservationDate,
        reservationTime: data.reservationTime,
        patientName: data.patientName,
        isFirstVisit: data.isFirstVisit,
      },
    });
  } catch (error) {
    console.error("Failed to create reservation:", error);
    return NextResponse.json(
      { success: false, error: "予約の作成に失敗しました。もう一度お試しください。" },
      { status: 500 },
    );
  }
}
