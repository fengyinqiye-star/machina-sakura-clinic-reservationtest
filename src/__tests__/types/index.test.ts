import { describe, it, expect } from "vitest";
import type { TimeSlot, StaffRole, StaffScheduleEntry } from "@/types";
import {
  MENU_CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  STAFF_ROLE_LABELS,
  DAY_OF_WEEK_LABELS,
} from "@/types";

describe("TimeSlot type", () => {
  it("should allow availableStaffCount to be optional", () => {
    const slot1: TimeSlot = { time: "10:00", available: true };
    const slot2: TimeSlot = {
      time: "10:00",
      available: true,
      availableStaffCount: 3,
    };
    expect(slot1.availableStaffCount).toBeUndefined();
    expect(slot2.availableStaffCount).toBe(3);
  });
});

describe("MENU_CATEGORY_LABELS", () => {
  it("should have all 3 categories", () => {
    expect(Object.keys(MENU_CATEGORY_LABELS)).toHaveLength(3);
    expect(MENU_CATEGORY_LABELS.acupuncture).toBe("鍼灸");
    expect(MENU_CATEGORY_LABELS.chiropractic).toBe("整体");
    expect(MENU_CATEGORY_LABELS.massage).toBe("マッサージ");
  });
});

describe("STATUS_LABELS", () => {
  it("should cover all 4 statuses", () => {
    expect(Object.keys(STATUS_LABELS)).toHaveLength(4);
    expect(STATUS_LABELS.new).toBeDefined();
    expect(STATUS_LABELS.confirmed).toBeDefined();
    expect(STATUS_LABELS.completed).toBeDefined();
    expect(STATUS_LABELS.cancelled).toBeDefined();
  });
});

describe("STATUS_COLORS", () => {
  it("should have CSS classes for all statuses", () => {
    Object.values(STATUS_COLORS).forEach((cls) => {
      expect(cls).toContain("bg-");
      expect(cls).toContain("text-");
    });
  });
});

describe("STAFF_ROLE_LABELS", () => {
  it("should have practitioner and reception", () => {
    expect(STAFF_ROLE_LABELS.practitioner).toBe("施術者");
    expect(STAFF_ROLE_LABELS.reception).toBe("受付");
  });
});

describe("DAY_OF_WEEK_LABELS", () => {
  it("should have 7 labels starting with Sunday", () => {
    expect(DAY_OF_WEEK_LABELS).toHaveLength(7);
    expect(DAY_OF_WEEK_LABELS[0]).toBe("日");
    expect(DAY_OF_WEEK_LABELS[6]).toBe("土");
  });
});
