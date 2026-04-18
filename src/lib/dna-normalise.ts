/**
 * Defensive normalisation helpers for the DNA report pipeline.
 *
 * The AI synthesis layer occasionally returns:
 *   - strings where we expected arrays
 *   - objects where we expected strings (React crashes: "Objects are not valid as a React child")
 *   - arrays of strings OR arrays of {text, …} objects interchangeably
 *   - field-name drift (e.g. `name` vs `compound` vs `peptide`)
 *
 * Every consumer of `report_json` MUST run untrusted nested values through
 * these helpers before rendering. This file is the single source of truth for
 * shape coercion so we never re-introduce the "undefined" / blank-section /
 * crashed-section bugs that have surfaced repeatedly.
 */

/** Coerce any value into a clean printable string. Drops null/undefined. */
export function toText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);

  // Common LLM shapes: { text }, { value }, { label }, { description }, { flag }, { item }, { action }
  if (typeof v === "object") {
    const obj = v as Record<string, unknown>;
    const candidate =
      obj.text ?? obj.value ?? obj.label ?? obj.description ??
      obj.flag ?? obj.item ?? obj.action ?? obj.summary ?? obj.note ?? obj.message;
    if (typeof candidate === "string") return candidate.trim();
    if (typeof candidate === "number") return String(candidate);
    // Last-resort: serialise so we at least see *something* instead of crashing.
    try {
      return JSON.stringify(v);
    } catch {
      return "";
    }
  }
  return String(v);
}

/** Coerce any value into an array of clean strings. */
export function toStringArray(v: unknown): string[] {
  if (v === null || v === undefined) return [];
  if (Array.isArray(v)) {
    return v.map(toText).filter((s) => s.length > 0);
  }
  const single = toText(v);
  return single ? [single] : [];
}

/** Same as toStringArray, but keeps order while dropping duplicates. */
export function toUniqueStringArray(v: unknown): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of toStringArray(v)) {
    const k = s.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(s);
    }
  }
  return out;
}
