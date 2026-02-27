export type MarkerStatus = "optimal" | "suboptimal" | "out_of_range";

export interface BiomarkerDef {
  name: string;
  key: string;
  unit: string;
  optimalMin: number;
  optimalMax: number;
  refMin: number;
  refMax: number;
  panel: "basic" | "advanced";
  category: string;
}

export const BIOMARKERS: BiomarkerDef[] = [
  // Basic Panel
  { name: "Fasting Glucose", key: "fasting_glucose", unit: "mg/dL", optimalMin: 70, optimalMax: 90, refMin: 65, refMax: 100, panel: "basic", category: "Metabolic" },
  { name: "HbA1c", key: "hba1c", unit: "%", optimalMin: 4.5, optimalMax: 5.3, refMin: 4.0, refMax: 5.6, panel: "basic", category: "Metabolic" },
  { name: "Total Cholesterol", key: "total_cholesterol", unit: "mg/dL", optimalMin: 150, optimalMax: 200, refMin: 100, refMax: 240, panel: "basic", category: "Lipids" },
  { name: "LDL Cholesterol", key: "ldl", unit: "mg/dL", optimalMin: 50, optimalMax: 100, refMin: 0, refMax: 130, panel: "basic", category: "Lipids" },
  { name: "HDL Cholesterol", key: "hdl", unit: "mg/dL", optimalMin: 50, optimalMax: 100, refMin: 40, refMax: 120, panel: "basic", category: "Lipids" },
  { name: "Triglycerides", key: "triglycerides", unit: "mg/dL", optimalMin: 40, optimalMax: 100, refMin: 30, refMax: 150, panel: "basic", category: "Lipids" },
  { name: "ALT", key: "alt", unit: "U/L", optimalMin: 7, optimalMax: 30, refMin: 0, refMax: 56, panel: "basic", category: "Liver" },
  { name: "AST", key: "ast", unit: "U/L", optimalMin: 10, optimalMax: 30, refMin: 0, refMax: 40, panel: "basic", category: "Liver" },
  { name: "Creatinine", key: "creatinine", unit: "mg/dL", optimalMin: 0.7, optimalMax: 1.1, refMin: 0.5, refMax: 1.3, panel: "basic", category: "Kidney" },
  { name: "eGFR", key: "egfr", unit: "mL/min", optimalMin: 90, optimalMax: 150, refMin: 60, refMax: 200, panel: "basic", category: "Kidney" },
  { name: "hsCRP", key: "hscrp", unit: "mg/L", optimalMin: 0, optimalMax: 1.0, refMin: 0, refMax: 3.0, panel: "basic", category: "Inflammation" },
  { name: "Vitamin D", key: "vitamin_d", unit: "ng/mL", optimalMin: 50, optimalMax: 80, refMin: 30, refMax: 100, panel: "basic", category: "Vitamins" },

  // Advanced Panel
  { name: "IGF-1", key: "igf1", unit: "ng/mL", optimalMin: 200, optimalMax: 350, refMin: 100, refMax: 400, panel: "advanced", category: "Hormones" },
  { name: "Total Testosterone", key: "total_testosterone", unit: "ng/dL", optimalMin: 500, optimalMax: 900, refMin: 250, refMax: 1100, panel: "advanced", category: "Hormones" },
  { name: "Free Testosterone", key: "free_testosterone", unit: "pg/mL", optimalMin: 15, optimalMax: 30, refMin: 5, refMax: 45, panel: "advanced", category: "Hormones" },
  { name: "SHBG", key: "shbg", unit: "nmol/L", optimalMin: 20, optimalMax: 50, refMin: 10, refMax: 80, panel: "advanced", category: "Hormones" },
  { name: "Estradiol", key: "estradiol", unit: "pg/mL", optimalMin: 20, optimalMax: 40, refMin: 10, refMax: 60, panel: "advanced", category: "Hormones" },
  { name: "TSH", key: "tsh", unit: "mIU/L", optimalMin: 1.0, optimalMax: 2.5, refMin: 0.4, refMax: 4.5, panel: "advanced", category: "Thyroid" },
  { name: "Free T3", key: "free_t3", unit: "pg/mL", optimalMin: 3.0, optimalMax: 4.0, refMin: 2.3, refMax: 4.2, panel: "advanced", category: "Thyroid" },
  { name: "Free T4", key: "free_t4", unit: "ng/dL", optimalMin: 1.0, optimalMax: 1.5, refMin: 0.8, refMax: 1.8, panel: "advanced", category: "Thyroid" },
  { name: "Fasting Insulin", key: "fasting_insulin", unit: "µIU/mL", optimalMin: 3, optimalMax: 8, refMin: 2, refMax: 20, panel: "advanced", category: "Metabolic" },
  { name: "Homocysteine", key: "homocysteine", unit: "µmol/L", optimalMin: 5, optimalMax: 9, refMin: 4, refMax: 15, panel: "advanced", category: "Inflammation" },
  { name: "Ferritin", key: "ferritin", unit: "µg/L", optimalMin: 30, optimalMax: 150, refMin: 15, refMax: 300, panel: "advanced", category: "Iron" },
  { name: "Cortisol (AM)", key: "cortisol_am", unit: "nmol/L", optimalMin: 350, optimalMax: 700, refMin: 200, refMax: 900, panel: "advanced", category: "Hormones" },
  { name: "DHEA-S", key: "dhea_s", unit: "µmol/L", optimalMin: 5, optimalMax: 12, refMin: 2, refMax: 15, panel: "advanced", category: "Hormones" },

  // Body Metrics
  { name: "Age", key: "age", unit: "yrs", optimalMin: 18, optimalMax: 100, refMin: 0, refMax: 120, panel: "basic", category: "Body Composition" },
  { name: "Height", key: "height_cm", unit: "cm", optimalMin: 150, optimalMax: 200, refMin: 100, refMax: 250, panel: "basic", category: "Body Composition" },
  { name: "Weight", key: "weight_kg", unit: "kg", optimalMin: 55, optimalMax: 90, refMin: 40, refMax: 150, panel: "basic", category: "Body Composition" },
  { name: "Waist Circumference", key: "waist_cm", unit: "cm", optimalMin: 60, optimalMax: 89, refMin: 50, refMax: 120, panel: "basic", category: "Body Composition" },
  { name: "Body Fat", key: "body_fat_pct", unit: "%", optimalMin: 10, optimalMax: 22, refMin: 5, refMax: 40, panel: "basic", category: "Body Composition" },

  // Cardiovascular
  { name: "BP Systolic", key: "bp_systolic", unit: "mmHg", optimalMin: 100, optimalMax: 120, refMin: 80, refMax: 140, panel: "basic", category: "Cardiovascular" },
  { name: "BP Diastolic", key: "bp_diastolic", unit: "mmHg", optimalMin: 60, optimalMax: 80, refMin: 50, refMax: 90, panel: "basic", category: "Cardiovascular" },
  { name: "Resting Heart Rate", key: "resting_hr", unit: "bpm", optimalMin: 50, optimalMax: 70, refMin: 40, refMax: 100, panel: "basic", category: "Cardiovascular" },
];

export function getMarkerStatus(marker: BiomarkerDef, value: number): MarkerStatus {
  if (value >= marker.optimalMin && value <= marker.optimalMax) return "optimal";
  if (value >= marker.refMin && value <= marker.refMax) return "suboptimal";
  return "out_of_range";
}

export function getStatusColor(status: MarkerStatus): string {
  switch (status) {
    case "optimal": return "text-green-500";
    case "suboptimal": return "text-yellow-500";
    case "out_of_range": return "text-red-500";
  }
}

export function getStatusBg(status: MarkerStatus): string {
  switch (status) {
    case "optimal": return "bg-green-500/10 border-green-500/20";
    case "suboptimal": return "bg-yellow-500/10 border-yellow-500/20";
    case "out_of_range": return "bg-red-500/10 border-red-500/20";
  }
}
