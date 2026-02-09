export interface Recommendation {
  id: string;
  protocolName: string;
  goal: string;
  triggerDescription: string;
  peptides: {
    name: string;
    dose_mcg: number;
    frequency: string;
    timing: string;
    route: string;
  }[];
  durationWeeks: number;
  retestWeeks: number;
}

interface Rule {
  marker: string;
  condition: (value: number) => boolean;
  recommendation: Recommendation;
}

export const RECOMMENDATION_RULES: Rule[] = [
  {
    marker: "igf1",
    condition: (v) => v < 200,
    recommendation: {
      id: "gh_optimization",
      protocolName: "GH Optimisation Protocol",
      goal: "Increase IGF-1 to optimal range (200-350 ng/mL)",
      triggerDescription: "IGF-1 below 200 ng/mL",
      peptides: [
        { name: "CJC-1295 (no DAC)", dose_mcg: 100, frequency: "5on/2off", timing: "PM", route: "SubQ" },
        { name: "Ipamorelin", dose_mcg: 200, frequency: "5on/2off", timing: "PM", route: "SubQ" },
      ],
      durationWeeks: 12,
      retestWeeks: 8,
    },
  },
  {
    marker: "hscrp",
    condition: (v) => v > 2.0,
    recommendation: {
      id: "anti_inflammatory",
      protocolName: "Anti-Inflammatory Protocol",
      goal: "Reduce hsCRP below 1.0 mg/L",
      triggerDescription: "hsCRP above 2.0 mg/L",
      peptides: [
        { name: "BPC-157", dose_mcg: 250, frequency: "daily", timing: "AM+PM", route: "SubQ" },
      ],
      durationWeeks: 4,
      retestWeeks: 6,
    },
  },
  {
    marker: "hba1c",
    condition: (v) => v >= 5.7 && v <= 6.4,
    recommendation: {
      id: "metabolic_protocol",
      protocolName: "Metabolic Optimisation Protocol",
      goal: "Improve HbA1c to optimal range (<5.3%)",
      triggerDescription: "HbA1c in pre-diabetic range (5.7-6.4%)",
      peptides: [
        { name: "AOD-9604", dose_mcg: 300, frequency: "daily", timing: "AM", route: "SubQ" },
      ],
      durationWeeks: 12,
      retestWeeks: 12,
    },
  },
  {
    marker: "total_testosterone",
    condition: (v) => v < 500,
    recommendation: {
      id: "testosterone_support",
      protocolName: "Testosterone Support Protocol",
      goal: "Support natural testosterone production (target >500 ng/dL)",
      triggerDescription: "Total Testosterone below 500 ng/dL",
      peptides: [
        { name: "Gonadorelin", dose_mcg: 200, frequency: "3x/week", timing: "AM", route: "SubQ" },
      ],
      durationWeeks: 8,
      retestWeeks: 8,
    },
  },
  {
    marker: "vitamin_d",
    condition: (v) => v < 30,
    recommendation: {
      id: "vitamin_d_support",
      protocolName: "Vitamin D Recovery",
      goal: "Increase Vitamin D to optimal range (50-80 ng/mL)",
      triggerDescription: "Vitamin D below 30 ng/mL — supplement recommended",
      peptides: [],
      durationWeeks: 12,
      retestWeeks: 12,
    },
  },
  {
    marker: "hscrp",
    condition: (v) => v > 1.0 && v <= 2.0,
    recommendation: {
      id: "mild_inflammation",
      protocolName: "Mild Inflammation Support",
      goal: "Reduce hsCRP below 1.0 mg/L with healing support",
      triggerDescription: "hsCRP mildly elevated (1.0-2.0 mg/L)",
      peptides: [
        { name: "BPC-157", dose_mcg: 250, frequency: "daily", timing: "AM", route: "SubQ" },
        { name: "TB-500", dose_mcg: 2500, frequency: "2x/week", timing: "AM", route: "SubQ" },
      ],
      durationWeeks: 6,
      retestWeeks: 8,
    },
  },
  {
    marker: "fasting_insulin",
    condition: (v) => v > 10,
    recommendation: {
      id: "insulin_sensitivity",
      protocolName: "Insulin Sensitivity Protocol",
      goal: "Reduce fasting insulin to optimal range (3-8 µIU/mL)",
      triggerDescription: "Fasting Insulin elevated (>10 µIU/mL)",
      peptides: [
        { name: "MOTS-c", dose_mcg: 5000, frequency: "3x/week", timing: "AM", route: "SubQ" },
      ],
      durationWeeks: 8,
      retestWeeks: 8,
    },
  },
];

export function getRecommendations(markers: Record<string, number>): Recommendation[] {
  const seen = new Set<string>();
  const results: Recommendation[] = [];

  for (const rule of RECOMMENDATION_RULES) {
    const value = markers[rule.marker];
    if (value !== undefined && rule.condition(value) && !seen.has(rule.recommendation.id)) {
      seen.add(rule.recommendation.id);
      results.push(rule.recommendation);
    }
  }

  return results;
}
