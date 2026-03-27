// @vitest-environment node
import { describe, it, expect } from "vitest";

/**
 * Adherence percentage invariant tests.
 * These validate the core math rules that must always hold.
 */

function clampPct(completed: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.min(100, Math.round((completed / total) * 100));
}

describe("Adherence percentage clamping", () => {
  it("returns null when total is 0", () => {
    expect(clampPct(0, 0)).toBeNull();
  });

  it("returns 100 when completed equals total", () => {
    expect(clampPct(10, 10)).toBe(100);
  });

  it("caps at 100 even when completed exceeds total (double-log edge case)", () => {
    expect(clampPct(15, 10)).toBe(100);
  });

  it("handles normal partial adherence", () => {
    expect(clampPct(7, 10)).toBe(70);
  });

  it("returns 0 when nothing completed", () => {
    expect(clampPct(0, 10)).toBe(0);
  });

  it("handles single-dose protocols", () => {
    expect(clampPct(1, 1)).toBe(100);
  });
});
