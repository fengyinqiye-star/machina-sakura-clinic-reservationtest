import { describe, it, expect } from "vitest";
import { staffSeedData, generateStaffScheduleSeedData } from "@/db/staff-data";

describe("staffSeedData", () => {
  it("should contain 3 practitioners", () => {
    expect(staffSeedData).toHaveLength(3);
    staffSeedData.forEach((s) => {
      expect(s.role).toBe("practitioner");
    });
  });

  it("should have unique names", () => {
    const names = staffSeedData.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("should have unique colors", () => {
    const colors = staffSeedData.map((s) => s.color);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it("should have ascending sortOrder", () => {
    for (let i = 1; i < staffSeedData.length; i++) {
      expect(staffSeedData[i].sortOrder).toBeGreaterThan(
        staffSeedData[i - 1].sortOrder,
      );
    }
  });

  it("should have non-empty specialties", () => {
    staffSeedData.forEach((s) => {
      expect(s.specialties).toBeTruthy();
      expect(s.specialties!.length).toBeGreaterThan(0);
    });
  });
});

describe("generateStaffScheduleSeedData", () => {
  const fakeStaffId = "test-staff-id-001";
  const schedules = generateStaffScheduleSeedData(fakeStaffId);

  it("should generate schedules for all 7 days of the week", () => {
    const days = new Set(schedules.map((s) => s.dayOfWeek));
    // Mon-Sat have schedules, Sunday has off
    expect(days).toEqual(new Set([0, 1, 2, 3, 4, 5, 6]));
  });

  it("should set staffId on all schedules", () => {
    schedules.forEach((s) => {
      expect(s.staffId).toBe(fakeStaffId);
    });
  });

  it("should have 2 periods for Mon-Fri (morning + afternoon)", () => {
    for (let day = 1; day <= 5; day++) {
      const daySchedules = schedules.filter((s) => s.dayOfWeek === day);
      expect(daySchedules).toHaveLength(2);
      // First period: morning
      expect(daySchedules[0].startTime).toBe("09:00");
      expect(daySchedules[0].endTime).toBe("12:30");
      expect(daySchedules[0].isOff).toBe(false);
      // Second period: afternoon
      expect(daySchedules[1].startTime).toBe("15:00");
      expect(daySchedules[1].endTime).toBe("20:00");
      expect(daySchedules[1].isOff).toBe(false);
    }
  });

  it("should have 1 period for Saturday", () => {
    const satSchedules = schedules.filter((s) => s.dayOfWeek === 6);
    expect(satSchedules).toHaveLength(1);
    expect(satSchedules[0].startTime).toBe("09:00");
    expect(satSchedules[0].endTime).toBe("14:00");
    expect(satSchedules[0].isOff).toBe(false);
  });

  it("should mark Sunday as off", () => {
    const sunSchedules = schedules.filter((s) => s.dayOfWeek === 0);
    expect(sunSchedules).toHaveLength(1);
    expect(sunSchedules[0].isOff).toBe(true);
  });

  it("should generate total of 12 schedule entries (2*5 + 1 + 1)", () => {
    // Mon-Fri: 2 periods each = 10, Sat: 1 period = 1, Sun: 1 off entry = 1
    expect(schedules).toHaveLength(12);
  });
});
