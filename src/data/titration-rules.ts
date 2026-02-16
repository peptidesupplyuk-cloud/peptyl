/**
 * Dose escalation safety rules for compounds that require careful titration.
 * Doses are in mcg. Weekly load = dose_mcg × injections_per_week.
 */

export interface TitrationRule {
  /** Compound name — must match peptides.ts / protocol_peptides.peptide_name */
  compound: string;
  /** Maximum recommended single-step dose increase (mcg) */
  maxStepMcg: number;
  /** Minimum weeks between dose increases */
  minWeeksBetweenSteps: number;
  /** Absolute max weekly load (mcg) — dose × injections/week */
  maxWeeklyLoadMcg: number;
  /** Max per-session dose (mcg) */
  maxSessionMcg: number;
  /** Human-readable guidance shown in the warning */
  guidance: string;
}

export const TITRATION_RULES: TitrationRule[] = [
  {
    compound: "Tirzepatide",
    maxStepMcg: 2500,          // 2.5mg
    minWeeksBetweenSteps: 4,
    maxWeeklyLoadMcg: 15000,   // 15mg/week
    maxSessionMcg: 15000,      // 15mg single dose
    guidance: "Tirzepatide is typically titrated by 2.5mg every 4 weeks. Jumping doses increases risk of severe GI side effects (nausea, vomiting).",
  },
  {
    compound: "Retatrutide",
    maxStepMcg: 2000,          // 2mg
    minWeeksBetweenSteps: 4,
    maxWeeklyLoadMcg: 12000,   // 12mg/week
    maxSessionMcg: 12000,
    guidance: "Retatrutide should be titrated by no more than 2mg every 4 weeks. Rapid escalation significantly increases nausea, diarrhoea, and vomiting risk.",
  },
  {
    compound: "Semaglutide",
    maxStepMcg: 500,           // 0.5mg
    minWeeksBetweenSteps: 4,
    maxWeeklyLoadMcg: 2400,    // 2.4mg/week
    maxSessionMcg: 2400,
    guidance: "Semaglutide follows a strict titration: 0.25mg → 0.5mg → 1mg → 1.7mg → 2.4mg, each step held for ≥4 weeks.",
  },
  {
    compound: "Melanotan II",
    maxStepMcg: 250,           // 0.25mg
    minWeeksBetweenSteps: 1,
    maxWeeklyLoadMcg: 7000,    // ~1mg/day
    maxSessionMcg: 1000,       // 1mg max per session
    guidance: "MT-II should be started at 0.1-0.25mg and increased slowly. High doses increase risk of nausea, facial flushing, and blood pressure changes.",
  },
];

/** Frequency → approximate injections per week */
export function frequencyToWeeklyCount(frequency: string): number {
  switch (frequency.toLowerCase()) {
    case "daily":      return 7;
    case "eod":        return 3.5;
    case "2x/week":    return 2;
    case "3x/week":    return 3;
    case "5on/2off":   return 5;
    case "weekly":     return 1;
    default:           return 1;
  }
}

export interface EscalationWarning {
  compound: string;
  currentWeeklyMcg: number;
  proposedWeeklyMcg: number;
  percentIncrease: number;
  guidance: string;
  severity: "caution" | "danger";
}

/**
 * Check proposed peptides against existing active protocols.
 * Returns warnings for any flagged escalations.
 */
export function checkDoseEscalation(
  proposedPeptides: { peptide_name: string; dose_mcg: number; frequency: string }[],
  existingProtocolPeptides: { peptide_name: string; dose_mcg: number; frequency: string }[],
): EscalationWarning[] {
  const warnings: EscalationWarning[] = [];

  for (const proposed of proposedPeptides) {
    const rule = TITRATION_RULES.find(
      (r) => r.compound.toLowerCase() === proposed.peptide_name.toLowerCase()
    );
    if (!rule) continue;

    const proposedWeekly = proposed.dose_mcg * frequencyToWeeklyCount(proposed.frequency);

    // Check against existing protocols for same compound
    const existing = existingProtocolPeptides.filter(
      (ep) => ep.peptide_name.toLowerCase() === proposed.peptide_name.toLowerCase()
    );

    if (existing.length > 0) {
      const currentWeekly = Math.max(
        ...existing.map((e) => e.dose_mcg * frequencyToWeeklyCount(e.frequency))
      );
      const increase = proposedWeekly - currentWeekly;
      const percentIncrease = currentWeekly > 0 ? Math.round((increase / currentWeekly) * 100) : 100;

      if (increase > rule.maxStepMcg || percentIncrease >= 50) {
        warnings.push({
          compound: proposed.peptide_name,
          currentWeeklyMcg: currentWeekly,
          proposedWeeklyMcg: proposedWeekly,
          percentIncrease,
          guidance: rule.guidance,
          severity: percentIncrease >= 100 ? "danger" : "caution",
        });
      }
    }

    // Check absolute limits even without prior protocol
    if (proposedWeekly > rule.maxWeeklyLoadMcg) {
      // Avoid duplicating if already flagged
      if (!warnings.find((w) => w.compound === proposed.peptide_name)) {
        warnings.push({
          compound: proposed.peptide_name,
          currentWeeklyMcg: 0,
          proposedWeeklyMcg: proposedWeekly,
          percentIncrease: 100,
          guidance: `Proposed weekly dose (${(proposedWeekly / 1000).toFixed(1)}mg) exceeds the recommended maximum of ${(rule.maxWeeklyLoadMcg / 1000).toFixed(1)}mg/week. ${rule.guidance}`,
          severity: "danger",
        });
      }
    }

    if (proposed.dose_mcg > rule.maxSessionMcg) {
      if (!warnings.find((w) => w.compound === proposed.peptide_name)) {
        warnings.push({
          compound: proposed.peptide_name,
          currentWeeklyMcg: 0,
          proposedWeeklyMcg: proposedWeekly,
          percentIncrease: 100,
          guidance: `Single session dose (${(proposed.dose_mcg / 1000).toFixed(1)}mg) exceeds recommended max of ${(rule.maxSessionMcg / 1000).toFixed(1)}mg. ${rule.guidance}`,
          severity: "danger",
        });
      }
    }
  }

  return warnings;
}
