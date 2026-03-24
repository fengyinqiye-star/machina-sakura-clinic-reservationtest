import { describe, it, expect } from "vitest";
import {
  MENU_CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  type MenuCategory,
  type ReservationStatus,
} from "@/types";

// =============================================================================
// Types & Constants Tests
// =============================================================================
describe("MENU_CATEGORY_LABELS", () => {
  it("should have labels for all three categories", () => {
    const categories: MenuCategory[] = ["acupuncture", "chiropractic", "massage"];
    for (const cat of categories) {
      expect(MENU_CATEGORY_LABELS[cat]).toBeDefined();
      expect(typeof MENU_CATEGORY_LABELS[cat]).toBe("string");
      expect(MENU_CATEGORY_LABELS[cat].length).toBeGreaterThan(0);
    }
  });

  it("should have correct Japanese labels", () => {
    expect(MENU_CATEGORY_LABELS.acupuncture).toBe("鍼灸");
    expect(MENU_CATEGORY_LABELS.chiropractic).toBe("整体");
    expect(MENU_CATEGORY_LABELS.massage).toBe("マッサージ");
  });
});

describe("STATUS_LABELS", () => {
  it("should have labels for all reservation statuses", () => {
    const statuses: ReservationStatus[] = ["new", "confirmed", "completed", "cancelled"];
    for (const status of statuses) {
      expect(STATUS_LABELS[status]).toBeDefined();
      expect(typeof STATUS_LABELS[status]).toBe("string");
    }
  });
});

describe("STATUS_COLORS", () => {
  it("should have color classes for all reservation statuses", () => {
    const statuses: ReservationStatus[] = ["new", "confirmed", "completed", "cancelled"];
    for (const status of statuses) {
      expect(STATUS_COLORS[status]).toBeDefined();
      expect(STATUS_COLORS[status]).toContain("bg-");
      expect(STATUS_COLORS[status]).toContain("text-");
    }
  });
});
