import { describe, it, expect } from "vitest";
import { menuSeedData, scheduleSeedData } from "@/db/menu-data";

describe("menuSeedData", () => {
  it("should have at least 1 menu per category", () => {
    const categories = new Set(menuSeedData.map((m) => m.category));
    expect(categories).toContain("acupuncture");
    expect(categories).toContain("chiropractic");
    expect(categories).toContain("massage");
  });

  it("should have positive durations and prices", () => {
    menuSeedData.forEach((m) => {
      expect(m.duration).toBeGreaterThan(0);
      expect(m.price).toBeGreaterThan(0);
    });
  });

  it("should have unique sort orders", () => {
    const orders = menuSeedData.map((m) => m.sortOrder);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("should have non-empty names and descriptions", () => {
    menuSeedData.forEach((m) => {
      expect(m.name.length).toBeGreaterThan(0);
      expect(m.description.length).toBeGreaterThan(0);
    });
  });
});

describe("scheduleSeedData", () => {
  it("should cover all 7 days of the week", () => {
    const days = new Set(scheduleSeedData.map((s) => s.dayOfWeek));
    expect(days).toEqual(new Set([0, 1, 2, 3, 4, 5, 6]));
  });

  it("should mark Sunday as holiday", () => {
    const sunday = scheduleSeedData.filter((s) => s.dayOfWeek === 0);
    expect(sunday.length).toBeGreaterThan(0);
    sunday.forEach((s) => {
      expect(s.isHoliday).toBe(true);
    });
  });

  it("should have non-holiday weekdays", () => {
    for (let day = 1; day <= 6; day++) {
      const daySchedules = scheduleSeedData.filter(
        (s) => s.dayOfWeek === day,
      );
      daySchedules.forEach((s) => {
        expect(s.isHoliday).toBe(false);
      });
    }
  });

  it("should have valid time format (HH:MM)", () => {
    const timeRegex = /^\d{2}:\d{2}$/;
    scheduleSeedData.forEach((s) => {
      expect(s.startTime).toMatch(timeRegex);
      expect(s.endTime).toMatch(timeRegex);
    });
  });

  it("should have positive slotInterval", () => {
    scheduleSeedData.forEach((s) => {
      expect(s.slotInterval).toBeGreaterThan(0);
    });
  });
});
