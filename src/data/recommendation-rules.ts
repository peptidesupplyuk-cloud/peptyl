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
        { name: "BPC-157", dose_mcg: 500, frequency: "daily", timing: "AM", route: "SubQ" },
        { name: "TB-500", dose_mcg: 500, frequency: "daily", timing: "AM", route: "SubQ" },
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
  // --- NEW RULES ---
  {
    marker: "ferritin",
    condition: (v) => v > 300,
    recommendation: {
      id: "iron_overload",
      protocolName: "Iron Overload Management",
      goal: "Reduce ferritin to optimal range (40-150 ng/mL)",
      triggerDescription: "Ferritin above 300 ng/mL — potential iron overload",
      peptides: [],
      supplements: [
        { name: "IP6 (Inositol Hexaphosphate)", dose: "800mg", frequency: "On empty stomach, daily" },
        { name: "Curcumin (Longvida)", dose: "400mg", frequency: "Daily" },
        { name: "Green Tea Extract (EGCG)", dose: "400mg", frequency: "Daily" },
      ],
      durationWeeks: 12,
      retestWeeks: 12,
      source: "Iron metabolism research",
    },
  },
  {
    marker: "thyroid_tsh",
    condition: (v) => v > 4.0,
    recommendation: {
      id: "thyroid_support",
      protocolName: "Thyroid Support Protocol",
      goal: "Optimise TSH to 1.0-2.5 mIU/L range",
      triggerDescription: "TSH above 4.0 mIU/L — subclinical hypothyroidism",
      peptides: [
        { name: "Thymosin Alpha-1", dose_mcg: 1600, frequency: "2x/week", timing: "AM", route: "SubQ" },
      ],
      supplements: [
        { name: "Selenium (Selenomethionine)", dose: "200mcg", frequency: "Daily" },
        { name: "Zinc Picolinate", dose: "30mg", frequency: "Daily" },
        { name: "Iodine (from kelp)", dose: "150mcg", frequency: "Daily" },
      ],
      durationWeeks: 12,
      retestWeeks: 8,
      source: "Thyroid endocrinology guidelines",
    },
  },
  {
    marker: "cortisol_am",
    condition: (v) => v > 25,
    recommendation: {
      id: "cortisol_management",
      protocolName: "Stress & Cortisol Management",
      goal: "Reduce AM cortisol to optimal range (10-20 µg/dL)",
      triggerDescription: "Morning cortisol elevated (>25 µg/dL)",
      peptides: [
        { name: "Selank", dose_mcg: 300, frequency: "daily", timing: "AM", route: "Nasal" },
      ],
      supplements: [
        { name: "Ashwagandha KSM-66", dose: "600mg", frequency: "Daily" },
        { name: "Phosphatidylserine", dose: "300mg", frequency: "Before bed" },
        { name: "Magnesium Glycinate", dose: "400mg", frequency: "Before bed" },
      ],
      durationWeeks: 8,
      retestWeeks: 8,
      source: "HPA axis & stress research",
    },
  },
  {
    marker: "alt",
    condition: (v) => v > 50,
    recommendation: {
      id: "liver_support",
      protocolName: "Liver Support Protocol",
      goal: "Reduce ALT to optimal range (<30 U/L)",
      triggerDescription: "ALT elevated (>50 U/L) — liver stress indicated",
      peptides: [
        { name: "BPC-157", dose_mcg: 500, frequency: "daily", timing: "AM", route: "Oral" },
      ],
      supplements: [
        { name: "NAC", dose: "600mg", frequency: "Twice daily" },
        { name: "Milk Thistle (Silymarin)", dose: "600mg", frequency: "Daily" },
        { name: "TUDCA", dose: "500mg", frequency: "Daily" },
      ],
      durationWeeks: 8,
      retestWeeks: 6,
      source: "Hepatology research",
    },
  },
  {
    marker: "ldl_cholesterol",
    condition: (v) => v > 160,
    recommendation: {
      id: "lipid_optimisation",
      protocolName: "Lipid Optimisation Protocol",
      goal: "Reduce LDL cholesterol to <130 mg/dL",
      triggerDescription: "LDL cholesterol elevated (>160 mg/dL)",
      peptides: [],
      supplements: [
        { name: "Berberine HCl", dose: "500mg", frequency: "Twice daily with meals" },
        { name: "Omega-3 Fish Oil", dose: "3000mg EPA/DHA", frequency: "Daily" },
        { name: "Red Yeast Rice", dose: "1200mg", frequency: "Daily" },
        { name: "CoQ10", dose: "200mg", frequency: "Daily" },
      ],
      durationWeeks: 12,
      retestWeeks: 12,
      source: "Cardiovascular lipid research",
    },
  },
];

// --- POPULAR PROTOCOL STACKS ---

export interface PopularProtocol {
  id: string;
  protocolName: string;
  category: "healing" | "anti-aging" | "fat-loss" | "performance" | "cognitive" | "immune";
  goal: string;
  description: string;
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
  popularity: number; // 1-5 stars
}

export const POPULAR_PROTOCOLS: PopularProtocol[] = [
  {
    id: "glow_stack",
    protocolName: "GLOW Stack",
    category: "anti-aging",
    goal: "Skin rejuvenation, collagen synthesis & tissue repair",
    description: "The viral GLOW stack combines three synergistic peptides for skin, hair, and healing. Popular on social media for visible results.",
    peptides: [
      { name: "BPC-157", dose_mcg: 500, frequency: "daily", timing: "AM", route: "SubQ" },
      { name: "TB-500", dose_mcg: 500, frequency: "daily", timing: "AM", route: "SubQ" },
      { name: "GHK-Cu", dose_mcg: 200, frequency: "daily", timing: "AM", route: "SubQ" },
    ],
    supplements: [
      { name: "Vitamin C", dose: "1000mg", frequency: "Daily" },
      { name: "Collagen Peptides", dose: "10g", frequency: "Daily" },
    ],
    durationWeeks: 8,
    retestWeeks: 8,
    source: "Community-verified protocol",
    popularity: 5,
  },
  {
    id: "wolverine_stack",
    protocolName: "Wolverine Stack",
    category: "healing",
    goal: "Accelerated injury recovery & tissue regeneration",
    description: "The most popular healing stack. BPC-157 + TB-500 work synergistically for gut, tendon, ligament, and muscle repair.",
    peptides: [
      { name: "BPC-157", dose_mcg: 500, frequency: "daily", timing: "AM", route: "SubQ" },
      { name: "TB-500", dose_mcg: 500, frequency: "daily", timing: "AM", route: "SubQ" },
    ],
    supplements: [
      { name: "Collagen Peptides", dose: "10g", frequency: "Daily" },
      { name: "Omega-3 Fish Oil", dose: "2000mg EPA/DHA", frequency: "Daily" },
    ],
    durationWeeks: 6,
    retestWeeks: 6,
    source: "Widely documented healing protocol",
    popularity: 5,
  },
  {
    id: "gh_secretagogue",
    protocolName: "GH Secretagogue Stack",
    category: "anti-aging",
    goal: "Optimise natural growth hormone release for recovery & anti-aging",
    description: "Classic GHRH + GHRP combo for pulsatile GH release. Best taken on an empty stomach before bed.",
    peptides: [
      { name: "CJC-1295 (no DAC)", dose_mcg: 100, frequency: "5on/2off", timing: "Pre-bed", route: "SubQ" },
      { name: "Ipamorelin", dose_mcg: 200, frequency: "5on/2off", timing: "Pre-bed", route: "SubQ" },
    ],
    supplements: [
      { name: "Magnesium Glycinate", dose: "400mg", frequency: "Before bed" },
      { name: "Zinc Picolinate", dose: "50mg", frequency: "Daily" },
    ],
    durationWeeks: 12,
    retestWeeks: 8,
    source: "Clinical GH research protocols",
    popularity: 5,
  },
  {
    id: "fat_loss_stack",
    protocolName: "Fat Loss Stack",
    category: "fat-loss",
    goal: "Accelerate fat metabolism while preserving lean mass",
    description: "Combines a GH fragment for targeted fat burning with a GLP-1 receptor agonist for appetite control.",
    peptides: [
      { name: "AOD-9604", dose_mcg: 300, frequency: "daily", timing: "AM", route: "SubQ" },
      { name: "Tesamorelin", dose_mcg: 2000, frequency: "daily", timing: "Pre-bed", route: "SubQ" },
    ],
    supplements: [
      { name: "L-Carnitine", dose: "2000mg", frequency: "Before exercise" },
      { name: "Berberine HCl", dose: "500mg", frequency: "With meals" },
    ],
    durationWeeks: 12,
    retestWeeks: 8,
    source: "Metabolic & body composition research",
    popularity: 4,
  },
  {
    id: "cognitive_stack",
    protocolName: "Cognitive Enhancement Stack",
    category: "cognitive",
    goal: "Improve focus, memory, and neuroprotection",
    description: "Russian nootropic peptides combined for cognitive enhancement and anxiolytic effects. Popular in biohacking communities.",
    peptides: [
      { name: "Semax", dose_mcg: 600, frequency: "daily", timing: "AM", route: "Nasal" },
      { name: "Selank", dose_mcg: 300, frequency: "daily", timing: "AM", route: "Nasal" },
    ],
    supplements: [
      { name: "Lion's Mane", dose: "1000mg", frequency: "Daily" },
      { name: "Alpha-GPC", dose: "300mg", frequency: "Daily" },
      { name: "Omega-3 Fish Oil", dose: "2000mg EPA/DHA", frequency: "Daily" },
    ],
    durationWeeks: 8,
    retestWeeks: 8,
    source: "Nootropic research & Russian clinical data",
    popularity: 4,
  },
  {
    id: "immune_stack",
    protocolName: "Immune Fortification Stack",
    category: "immune",
    goal: "Strengthen immune function and reduce infection susceptibility",
    description: "Thymosin-based immune modulation with KPV for anti-inflammatory support. Ideal during seasonal transitions.",
    peptides: [
      { name: "Thymosin Alpha-1", dose_mcg: 1600, frequency: "2x/week", timing: "AM", route: "SubQ" },
      { name: "KPV", dose_mcg: 500, frequency: "daily", timing: "AM", route: "SubQ" },
    ],
    supplements: [
      { name: "Vitamin C", dose: "2000mg", frequency: "Daily" },
      { name: "Vitamin D3 + K2", dose: "5000 IU", frequency: "Daily" },
      { name: "Zinc Picolinate", dose: "30mg", frequency: "Daily" },
    ],
    durationWeeks: 8,
    retestWeeks: 8,
    source: "Immunology & thymic peptide research",
    popularity: 4,
  },
  {
    id: "gut_repair",
    protocolName: "Gut Repair Protocol",
    category: "healing",
    goal: "Heal gut lining, reduce inflammation & improve digestion",
    description: "Targeted gut healing combining BPC-157 (oral route for direct gut contact) with KPV's anti-inflammatory action.",
    peptides: [
      { name: "BPC-157", dose_mcg: 500, frequency: "daily", timing: "AM", route: "Oral" },
      { name: "KPV", dose_mcg: 500, frequency: "daily", timing: "AM", route: "Oral" },
    ],
    supplements: [
      { name: "L-Glutamine", dose: "5g", frequency: "Twice daily" },
      { name: "Zinc Carnosine", dose: "75mg", frequency: "Twice daily" },
      { name: "Probiotics (Multi-strain)", dose: "50B CFU", frequency: "Daily" },
    ],
    durationWeeks: 8,
    retestWeeks: 8,
    source: "GI repair & gut permeability research",
    popularity: 4,
  },
  {
    id: "longevity_stack",
    protocolName: "Longevity Stack",
    category: "anti-aging",
    goal: "Cellular repair, mitochondrial health & anti-aging",
    description: "Multi-targeted anti-aging approach combining skin repair, immune modulation, and metabolic optimisation peptides.",
    peptides: [
      { name: "GHK-Cu", dose_mcg: 200, frequency: "daily", timing: "PM", route: "SubQ" },
      { name: "Thymosin Alpha-1", dose_mcg: 1600, frequency: "2x/week", timing: "AM", route: "SubQ" },
      { name: "MOTS-c", dose_mcg: 5000, frequency: "3x/week", timing: "AM", route: "SubQ" },
    ],
    supplements: [
      { name: "NMN", dose: "500mg", frequency: "Daily" },
      { name: "Resveratrol", dose: "500mg", frequency: "Daily with fat" },
      { name: "CoQ10", dose: "200mg", frequency: "Daily" },
    ],
    durationWeeks: 12,
    retestWeeks: 12,
    source: "Longevity & senescence research",
    popularity: 3,
  },
  {
    id: "performance_stack",
    protocolName: "Performance & Recovery Stack",
    category: "performance",
    goal: "Enhanced athletic recovery, lean mass support & endurance",
    description: "Optimise training output with GH support for recovery and BPC-157 for injury prevention.",
    peptides: [
      { name: "CJC-1295 (no DAC)", dose_mcg: 100, frequency: "5on/2off", timing: "Pre-bed", route: "SubQ" },
      { name: "Ipamorelin", dose_mcg: 200, frequency: "5on/2off", timing: "Pre-bed", route: "SubQ" },
      { name: "BPC-157", dose_mcg: 250, frequency: "daily", timing: "AM", route: "SubQ" },
    ],
    supplements: [
      { name: "Creatine Monohydrate", dose: "5g", frequency: "Daily" },
      { name: "L-Carnitine", dose: "2000mg", frequency: "Before exercise" },
      { name: "Magnesium Glycinate", dose: "400mg", frequency: "Before bed" },
    ],
    durationWeeks: 12,
    retestWeeks: 8,
    source: "Sports performance & recovery research",
    popularity: 4,
  },
];

// Category display helpers
export const CATEGORY_LABELS: Record<PopularProtocol["category"], string> = {
  healing: "Healing & Recovery",
  "anti-aging": "Anti-Aging & Longevity",
  "fat-loss": "Fat Loss & Metabolic",
  performance: "Performance & Athletic",
  cognitive: "Cognitive & Nootropic",
  immune: "Immune Support",
};

export const CATEGORY_COLORS: Record<PopularProtocol["category"], string> = {
  healing: "bg-green-500/10 text-green-600",
  "anti-aging": "bg-purple-500/10 text-purple-600",
  "fat-loss": "bg-orange-500/10 text-orange-600",
  performance: "bg-blue-500/10 text-blue-600",
  cognitive: "bg-indigo-500/10 text-indigo-600",
  immune: "bg-teal-500/10 text-teal-600",
};

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
