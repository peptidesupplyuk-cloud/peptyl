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
  supplements?: {
    name: string;
    dose: string;
    frequency: string;
  }[];
  durationWeeks: number;
  retestWeeks: number;
  source?: string;
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
      supplements: [
        { name: "Magnesium Glycinate", dose: "400mg", frequency: "Before bed" },
        { name: "Zinc Picolinate", dose: "50mg", frequency: "Daily" },
      ],
      durationWeeks: 12,
      retestWeeks: 8,
      source: "Clinical endocrinology guidelines",
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
      supplements: [
        { name: "Omega-3 Fish Oil", dose: "2000mg EPA/DHA", frequency: "Daily" },
        { name: "NAC", dose: "600mg", frequency: "Twice daily" },
      ],
      durationWeeks: 4,
      retestWeeks: 6,
      source: "Inflammation biomarker research",
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
      supplements: [
        { name: "Berberine HCl", dose: "500mg", frequency: "With meals, 2-3x daily" },
        { name: "Creatine Monohydrate", dose: "5g", frequency: "Daily" },
      ],
      durationWeeks: 12,
      retestWeeks: 12,
      source: "Metabolic research",
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
      supplements: [
        { name: "Zinc Picolinate", dose: "50mg", frequency: "Daily" },
        { name: "Vitamin D3 + K2", dose: "5000 IU", frequency: "Daily" },
        { name: "Ashwagandha KSM-66", dose: "600mg", frequency: "Daily" },
      ],
      durationWeeks: 8,
      retestWeeks: 8,
      source: "Endocrinology literature",
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
      supplements: [
        { name: "Vitamin D3 + K2", dose: "5000 IU", frequency: "Daily with fat-containing meal" },
        { name: "Magnesium Glycinate", dose: "400mg", frequency: "Daily" },
      ],
      durationWeeks: 12,
      retestWeeks: 12,
      source: "Vitamin D Council guidelines",
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
      supplements: [
        { name: "Omega-3 Fish Oil", dose: "1000mg EPA/DHA", frequency: "Daily" },
        { name: "L-Glutamine", dose: "5g", frequency: "Twice daily" },
      ],
      durationWeeks: 6,
      retestWeeks: 8,
      source: "Anti-inflammatory protocol research",
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
      supplements: [
        { name: "Berberine HCl", dose: "500mg", frequency: "With meals, 2-3x daily" },
        { name: "NAC", dose: "600mg", frequency: "Twice daily" },
      ],
      durationWeeks: 8,
      retestWeeks: 8,
      source: "Insulin resistance research",
    },
  },
];

// BMI-based recommendations (called separately with biometrics)
export interface BiometricRecommendation {
  id: string;
  title: string;
  description: string;
  supplements: { name: string; dose: string; frequency: string }[];
  source: string;
}

export function getBiometricRecommendations(bio: {
  height_cm?: number | null;
  weight_kg?: number | null;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
}): BiometricRecommendation[] {
  const results: BiometricRecommendation[] = [];

  if (bio.height_cm && bio.weight_kg) {
    const bmi = bio.weight_kg / Math.pow(bio.height_cm / 100, 2);
    if (bmi >= 30) {
      results.push({
        id: "bmi_obese",
        title: "Weight Management Support",
        description: `BMI ${bmi.toFixed(1)} — consider metabolic support alongside lifestyle changes.`,
        supplements: [
          { name: "Berberine HCl", dose: "500mg", frequency: "With meals" },
          { name: "Omega-3 Fish Oil", dose: "2000mg EPA/DHA", frequency: "Daily" },
          { name: "Creatine Monohydrate", dose: "5g", frequency: "Daily" },
        ],
        source: "Metabolic health guidelines",
      });
    } else if (bmi >= 25) {
      results.push({
        id: "bmi_overweight",
        title: "Metabolic Optimisation",
        description: `BMI ${bmi.toFixed(1)} — consider supporting metabolic health.`,
        supplements: [
          { name: "Berberine HCl", dose: "500mg", frequency: "With meals" },
          { name: "Omega-3 Fish Oil", dose: "1000mg EPA/DHA", frequency: "Daily" },
        ],
        source: "Metabolic health research",
      });
    }
  }

  if (bio.bp_systolic && bio.bp_diastolic) {
    if (bio.bp_systolic >= 130 || bio.bp_diastolic >= 85) {
      results.push({
        id: "bp_elevated",
        title: "Blood Pressure Support",
        description: `BP ${bio.bp_systolic}/${bio.bp_diastolic} mmHg — consider cardiovascular support supplements.`,
        supplements: [
          { name: "Magnesium Glycinate", dose: "400mg", frequency: "Before bed" },
          { name: "Omega-3 Fish Oil", dose: "2000mg EPA/DHA", frequency: "Daily" },
        ],
        source: "Cardiovascular health guidelines",
      });
    }
  }

  return results;
}

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
