import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Use a unique IP per test to avoid cross-test state
    vi.useFakeTimers();
  });

  it("should allow the first request", () => {
    const ip = `rate-test-${Date.now()}-1`;
    expect(checkRateLimit(ip)).toBe(true);
  });

  it("should allow up to 5 requests within the window", () => {
    const ip = `rate-test-${Date.now()}-2`;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip)).toBe(true);
    }
  });

  it("should deny the 6th request within the window", () => {
    const ip = `rate-test-${Date.now()}-3`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip)).toBe(false);
  });

  it("should reset after the window expires", () => {
    const ip = `rate-test-${Date.now()}-4`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip)).toBe(false);

    // Advance time past the 1-minute window
    vi.advanceTimersByTime(61 * 1000);
    expect(checkRateLimit(ip)).toBe(true);
  });

  it("should track different IPs independently", () => {
    const ip1 = `rate-test-${Date.now()}-5a`;
    const ip2 = `rate-test-${Date.now()}-5b`;

    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip1);
    }
    expect(checkRateLimit(ip1)).toBe(false);
    expect(checkRateLimit(ip2)).toBe(true);
  });
});
