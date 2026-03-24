import { describe, it, expect } from "vitest";
import { reservationSchema } from "@/lib/validators/reservation";
import { menuSchema } from "@/lib/validators/menu";

// =============================================================================
// 1. Reservation Validator Tests
// =============================================================================
describe("reservationSchema", () => {
  const validReservation = {
    menuId: "123e4567-e89b-12d3-a456-426614174000",
    reservationDate: "2026-04-01",
    reservationTime: "10:00",
    patientName: "山田太郎",
    patientKana: "ヤマダタロウ",
    phone: "09012345678",
    email: "test@example.com",
    isFirstVisit: true,
    symptoms: "肩こりがひどい",
    honeypot: "",
  };

  it("should accept valid reservation data", () => {
    const result = reservationSchema.safeParse(validReservation);
    expect(result.success).toBe(true);
  });

  it("should accept reservation without optional fields", () => {
    const { email, symptoms, honeypot, ...required } = validReservation;
    const result = reservationSchema.safeParse({ ...required, isFirstVisit: false });
    expect(result.success).toBe(true);
  });

  it("should reject invalid date format", () => {
    const result = reservationSchema.safeParse({
      ...validReservation,
      reservationDate: "2026/04/01",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid time format", () => {
    const result = reservationSchema.safeParse({
      ...validReservation,
      reservationTime: "10:00:00",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid phone number", () => {
    const result = reservationSchema.safeParse({
      ...validReservation,
      phone: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-katakana kana", () => {
    const result = reservationSchema.safeParse({
      ...validReservation,
      patientKana: "やまだたろう",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty patient name", () => {
    const result = reservationSchema.safeParse({
      ...validReservation,
      patientName: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject honeypot filled (bot detection)", () => {
    const result = reservationSchema.safeParse({
      ...validReservation,
      honeypot: "I am a bot",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid menuId (not UUID)", () => {
    const result = reservationSchema.safeParse({
      ...validReservation,
      menuId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("should accept empty string for email", () => {
    const result = reservationSchema.safeParse({
      ...validReservation,
      email: "",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email format", () => {
    const result = reservationSchema.safeParse({
      ...validReservation,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("should reject symptoms over 500 characters", () => {
    const result = reservationSchema.safeParse({
      ...validReservation,
      symptoms: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// 2. Menu Validator Tests
// =============================================================================
describe("menuSchema", () => {
  const validMenu = {
    name: "鍼灸治療",
    category: "acupuncture" as const,
    description: "肩こりや腰痛に効果的な鍼灸治療です",
    duration: 60,
    price: 5000,
    targetSymptoms: "肩こり、腰痛",
    sortOrder: 1,
    isActive: true,
  };

  it("should accept valid menu data", () => {
    const result = menuSchema.safeParse(validMenu);
    expect(result.success).toBe(true);
  });

  it("should apply defaults for optional fields", () => {
    const result = menuSchema.safeParse({
      name: "整体",
      category: "chiropractic",
      duration: 30,
      price: 3000,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
      expect(result.data.sortOrder).toBe(0);
      expect(result.data.description).toBe("");
    }
  });

  it("should reject invalid category", () => {
    const result = menuSchema.safeParse({
      ...validMenu,
      category: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should reject duration less than 10", () => {
    const result = menuSchema.safeParse({
      ...validMenu,
      duration: 5,
    });
    expect(result.success).toBe(false);
  });

  it("should reject duration over 180", () => {
    const result = menuSchema.safeParse({
      ...validMenu,
      duration: 200,
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative price", () => {
    const result = menuSchema.safeParse({
      ...validMenu,
      price: -100,
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty menu name", () => {
    const result = menuSchema.safeParse({
      ...validMenu,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("should accept all three categories", () => {
    for (const category of ["acupuncture", "chiropractic", "massage"]) {
      const result = menuSchema.safeParse({ ...validMenu, category });
      expect(result.success).toBe(true);
    }
  });
});
