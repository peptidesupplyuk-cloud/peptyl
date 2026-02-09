export type WeightDosing = "independent" | "weight-based";

export interface PeptideConfig {
  name: string;
  min: number;
  max: number;
  unit: string;
  note: string;
  weightDosing: WeightDosing;
  weightDoseMin?: number; // mcg/kg
  weightDoseMax?: number; // mcg/kg
  typicalCycleWeeks: [number, number]; // [min, max]
  commonVialSizes: number[]; // mg
  typicalFrequency: string;
}

export const peptideConfigs: Record<string, PeptideConfig> = {
  bpc157: {
    name: "BPC-157",
    min: 200,
    max: 500,
    unit: "mcg/day",
    note: "Typically split into 2 doses, morning and evening. Healing peptide with excellent safety profile.",
    weightDosing: "independent",
    typicalCycleWeeks: [4, 12],
    commonVialSizes: [5, 10],
    typicalFrequency: "Once daily",
  },
  ghkcu: {
    name: "GHK-Cu",
    min: 100,
    max: 600,
    unit: "mcg/day",
    note: "Start low and increase gradually over 2 weeks. Wound healing and anti-aging peptide.",
    weightDosing: "independent",
    typicalCycleWeeks: [4, 8],
    commonVialSizes: [5, 10],
    typicalFrequency: "Once daily",
  },
  tb500: {
    name: "TB-500",
    min: 2000,
    max: 5000,
    unit: "mcg/2x week",
    note: "Loading phase: higher dose for 4-6 weeks, then maintenance at lower dose.",
    weightDosing: "independent",
    typicalCycleWeeks: [4, 12],
    commonVialSizes: [5, 10],
    typicalFrequency: "Twice weekly",
  },
  ipamorelin: {
    name: "Ipamorelin",
    min: 200,
    max: 300,
    unit: "mcg/dose",
    note: "Best taken before bed on an empty stomach. Selective GH secretagogue.",
    weightDosing: "independent",
    typicalCycleWeeks: [8, 16],
    commonVialSizes: [5, 10],
    typicalFrequency: "Once daily",
  },
  cjc1295: {
    name: "CJC-1295 (no DAC)",
    min: 100,
    max: 200,
    unit: "mcg/dose",
    note: "Often paired with Ipamorelin for synergistic GH release.",
    weightDosing: "independent",
    typicalCycleWeeks: [8, 16],
    commonVialSizes: [5, 10],
    typicalFrequency: "Once daily",
  },
  semaglutide: {
    name: "Semaglutide",
    min: 250,
    max: 2500,
    unit: "mcg/week",
    note: "Start at lowest dose. Increase every 4 weeks as tolerated. GLP-1 agonist.",
    weightDosing: "independent",
    typicalCycleWeeks: [12, 52],
    commonVialSizes: [3, 5, 10],
    typicalFrequency: "Once weekly",
  },
  tirzepatide: {
    name: "Tirzepatide",
    min: 2500,
    max: 15000,
    unit: "mcg/week",
    note: "Start at 2.5mg weekly. Increase every 4 weeks. Dual GIP/GLP-1 agonist.",
    weightDosing: "independent",
    typicalCycleWeeks: [12, 52],
    commonVialSizes: [5, 10, 15, 30],
    typicalFrequency: "Once weekly",
  },
  retatrutide: {
    name: "Retatrutide",
    min: 4000,
    max: 12000,
    unit: "mcg/week",
    note: "Newest triple agonist. Start at 4mg weekly. GIP/GLP-1/Glucagon.",
    weightDosing: "independent",
    typicalCycleWeeks: [12, 48],
    commonVialSizes: [5, 10],
    typicalFrequency: "Once weekly",
  },
  sermorelin: {
    name: "Sermorelin",
    min: 200,
    max: 500,
    unit: "mcg/day",
    note: "Best taken before bed. Can be used long-term. GHRH analogue.",
    weightDosing: "independent",
    typicalCycleWeeks: [12, 26],
    commonVialSizes: [5, 10],
    typicalFrequency: "Once daily",
  },
  hexarelin: {
    name: "Hexarelin",
    min: 100,
    max: 200,
    unit: "mcg/dose",
    note: "Most potent GHRP. Cycle 4 weeks on, 4 off to avoid desensitisation.",
    weightDosing: "independent",
    typicalCycleWeeks: [4, 8],
    commonVialSizes: [5, 10],
    typicalFrequency: "Once daily",
  },
  ghrp2: {
    name: "GHRP-2",
    min: 100,
    max: 300,
    unit: "mcg/dose",
    note: "Take on empty stomach. Moderate appetite increase expected.",
    weightDosing: "independent",
    typicalCycleWeeks: [8, 16],
    commonVialSizes: [5, 10],
    typicalFrequency: "Once daily",
  },
  ghrp6: {
    name: "GHRP-6",
    min: 100,
    max: 300,
    unit: "mcg/dose",
    note: "Strongest appetite stimulation of all GHRPs. Good for mass gaining.",
    weightDosing: "independent",
    typicalCycleWeeks: [8, 16],
    commonVialSizes: [5, 10],
    typicalFrequency: "Once daily",
  },
  tesamorelin: {
    name: "Tesamorelin",
    min: 1000,
    max: 2000,
    unit: "mcg/day",
    note: "FDA-approved for visceral fat reduction. Well-studied safety profile.",
    weightDosing: "independent",
    typicalCycleWeeks: [12, 26],
    commonVialSizes: [5, 10],
    typicalFrequency: "Once daily",
  },
  aod9604: {
    name: "AOD-9604",
    min: 300,
    max: 600,
    unit: "mcg/day",
    note: "Fat loss fragment of HGH. Dose based on body weight for optimal results.",
    weightDosing: "weight-based",
    weightDoseMin: 2,
    weightDoseMax: 5,
    typicalCycleWeeks: [8, 12],
    commonVialSizes: [5, 10],
    typicalFrequency: "Once daily",
  },
  mots_c: {
    name: "MOTS-c",
    min: 5000,
    max: 10000,
    unit: "mcg/week",
    note: "Mitochondrial peptide. Dose may be adjusted based on body weight.",
    weightDosing: "weight-based",
    weightDoseMin: 50,
    weightDoseMax: 100,
    typicalCycleWeeks: [4, 12],
    commonVialSizes: [5, 10],
    typicalFrequency: "Once weekly",
  },
};

export interface SyringeType {
  label: string;
  shortLabel: string;
  multiplier: number; // units per mL
  capacityMl: number;
  type: "insulin" | "tuberculin";
}

export const syringeTypes: SyringeType[] = [
  { label: "U-100 · 1mL (100 unit) insulin syringe", shortLabel: "U-100 1mL", multiplier: 100, capacityMl: 1, type: "insulin" },
  { label: "U-100 · 0.5mL (50 unit) insulin syringe", shortLabel: "U-100 0.5mL", multiplier: 100, capacityMl: 0.5, type: "insulin" },
  { label: "U-100 · 0.3mL (30 unit) insulin syringe", shortLabel: "U-100 0.3mL", multiplier: 100, capacityMl: 0.3, type: "insulin" },
  { label: "U-40 · 1mL (40 unit) insulin syringe", shortLabel: "U-40 1mL", multiplier: 40, capacityMl: 1, type: "insulin" },
  { label: "Tuberculin · 1mL syringe", shortLabel: "Tuberculin 1mL", multiplier: 1, capacityMl: 1, type: "tuberculin" },
];

export const dosingFrequencies = [
  { label: "Once daily", perDay: 1, perWeek: 7 },
  { label: "Twice daily (12h apart)", perDay: 2, perWeek: 14 },
  { label: "Three times daily (8h apart)", perDay: 3, perWeek: 21 },
  { label: "Once weekly", perDay: 1 / 7, perWeek: 1 },
  { label: "Twice weekly", perDay: 2 / 7, perWeek: 2 },
  { label: "Three times weekly", perDay: 3 / 7, perWeek: 3 },
  { label: "Custom", perDay: 0, perWeek: 0 },
] as const;
