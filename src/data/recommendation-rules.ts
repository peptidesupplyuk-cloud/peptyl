export interface Recommendation {
  id: string;
  protocolName: string;
  goal: string;
  triggerDescription?: string;
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
    driven_by?: string[];
  }[];
  durationWeeks: number;
  retestWeeks: number;
  source?: string;
  beginner_safe?: boolean;
  // Unified engine fields (optional)
  signalSources?: SignalSource[];
  signalLabels?: string[];
  confidenceLevel?: "high" | "medium" | "low";
  type?: ProtocolType;
}

// ─── Unified Recommendation Types ────────────────────────────────────────────

export type SignalSource = "bloodwork" | "dna" | "onboarding" | "combined";
export type ProtocolType = "supplements_only" | "peptides_and_supplements" | "peptides_only";

export interface UnifiedRecommendation {
  id: string;
  protocolName: string;
  goal: string;
  type: ProtocolType;
  signalSources: SignalSource[];
  signalLabels: string[];
  confidenceLevel: "high" | "medium" | "low";
  peptides: {
    name: string;
    dose_mcg: number;
    frequency: string;
    timing: string;
    route: string;
  }[];
  supplements: {
    name: string;
    dose: string;
    frequency: string;
    driven_by?: string[];
  }[];
  durationWeeks: number;
  retestWeeks: number;
  source?: string;
  beginner_safe: boolean;
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
        { name: "Omega-3 (EPA/DHA)", dose: "2000mg EPA/DHA", frequency: "Daily" },
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
        { name: "Omega-3 (EPA/DHA)", dose: "1000mg EPA/DHA", frequency: "Daily" },
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
    marker: "tsh",
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
    marker: "ldl",
    condition: (v) => v > 160,
    recommendation: {
      id: "lipid_optimisation",
      protocolName: "Lipid Optimisation Protocol",
      goal: "Reduce LDL cholesterol to <130 mg/dL",
      triggerDescription: "LDL cholesterol elevated (>160 mg/dL)",
      peptides: [],
      supplements: [
        { name: "Berberine HCl", dose: "500mg", frequency: "Twice daily with meals" },
        { name: "Omega-3 (EPA/DHA)", dose: "3000mg EPA/DHA", frequency: "Daily" },
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
  popularity: number;
  beginner_safe: boolean;
}

export const POPULAR_PROTOCOLS: PopularProtocol[] = [
  // ─── Supplement-only protocols ─────────────────────────────────────────────
  {
    id: "foundation_stack",
    protocolName: "Foundation Health Stack",
    category: "immune",
    goal: "Core micronutrient optimisation for overall health",
    description: "The fundamental supplement stack for anyone starting their health journey. No injections. Addresses the most common UK deficiencies.",
    peptides: [],
    supplements: [
      { name: "Vitamin D3 + K2", dose: "5000 IU D3 / 100mcg K2", frequency: "Daily with fat" },
      { name: "Omega-3 (EPA/DHA)", dose: "2000mg EPA/DHA", frequency: "Daily" },
      { name: "Magnesium Glycinate", dose: "400mg", frequency: "Before bed" },
      { name: "Zinc Picolinate", dose: "30mg", frequency: "Daily" },
    ],
    durationWeeks: 12,
    retestWeeks: 12,
    source: "UK dietary survey data & NHS nutrition guidelines",
    popularity: 5,
    beginner_safe: true,
  },
  {
    id: "anti_aging_sups",
    protocolName: "Longevity Supplement Stack",
    category: "anti-aging",
    goal: "Mitochondrial support, cellular repair & healthy ageing",
    description: "Evidence-backed longevity supplements with strong RCT support. No peptides required — a solid foundation for anyone interested in longevity.",
    peptides: [],
    supplements: [
      { name: "NMN", dose: "500mg", frequency: "Morning, fasted" },
      { name: "Resveratrol", dose: "500mg", frequency: "With fat-containing meal" },
      { name: "CoQ10 (Ubiquinol)", dose: "200mg", frequency: "Daily with fat" },
      { name: "Alpha Lipoic Acid", dose: "600mg", frequency: "Daily" },
      { name: "Omega-3 (EPA/DHA)", dose: "3000mg EPA/DHA", frequency: "Daily" },
    ],
    durationWeeks: 12,
    retestWeeks: 12,
    source: "Longevity & senescence research (Sinclair, Guarente)",
    popularity: 4,
    beginner_safe: true,
  },
  // ─── Peptide protocols ─────────────────────────────────────────────────────
  {
    id: "glow_stack",
    protocolName: "GLOW Stack",
    category: "anti-aging",
    goal: "Skin rejuvenation, collagen synthesis & tissue repair",
    description: "The viral GLOW stack combines three synergistic peptides for skin, hair, and healing. Popular on social media for visible results.",
    peptides: [
      { name: "BPC-157", dose_mcg: 500, frequency: "daily", timing: "AM", route: "SubQ" },
      { name: "TB-500", dose_mcg: 500, frequency: "daily", timing: "AM", route: "SubQ" },
      { name: "GHK-Cu", dose_mcg: 1000, frequency: "daily", timing: "AM", route: "SubQ" },
    ],
    supplements: [
      { name: "Vitamin C", dose: "1000mg", frequency: "Daily" },
      { name: "Collagen Peptides", dose: "10g", frequency: "Daily" },
    ],
    durationWeeks: 8,
    retestWeeks: 8,
    source: "Community-verified protocol",
    popularity: 5,
    beginner_safe: false,
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
      { name: "Omega-3 (EPA/DHA)", dose: "2000mg EPA/DHA", frequency: "Daily" },
    ],
    durationWeeks: 6,
    retestWeeks: 6,
    source: "Widely documented healing protocol",
    popularity: 5,
    beginner_safe: true,
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
    beginner_safe: true,
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
    beginner_safe: false,
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
      { name: "Omega-3 (EPA/DHA)", dose: "2000mg EPA/DHA", frequency: "Daily" },
    ],
    durationWeeks: 8,
    retestWeeks: 8,
    source: "Nootropic research & Russian clinical data",
    popularity: 4,
    beginner_safe: true,
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
    beginner_safe: true,
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
    beginner_safe: true,
  },
  {
    id: "longevity_stack",
    protocolName: "Longevity Stack",
    category: "anti-aging",
    goal: "Cellular repair, mitochondrial health & anti-aging",
    description: "Multi-targeted anti-aging approach combining skin repair, immune modulation, and metabolic optimisation peptides.",
    peptides: [
      { name: "GHK-Cu", dose_mcg: 1000, frequency: "daily", timing: "PM", route: "SubQ" },
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
    beginner_safe: false,
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
    beginner_safe: false,
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

// ─── DNA Supplement Signals ──────────────────────────────────────────────────

export const DNA_SUPPLEMENT_SIGNALS: {
  gene: string;
  variantPattern: string;
  supplements: UnifiedRecommendation["supplements"];
  standalone: boolean;
  standaloneRec?: Omit<UnifiedRecommendation, "id" | "signalSources" | "signalLabels" | "confidenceLevel">;
}[] = [
  {
    gene: "MTHFR",
    variantPattern: "C677T",
    supplements: [
      { name: "Methylfolate (5-MTHF)", dose: "400–800mcg", frequency: "Morning with food", driven_by: ["MTHFR C677T"] },
      { name: "Methylcobalamin (B12)", dose: "1000mcg", frequency: "Daily", driven_by: ["MTHFR C677T"] },
    ],
    standalone: true,
    standaloneRec: {
      protocolName: "Methylation Support",
      goal: "Support methylation cycle impaired by MTHFR C677T variant",
      type: "supplements_only",
      peptides: [],
      supplements: [
        { name: "Methylfolate (5-MTHF)", dose: "400–800mcg", frequency: "Morning with food", driven_by: ["MTHFR C677T"] },
        { name: "Methylcobalamin (B12)", dose: "1000mcg", frequency: "Daily", driven_by: ["MTHFR C677T"] },
        { name: "Magnesium Glycinate", dose: "400mg", frequency: "Before bed", driven_by: ["MTHFR C677T"] },
      ],
      durationWeeks: 12,
      retestWeeks: 12,
      beginner_safe: true,
      source: "MTHFR methylation research (PMID references)",
    },
  },
  {
    gene: "VDR",
    variantPattern: "Taq1",
    supplements: [
      { name: "Vitamin D3 + K2", dose: "5000 IU D3 / 100mcg K2", frequency: "Daily with fat", driven_by: ["VDR Taq1 variant"] },
      { name: "Magnesium Glycinate", dose: "400mg", frequency: "Daily", driven_by: ["VDR Taq1 — magnesium required for D3 activation"] },
    ],
    standalone: true,
    standaloneRec: {
      protocolName: "Vitamin D Receptor Support",
      goal: "Overcome reduced Vitamin D receptor efficiency from VDR Taq1 variant",
      type: "supplements_only",
      peptides: [],
      supplements: [
        { name: "Vitamin D3 + K2", dose: "5000 IU D3 / 100mcg K2", frequency: "Daily with fat", driven_by: ["VDR Taq1 variant"] },
        { name: "Magnesium Glycinate", dose: "400mg", frequency: "Daily", driven_by: ["VDR Taq1 — magnesium required for D3 activation"] },
      ],
      durationWeeks: 12,
      retestWeeks: 12,
      beginner_safe: true,
      source: "Vitamin D receptor genetics research",
    },
  },
  {
    gene: "APOE",
    variantPattern: "e3/e4",
    supplements: [
      { name: "Omega-3 (EPA/DHA)", dose: "3000mg EPA/DHA", frequency: "Daily", driven_by: ["APOE e3/e4 — cardiovascular risk"] },
      { name: "CoQ10", dose: "200mg", frequency: "Daily with fat", driven_by: ["APOE e4 — mitochondrial support"] },
    ],
    standalone: true,
    standaloneRec: {
      protocolName: "APOE e4 Cardiovascular Support",
      goal: "Reduce cardiovascular risk associated with APOE e3/e4 variant",
      type: "supplements_only",
      peptides: [],
      supplements: [
        { name: "Omega-3 (EPA/DHA)", dose: "3000mg EPA/DHA", frequency: "Daily", driven_by: ["APOE e3/e4"] },
        { name: "CoQ10", dose: "200mg", frequency: "Daily with fat", driven_by: ["APOE e4"] },
        { name: "Berberine HCl", dose: "500mg", frequency: "With meals, twice daily", driven_by: ["APOE e4 — lipid metabolism"] },
      ],
      durationWeeks: 12,
      retestWeeks: 12,
      beginner_safe: true,
      source: "APOE cardiovascular & lipid research",
    },
  },
  {
    gene: "COMT",
    variantPattern: "Val158Met",
    supplements: [
      { name: "Magnesium Glycinate", dose: "400mg", frequency: "Before bed", driven_by: ["COMT Val158Met — dopamine clearance"] },
      { name: "SAMe", dose: "400mg", frequency: "Morning, fasted", driven_by: ["COMT Val158Met — methylation"] },
    ],
    standalone: false,
  },
  {
    gene: "FTO",
    variantPattern: "AA",
    supplements: [
      { name: "Berberine HCl", dose: "500mg", frequency: "With meals", driven_by: ["FTO AA — elevated obesity/appetite risk"] },
    ],
    standalone: false,
  },
  {
    gene: "SOD2",
    variantPattern: "TT",
    supplements: [
      { name: "CoQ10", dose: "200mg", frequency: "Daily", driven_by: ["SOD2 TT — reduced mitochondrial antioxidant defence"] },
      { name: "Alpha Lipoic Acid", dose: "600mg", frequency: "Daily", driven_by: ["SOD2 TT"] },
    ],
    standalone: false,
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

// --- ONBOARDING-BASED RECOMMENDATIONS ---

const GOAL_TO_CATEGORIES: Record<string, PopularProtocol["category"][]> = {
  fat_loss: ["fat-loss", "performance"],
  weight_loss: ["fat-loss", "performance"],
  healing: ["healing", "immune"],
  longevity: ["anti-aging", "immune"],
  cognitive: ["cognitive", "anti-aging"],
  muscle: ["performance", "healing"],
  hormone: ["anti-aging", "performance"],
  performance: ["performance", "healing"],
  general: ["healing", "anti-aging", "cognitive"],
};

const RISK_PEPTIDE_LIMIT: Record<string, number> = {
  conservative: 2,
  moderate: 3,
  aggressive: 5,
};

export interface OnboardingProfile {
  research_goal?: string | null;
  experience_level?: string | null;
  current_compounds?: string | null;
  biomarker_availability?: string | null;
  risk_tolerance?: string | null;
}

export function getOnboardingRecommendations(profile: OnboardingProfile): PopularProtocol[] {
  const goal = profile.research_goal || "general";
  const risk = profile.risk_tolerance || "moderate";
  const experience = profile.experience_level || "beginner";
  const currentCompounds = (profile.current_compounds || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);

  const categories = GOAL_TO_CATEGORIES[goal] || GOAL_TO_CATEGORIES["general"];
  const maxPeptides = RISK_PEPTIDE_LIMIT[risk] || 3;

  let matched = POPULAR_PROTOCOLS.filter(p => categories.includes(p.category));

  if (experience === "none" || experience === "beginner") {
    matched = matched.filter(p => p.beginner_safe === true);
  }

  matched = matched.filter(p => p.peptides.length <= maxPeptides);

  if (currentCompounds.length > 0) {
    matched = matched.filter(p =>
      !p.peptides.every(pep =>
        currentCompounds.some(c => pep.name.toLowerCase().includes(c))
      )
    );
  }

  return matched.sort((a, b) => b.popularity - a.popularity).slice(0, 3);
}

// ─── Unified Recommendation Engine ───────────────────────────────────────────

export interface UnifiedRecommendationInput {
  markers?: Record<string, number>;
  dnaReport?: {
    gene_results?: Array<{ gene: string; variant: string; risk_level?: string }>;
    supplement_protocol?: Array<{
      supplement: string;
      dose: string;
      timing: string;
      driven_by?: string[];
    }>;
  } | null;
  onboarding?: OnboardingProfile | null;
}

export function getUnifiedRecommendations(input: UnifiedRecommendationInput): UnifiedRecommendation[] {
  const results: UnifiedRecommendation[] = [];
  const seen = new Set<string>();

  // ─── STEP 1: Bloodwork-triggered recommendations ───────────────────────────
  const bloodRecs = input.markers ? getRecommendations(input.markers) : [];

  for (const rec of bloodRecs) {
    if (seen.has(rec.id)) continue;
    seen.add(rec.id);

    let supplements = [...(rec.supplements || [])];
    const signalLabels = [rec.triggerDescription];
    let signalSources: SignalSource[] = ["bloodwork"];

    // ─── STEP 2: DNA enhancement of bloodwork recs ─────────────────────────
    if (input.dnaReport?.gene_results) {
      for (const geneResult of input.dnaReport.gene_results) {
        for (const signal of DNA_SUPPLEMENT_SIGNALS) {
          if (
            geneResult.gene.toLowerCase().includes(signal.gene.toLowerCase()) &&
            geneResult.variant.toLowerCase().includes(signal.variantPattern.toLowerCase())
          ) {
            for (const dnaSup of signal.supplements) {
              if (!supplements.find(s => s.name === dnaSup.name)) {
                supplements.push(dnaSup);
              }
            }
            if (!signalLabels.includes(`${geneResult.gene} ${geneResult.variant}`)) {
              signalLabels.push(`${geneResult.gene} ${geneResult.variant}`);
            }
            if (!signalSources.includes("dna")) signalSources.push("dna");
          }
        }
      }
    }

    const type: ProtocolType = rec.peptides.length === 0
      ? "supplements_only"
      : supplements.length > 0
        ? "peptides_and_supplements"
        : "peptides_only";

    results.push({
      id: rec.id,
      protocolName: rec.protocolName,
      goal: rec.goal,
      type,
      signalSources,
      signalLabels,
      confidenceLevel: signalSources.includes("dna") ? "high" : "medium",
      peptides: rec.peptides,
      supplements,
      durationWeeks: rec.durationWeeks,
      retestWeeks: rec.retestWeeks,
      source: rec.source,
      beginner_safe: rec.peptides.length === 0 || rec.peptides.length <= 1,
    });
  }

  // ─── STEP 3: DNA-only standalone supplement recommendations ────────────────
  if (input.dnaReport?.gene_results) {
    for (const geneResult of input.dnaReport.gene_results) {
      for (const signal of DNA_SUPPLEMENT_SIGNALS) {
        if (!signal.standalone || !signal.standaloneRec) continue;

        if (
          geneResult.gene.toLowerCase().includes(signal.gene.toLowerCase()) &&
          geneResult.variant.toLowerCase().includes(signal.variantPattern.toLowerCase())
        ) {
          const id = `dna_${signal.gene.toLowerCase()}_${signal.variantPattern.toLowerCase().replace(/\//g, "_")}`;
          if (seen.has(id)) continue;
          seen.add(id);

          results.push({
            id,
            ...signal.standaloneRec,
            signalSources: ["dna"],
            signalLabels: [`${geneResult.gene} ${geneResult.variant}`],
            confidenceLevel: "high",
          });
        }
      }
    }
  }

  // ─── STEP 4: Parse supplement_protocol from DNA report directly ────────────
  if (input.dnaReport?.supplement_protocol) {
    const dnaSupGroups: Record<string, typeof input.dnaReport.supplement_protocol> = {};

    for (const sup of input.dnaReport.supplement_protocol) {
      const groupKey = (sup.driven_by || []).join("|") || "general";
      if (!dnaSupGroups[groupKey]) dnaSupGroups[groupKey] = [];
      dnaSupGroups[groupKey].push(sup);
    }

    for (const [groupKey, sups] of Object.entries(dnaSupGroups)) {
      const id = `dna_protocol_${groupKey.replace(/\s+/g, "_").toLowerCase().slice(0, 40)}`;
      if (seen.has(id)) continue;

      const alreadyCovered = sups.every(sup =>
        results.some(r => r.supplements.some(s => s.name === sup.supplement))
      );
      if (alreadyCovered) continue;
      seen.add(id);

      results.push({
        id,
        protocolName: sups[0].driven_by?.[0]
          ? `${sups[0].driven_by[0].split(" ")[0]} Support Protocol`
          : "DNA-Informed Supplement Protocol",
        goal: `Support based on DNA analysis: ${(sups[0].driven_by || []).join(", ")}`,
        type: "supplements_only",
        signalSources: ["dna"],
        signalLabels: sups.flatMap(s => s.driven_by || []).filter((v, i, a) => a.indexOf(v) === i),
        confidenceLevel: "high",
        peptides: [],
        supplements: sups.map(s => ({
          name: s.supplement,
          dose: s.dose,
          frequency: s.timing,
          driven_by: s.driven_by,
        })),
        durationWeeks: 12,
        retestWeeks: 12,
        beginner_safe: true,
      });
    }
  }

  // ─── STEP 5: Onboarding-based popular protocol recommendations ─────────────
  if (input.onboarding && results.length < 3) {
    const onboardingRecs = getOnboardingRecommendations(input.onboarding);
    for (const rec of onboardingRecs) {
      if (seen.has(rec.id)) continue;
      seen.add(rec.id);

      const supplements = (rec.supplements || []).map(s => ({ ...s }));

      if (input.dnaReport?.gene_results) {
        for (const geneResult of input.dnaReport.gene_results) {
          for (const signal of DNA_SUPPLEMENT_SIGNALS) {
            if (
              geneResult.gene.toLowerCase().includes(signal.gene.toLowerCase()) &&
              geneResult.variant.toLowerCase().includes(signal.variantPattern.toLowerCase())
            ) {
              for (const dnaSup of signal.supplements) {
                if (!supplements.find(s => s.name === dnaSup.name)) {
                  supplements.push(dnaSup);
                }
              }
            }
          }
        }
      }

      const type: ProtocolType = rec.peptides.length === 0
        ? "supplements_only"
        : supplements.length > 0
          ? "peptides_and_supplements"
          : "peptides_only";

      const signalSources: SignalSource[] = input.dnaReport ? ["onboarding", "dna"] : ["onboarding"];

      results.push({
        id: rec.id,
        protocolName: rec.protocolName,
        goal: rec.goal,
        type,
        signalSources,
        signalLabels: [
          `Goal: ${input.onboarding?.research_goal?.replace(/_/g, " ") || "general"}`,
          ...(input.dnaReport ? ["DNA enhanced"] : []),
        ],
        confidenceLevel: input.dnaReport ? "medium" : "low",
        peptides: rec.peptides,
        supplements,
        durationWeeks: rec.durationWeeks,
        retestWeeks: rec.retestWeeks,
        source: rec.source,
        beginner_safe: rec.beginner_safe,
      });
    }
  }

  // ─── STEP 6: Sort ─────────────────────────────────────────────────────────
  const sourcePriority = (r: UnifiedRecommendation) => {
    if (r.signalSources.length >= 2) return 0;
    if (r.signalSources.includes("bloodwork")) return 1;
    if (r.signalSources.includes("dna")) return 2;
    return 3;
  };

  return results.sort((a, b) => sourcePriority(a) - sourcePriority(b));
}
