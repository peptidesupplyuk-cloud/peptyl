import { describe, it, expect } from "vitest";
import { toText, toStringArray, toUniqueStringArray } from "@/lib/dna-normalise";

/**
 * These tests lock down the shape contract for AI-pipeline data.
 *
 * Background: the DNA report pipeline has historically returned the same
 * logical field as a string, an array, an object, or null on different runs.
 * That caused crashes ("Objects are not valid as a React child") and blank
 * sections. Every report consumer routes untrusted data through these helpers
 * — if any of these tests fail, a downstream component will visibly break.
 */
describe("dna-normalise", () => {
  describe("toText", () => {
    it("passes through strings (trimmed)", () => {
      expect(toText("  hello  ")).toBe("hello");
    });

    it("returns empty string for null/undefined", () => {
      expect(toText(null)).toBe("");
      expect(toText(undefined)).toBe("");
    });

    it("stringifies numbers and booleans", () => {
      expect(toText(42)).toBe("42");
      expect(toText(true)).toBe("true");
    });

    it("extracts text from common LLM object shapes", () => {
      expect(toText({ text: "foo" })).toBe("foo");
      expect(toText({ value: "bar" })).toBe("bar");
      expect(toText({ flag: "baz" })).toBe("baz");
      expect(toText({ description: "qux" })).toBe("qux");
      expect(toText({ action: "do something" })).toBe("do something");
    });

    it("falls back to JSON for unrecognised objects so it never crashes", () => {
      const out = toText({ random: "shape" });
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
    });
  });

  describe("toStringArray", () => {
    it("returns [] for null/undefined", () => {
      expect(toStringArray(null)).toEqual([]);
      expect(toStringArray(undefined)).toEqual([]);
    });

    it("returns array of strings unchanged", () => {
      expect(toStringArray(["a", "b"])).toEqual(["a", "b"]);
    });

    it("normalises arrays of objects to strings", () => {
      expect(toStringArray([{ text: "a" }, { value: "b" }])).toEqual(["a", "b"]);
    });

    it("wraps a single string into an array", () => {
      expect(toStringArray("solo")).toEqual(["solo"]);
    });

    it("wraps a single object into an array of one string", () => {
      expect(toStringArray({ text: "solo" })).toEqual(["solo"]);
    });

    it("drops empty / null / undefined entries", () => {
      expect(toStringArray(["", null, undefined, "ok"])).toEqual(["ok"]);
    });
  });

  describe("toUniqueStringArray", () => {
    it("removes case-insensitive duplicates while preserving order", () => {
      expect(toUniqueStringArray(["A", "b", "a", "B", "c"])).toEqual(["A", "b", "c"]);
    });
  });
});
