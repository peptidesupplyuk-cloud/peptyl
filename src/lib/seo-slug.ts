import { peptides, type PeptideData } from "@/data/peptides";
import { supplements, type SupplementData } from "@/data/supplements";

/**
 * URL-safe slug from a compound name.
 * "BPC-157" -> "bpc-157", "MOTS-c" -> "mots-c", "5-HTP" -> "5-htp",
 * "Vitamin D3" -> "vitamin-d3", "GHK-Cu" -> "ghk-cu".
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findPeptideBySlug(slug: string): PeptideData | undefined {
  const target = slug.toLowerCase();
  return peptides.find((p) => toSlug(p.name) === target);
}

export function findSupplementBySlug(slug: string): SupplementData | undefined {
  const target = slug.toLowerCase();
  return supplements.find((s) => toSlug(s.name) === target);
}

export function allPeptideSlugs(): string[] {
  return peptides.map((p) => toSlug(p.name));
}

export function allSupplementSlugs(): string[] {
  return supplements.map((s) => toSlug(s.name));
}
