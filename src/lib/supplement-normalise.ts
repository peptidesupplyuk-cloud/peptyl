/**
 * Canonical supplement name aliases.
 * Maps common variant names → canonical name used in our knowledge base.
 * Add new aliases here as naming inconsistencies are discovered.
 */
const ALIASES: Record<string, string> = {
  "omega-3 fish oil": "Omega-3 (EPA/DHA)",
  "omega 3 fish oil": "Omega-3 (EPA/DHA)",
  "omega-3": "Omega-3 (EPA/DHA)",
  "omega 3": "Omega-3 (EPA/DHA)",
  "omega-3 (epa/dha)": "Omega-3 (EPA/DHA)",
  "fish oil": "Omega-3 (EPA/DHA)",
  "epa/dha": "Omega-3 (EPA/DHA)",
  "epa dha": "Omega-3 (EPA/DHA)",
  "omega-3 fish oil 3000mg epa/dha": "Omega-3 (EPA/DHA)",
  "coq10": "CoQ10",
  "coq10 (ubiquinol)": "CoQ10 (Ubiquinol)",
  "ubiquinol": "CoQ10 (Ubiquinol)",
  "vitamin d": "Vitamin D3 + K2",
  "vitamin d3": "Vitamin D3 + K2",
  "vit d3": "Vitamin D3 + K2",
  "vitamin d3 + k2": "Vitamin D3 + K2",
  "mag glycinate": "Magnesium Glycinate",
  "magnesium": "Magnesium Glycinate",
  "magnesium glycinate": "Magnesium Glycinate",
  "vitamin c": "Vitamin C",
  "vit c": "Vitamin C",
  "berberine": "Berberine HCl",
  "berberine hcl": "Berberine HCl",
  "zinc": "Zinc",
};

/**
 * Normalise a supplement name to its canonical form.
 * Returns the original name (trimmed) if no alias is found.
 */
export function normaliseSupplementName(name: string): string {
  const trimmed = name.trim();
  const key = trimmed.toLowerCase();
  return ALIASES[key] ?? trimmed;
}

/**
 * Compare two supplement names for equivalence after normalisation.
 */
export function isSameSupplement(a: string, b: string): boolean {
  return normaliseSupplementName(a).toLowerCase() === normaliseSupplementName(b).toLowerCase();
}
