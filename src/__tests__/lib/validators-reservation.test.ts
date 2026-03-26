import { describe, it, expect } from "vitest";
import { reservationSchema } from "@/lib/validators/reservation";

const validData = {
  menuId: "550e8400-e29b-41d4-a716-446655440000",
  reservationDate: "2026-04-01",
  reservationTime: "10:00",
  patientName: "山田太郎",
  patientKana: "ヤマダ タロウ",
  phone: "09012345678",
  email: "test@example.com",
  isFirstVisit: true,
  symptoms: "肩こり",
};

describe("reservationSchema", () => {
  it("should accept valid data", () => {
    const result = reservationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept data without optional fields (symptoms)", () => {
    const { symptoms, ...required } = validData;
    const result = reservationSchema.safeParse(required);
    expect(result.success).toBe(true);
  });

  it("should accept empty email string (email is optional in API)", () => {
    const result = reservationSchema.safeParse({ ...validData, email: "" });
    expect(result.success).toBe(true);
  });

  it("should accept missing email (email is optional in API)", () => {
    const { email, ...rest } = validData;
    const result = reservationSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it("should accept non-UUID menuId (custom format allowed)", () => {
    const result = reservationSchema.safeParse({ ...validData, menuId: "menu-acupuncture-hari-0001" });
    expect(result.success).toBe(true);
  });

  it("should reject empty menuId", () => {
    const result = reservationSchema.safeParse({ ...validData, menuId: "" });
    expect(result.success).toBe(false);
  });

  it("should reject invalid date format", () => {
    const result = reservationSchema.safeParse({
      ...validData,
      reservationDate: "04/01/2026",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid time format", () => {
    const result = reservationSchema.safeParse({
      ...validData,
      reservationTime: "10:00:00",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty patientName", () => {
    const result = reservationSchema.safeParse({
      ...validData,
      patientName: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject patientName over 50 chars", () => {
    const result = reservationSchema.safeParse({
      ...validData,
      patientName: "あ".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-katakana patientKana", () => {
    const result = reservationSchema.safeParse({
      ...validData,
      patientKana: "やまだ たろう",
    });
    expect(result.success).toBe(false);
  });

  it("should reject phone not starting with 0", () => {
    const result = reservationSchema.safeParse({
      ...validData,
      phone: "12345678901",
    });
    expect(result.success).toBe(false);
  });

  it("should reject phone with wrong length", () => {
    const result = reservationSchema.safeParse({
      ...validData,
      phone: "0123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid email format", () => {
    const result = reservationSchema.safeParse({
      ...validData,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("should reject symptoms over 500 chars", () => {
    const result = reservationSchema.safeParse({
      ...validData,
      symptoms: "あ".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-empty honeypot (bot detection)", () => {
    const result = reservationSchema.safeParse({
      ...validData,
      honeypot: "bot-filled",
    });
    expect(result.success).toBe(false);
  });

  it("should accept empty honeypot", () => {
    const result = reservationSchema.safeParse({
      ...validData,
      honeypot: "",
    });
    expect(result.success).toBe(true);
  });
});
