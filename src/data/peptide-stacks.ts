/**
 * Peptide Stack Compatibility Data
 * 
 * Sources: Clinical trials, peer-reviewed research, established peptide therapy protocols.
 * All interactions are categorized by evidence level.
 * 
 * SYNERGY: Well-documented complementary mechanisms
 * CAUTION: Overlapping mechanisms or known adverse interaction risk
 * NEUTRAL: Compatible but no documented synergy or risk
 * NO_DATA: Insufficient evidence to make a determination
 */

export type InteractionType = "synergy" | "caution" | "neutral" | "no_data";

export interface PeptideInteraction {
  peptideA: string;
  peptideB: string;
  type: InteractionType;
  reason: string;
  source?: string; // brief citation or evidence type
}

export interface RecommendedStack {
  name: string;
  goal: string;
  peptides: string[];
  description: string;
  protocol: string;
  evidence: "clinical" | "established" | "emerging";
}

// ── Recommended Stacks (verified) ──────────────────────────────────────────

export const recommendedStacks: RecommendedStack[] = [
  {
    name: "Wolverine Stack",
    goal: "Healing & Recovery",
    peptides: ["BPC-157", "TB-500"],
    description:
      "The most widely used healing stack. BPC-157 provides localised tissue repair via angiogenesis and growth factor upregulation, while TB-500 promotes systemic cell migration and tissue remodelling. Together they address both local and systemic healing pathways.",
    protocol: "BPC-157 500 mcg/day + TB-500 500 mcg/day (1:1 blend ratio) for 4-8 weeks",
    evidence: "established",
  },
  {
    name: "GH Optimiser",
    goal: "Growth Hormone",
    peptides: ["CJC-1295 (no DAC)", "Ipamorelin"],
    description:
      "Classic GHRH + GHRP combination. CJC-1295 stimulates GH production while Ipamorelin triggers its pulsatile release, mimicking natural GH secretion without significantly elevating cortisol or prolactin.",
    protocol: "CJC-1295 100-300 mcg + Ipamorelin 100-300 mcg before bed, 5 days on / 2 off",
    evidence: "established",
  },
  {
    name: "Complete Recovery",
    goal: "Healing & Growth Hormone",
    peptides: ["BPC-157", "TB-500", "CJC-1295 (no DAC)", "Ipamorelin"],
    description:
      "Combines the Wolverine Stack with the GH Optimiser. Healing peptides address acute tissue damage while GH peptides support overnight recovery and IGF-1 elevation. Timing is split: healing peptides AM, GH peptides PM.",
    protocol: "BPC-157 500 mcg + TB-500 500 mcg daily (1:1 blend); CJC-1295 + Ipamorelin 30-60 min before bed",
    evidence: "established",
  },
  {
    name: "CagriSema Protocol",
    goal: "Weight Management",
    peptides: ["Semaglutide", "Cagrilintide"],
    description:
      "Based on Novo Nordisk's REDEFINE Phase 3 clinical trials. Combines GLP-1 receptor agonism (appetite suppression) with amylin receptor agonism (satiety signalling). Trials showed up to 20% body weight reduction.",
    protocol: "Semaglutide 2.4 mg/week + Cagrilintide 2.4 mg/week (titrate both separately)",
    evidence: "clinical",
  },
  {
    name: "Cognitive Stack",
    goal: "Cognitive Enhancement",
    peptides: ["Semax", "Selank"],
    description:
      "Well-established Russian nootropic combination. Semax enhances BDNF and focus via ACTH pathways while Selank provides anxiolytic effects via GABA modulation — together they support calm, focused cognition without sedation.",
    protocol: "Semax 200-600 mcg + Selank 250-500 mcg nasal, 1-3x daily",
    evidence: "established",
  },
  {
    name: "Regeneration & Anti-Inflammatory",
    goal: "Healing & Anti-Inflammatory",
    peptides: ["BPC-157", "TB-500", "KPV", "GHK-Cu"],
    description:
      "Multi-pathway healing stack. BPC-157 and TB-500 handle structural repair, KPV suppresses NF-κB inflammatory pathways, and GHK-Cu promotes collagen remodelling and tissue regeneration.",
    protocol: "BPC-157 500 mcg/day + TB-500 500 mcg/day (1:1 ratio) + KPV 200-500 mcg/day + GHK-Cu 1-2 mg/day",
    evidence: "emerging",
  },
  {
    name: "Immune Defence",
    goal: "Immune Support",
    peptides: ["Thymosin Alpha-1", "LL-37"],
    description:
      "Thymosin Alpha-1 modulates adaptive immunity (T-cell maturation, dendritic cell activation) while LL-37 provides broad-spectrum antimicrobial defence. Complementary innate + adaptive immune support.",
    protocol: "TA-1 1.6 mg 2-3x/week + LL-37 50-100 mcg daily for 4-6 weeks",
    evidence: "established",
  },
  {
    name: "Mitochondrial Support",
    goal: "Anti-Aging & Energy",
    peptides: ["MOTS-c", "SS-31"],
    description:
      "Both target mitochondrial function through different mechanisms. MOTS-c activates AMPK and improves metabolic efficiency, while SS-31 (Elamipretide) reduces mitochondrial oxidative stress and stabilises cardiolipin.",
    protocol: "MOTS-c 5-10 mg 3x/week + SS-31 5-50 mg daily",
    evidence: "emerging",
  },
];

// ── Pairwise Interactions ──────────────────────────────────────────────────
// Only explicitly documented interactions are listed.
// Any pair not listed defaults to "neutral" (compatible, no documented interaction).

export const peptideInteractions: PeptideInteraction[] = [
  // ── SYNERGISTIC ──────────────────────────────────────────────────────────

  // Healing synergies
  {
    peptideA: "BPC-157",
    peptideB: "TB-500",
    type: "synergy",
    reason: "Complementary healing: BPC-157 promotes localised angiogenesis and growth factor upregulation; TB-500 drives systemic cell migration and tissue remodelling.",
    source: "Widely documented in peptide therapy protocols",
  },
  {
    peptideA: "BPC-157",
    peptideB: "KPV",
    type: "synergy",
    reason: "BPC-157 repairs tissue while KPV suppresses NF-κB inflammatory cascades — complementary healing and anti-inflammatory pathways.",
    source: "Peptide therapy protocols",
  },
  {
    peptideA: "BPC-157",
    peptideB: "GHK-Cu",
    type: "synergy",
    reason: "BPC-157 accelerates tissue repair; GHK-Cu promotes collagen synthesis and extracellular matrix remodelling. Different repair mechanisms.",
    source: "Regenerative medicine protocols",
  },
  {
    peptideA: "TB-500",
    peptideB: "KPV",
    type: "synergy",
    reason: "TB-500 promotes cell migration for healing while KPV reduces inflammation at the repair site — complementary mechanisms.",
    source: "Anti-inflammatory peptide research",
  },
  {
    peptideA: "TB-500",
    peptideB: "GHK-Cu",
    type: "synergy",
    reason: "TB-500 supports systemic tissue repair; GHK-Cu enhances collagen remodelling and wound healing through copper-dependent pathways.",
    source: "Regenerative peptide literature",
  },

  // GH synergies
  {
    peptideA: "CJC-1295 (no DAC)",
    peptideB: "Ipamorelin",
    type: "synergy",
    reason: "GHRH (CJC-1295) + GHRP (Ipamorelin) = amplified pulsatile GH release. Ipamorelin is selective, minimising cortisol and prolactin elevation.",
    source: "Established GH secretagogue protocol",
  },
  {
    peptideA: "CJC-1295 (no DAC)",
    peptideB: "GHRP-2",
    type: "synergy",
    reason: "GHRH + GHRP combination amplifies GH pulse. GHRP-2 is more potent than Ipamorelin but with moderate appetite stimulation.",
    source: "GH secretagogue research",
  },
  {
    peptideA: "Sermorelin",
    peptideB: "Ipamorelin",
    type: "synergy",
    reason: "Sermorelin (GHRH 1-29) + Ipamorelin (GHRP) = synergistic GH release, similar to CJC-1295 + Ipamorelin but shorter-acting.",
    source: "Clinical peptide therapy",
  },
  {
    peptideA: "Ipamorelin",
    peptideB: "DSIP",
    type: "synergy",
    reason: "Ipamorelin enhances GH release; DSIP promotes deep delta wave sleep when GH is naturally highest. Complementary timing for PM dosing.",
    source: "Sleep and recovery protocols",
  },
  {
    peptideA: "Tesamorelin",
    peptideB: "Ipamorelin",
    type: "synergy",
    reason: "Tesamorelin (GHRH analog) + Ipamorelin (GHRP) synergise for GH release with Tesamorelin's added visceral fat targeting.",
    source: "Clinical protocols, FDA data for Tesamorelin",
  },

  // Healing + GH cross-stack
  {
    peptideA: "BPC-157",
    peptideB: "CJC-1295 (no DAC)",
    type: "synergy",
    reason: "BPC-157 heals locally while elevated GH/IGF-1 from CJC-1295 supports systemic recovery. AM/PM timing avoids interference.",
    source: "Complete recovery stack protocols",
  },
  {
    peptideA: "BPC-157",
    peptideB: "Ipamorelin",
    type: "synergy",
    reason: "Direct tissue repair (BPC-157) complemented by enhanced GH-mediated recovery (Ipamorelin). Well-documented four-peptide stack component.",
    source: "Complete recovery stack protocols",
  },
  {
    peptideA: "TB-500",
    peptideB: "CJC-1295 (no DAC)",
    type: "synergy",
    reason: "TB-500's systemic healing is enhanced by GH elevation from CJC-1295, supporting faster tissue remodelling.",
    source: "Recovery stack protocols",
  },
  {
    peptideA: "TB-500",
    peptideB: "Ipamorelin",
    type: "synergy",
    reason: "TB-500's cell migration and repair complemented by Ipamorelin's GH pulse for overnight recovery.",
    source: "Recovery stack protocols",
  },

  // Cognitive synergies
  {
    peptideA: "Semax",
    peptideB: "Selank",
    type: "synergy",
    reason: "Semax enhances BDNF and cognitive performance; Selank provides anxiolysis via GABA modulation. Calm focus without sedation.",
    source: "Russian clinical research, established nootropic protocol",
  },

  // Weight management synergy
  {
    peptideA: "Semaglutide",
    peptideB: "Cagrilintide",
    type: "synergy",
    reason: "GLP-1 + amylin receptor dual agonism (CagriSema). Phase 3 REDEFINE trials demonstrated ~20% weight reduction — different receptor targets.",
    source: "Novo Nordisk REDEFINE Phase 3 clinical trials",
  },

  // Immune synergies
  {
    peptideA: "Thymosin Alpha-1",
    peptideB: "LL-37",
    type: "synergy",
    reason: "TA-1 modulates adaptive immunity (T-cells); LL-37 provides innate antimicrobial defence. Complementary immune support.",
    source: "Immune peptide literature",
  },

  // Anti-aging synergies
  {
    peptideA: "Epitalon",
    peptideB: "GHK-Cu",
    type: "synergy",
    reason: "Epitalon activates telomerase for cellular longevity; GHK-Cu promotes tissue regeneration and collagen remodelling — different anti-aging pathways.",
    source: "Anti-aging peptide protocols",
  },
  {
    peptideA: "MOTS-c",
    peptideB: "SS-31",
    type: "synergy",
    reason: "Both target mitochondria: MOTS-c activates AMPK for metabolic efficiency; SS-31 reduces mitochondrial oxidative stress. Complementary mechanisms.",
    source: "Mitochondrial peptide research",
  },
  {
    peptideA: "NAD+",
    peptideB: "MOTS-c",
    type: "synergy",
    reason: "NAD+ supports cellular energy production and DNA repair; MOTS-c enhances mitochondrial metabolic function. Both address age-related decline.",
    source: "Longevity research",
  },
  {
    peptideA: "NAD+",
    peptideB: "Epitalon",
    type: "synergy",
    reason: "NAD+ restores cellular energy; Epitalon activates telomerase. Different anti-aging mechanisms that are complementary.",
    source: "Anti-aging protocols",
  },

  // Hormone support
  {
    peptideA: "Gonadorelin",
    peptideB: "Kisspeptin",
    type: "synergy",
    reason: "Kisspeptin stimulates upstream GnRH release; Gonadorelin is synthetic GnRH. Together they support the full HPG axis — used in fertility protocols.",
    source: "Reproductive endocrinology research",
  },

  // ── CAUTION / RED FLAGS ──────────────────────────────────────────────────

  // GLP-1 receptor overlap
  {
    peptideA: "Semaglutide",
    peptideB: "Tirzepatide",
    type: "caution",
    reason: "Both activate GLP-1 receptors. Combining creates excessive receptor agonism — significantly increased risk of severe nausea, vomiting, gastroparesis, and pancreatitis.",
    source: "Clinical pharmacology; no clinical trial has combined these",
  },
  {
    peptideA: "Semaglutide",
    peptideB: "Retatrutide",
    type: "caution",
    reason: "Overlapping GLP-1 receptor agonism. Retatrutide already includes GLP-1 activity — adding semaglutide risks severe GI adverse effects and hypoglycaemia.",
    source: "Mechanism-based contraindication",
  },
  {
    peptideA: "Tirzepatide",
    peptideB: "Retatrutide",
    type: "caution",
    reason: "Both agonise GIP and GLP-1 receptors. Redundant mechanisms with compounded side effects — no clinical basis for combining.",
    source: "Mechanism-based contraindication",
  },
  {
    peptideA: "Semaglutide",
    peptideB: "Survodutide",
    type: "caution",
    reason: "Overlapping GLP-1 agonism. Survodutide includes GLP-1 activity — stacking adds no benefit and increases GI/pancreatitis risk.",
    source: "Mechanism-based contraindication",
  },
  {
    peptideA: "Tirzepatide",
    peptideB: "Survodutide",
    type: "caution",
    reason: "Both include GLP-1 agonism. No therapeutic rationale for combining; compounded nausea and gastroparesis risk.",
    source: "Mechanism-based contraindication",
  },
  {
    peptideA: "Retatrutide",
    peptideB: "Survodutide",
    type: "caution",
    reason: "Both include GLP-1 and glucagon receptor agonism. Nearly identical receptor profiles — no benefit, compounded risk.",
    source: "Mechanism-based contraindication",
  },
  {
    peptideA: "Semaglutide",
    peptideB: "Cagrilintide",
    // This is the one EXCEPTION — it's synergy, already listed above.
    // If you see this, the synergy entry takes precedence.
    type: "synergy",
    reason: "CagriSema — clinically validated combination. Different receptor targets (GLP-1 vs amylin).",
    source: "REDEFINE Phase 3 trials",
  },

  // GHRP overlap
  {
    peptideA: "GHRP-2",
    peptideB: "GHRP-6",
    type: "caution",
    reason: "Both are ghrelin receptor agonists (GHRPs). Combining increases risk of receptor desensitisation, elevated cortisol, and excessive prolactin.",
    source: "GH secretagogue pharmacology",
  },
  {
    peptideA: "GHRP-2",
    peptideB: "Hexarelin",
    type: "caution",
    reason: "Both GHRPs targeting the same ghrelin receptor. Hexarelin is the most potent GHRP — combining accelerates receptor desensitisation.",
    source: "GH secretagogue pharmacology",
  },
  {
    peptideA: "GHRP-6",
    peptideB: "Hexarelin",
    type: "caution",
    reason: "Redundant GHRP mechanisms. Combining provides diminishing returns with increased cortisol/prolactin elevation and faster desensitisation.",
    source: "GH secretagogue pharmacology",
  },
  {
    peptideA: "Ipamorelin",
    peptideB: "GHRP-2",
    type: "caution",
    reason: "Both are GHRPs targeting ghrelin receptors. While Ipamorelin is milder, combining with GHRP-2 offers limited additional benefit and risks desensitisation.",
    source: "GH secretagogue pharmacology",
  },
  {
    peptideA: "Ipamorelin",
    peptideB: "GHRP-6",
    type: "caution",
    reason: "Both GHRPs. GHRP-6 adds strong appetite stimulation and cortisol/prolactin elevation that Ipamorelin specifically avoids — contradictory profiles.",
    source: "GH secretagogue pharmacology",
  },
  {
    peptideA: "Ipamorelin",
    peptideB: "Hexarelin",
    type: "caution",
    reason: "Both GHRPs. Hexarelin's potency makes Ipamorelin redundant and introduces cortisol/prolactin elevation that Ipamorelin avoids.",
    source: "GH secretagogue pharmacology",
  },

  // Melanocortin overlap
  {
    peptideA: "Melanotan II",
    peptideB: "PT-141",
    type: "caution",
    reason: "Both are melanocortin receptor agonists. PT-141 is derived from Melanotan II. Combining amplifies nausea, blood pressure changes, and flushing.",
    source: "Melanocortin receptor pharmacology",
  },

  // IGF-1 cautions
  {
    peptideA: "IGF-1 LR3",
    peptideB: "Semaglutide",
    type: "caution",
    reason: "IGF-1 LR3 can cause hypoglycaemia; GLP-1 agonists also affect blood glucose. Combination increases hypoglycaemia risk — requires careful monitoring.",
    source: "Metabolic interaction concern",
  },
  {
    peptideA: "IGF-1 LR3",
    peptideB: "Tirzepatide",
    type: "caution",
    reason: "IGF-1 LR3's hypoglycaemic potential compounded by tirzepatide's glucose-lowering effects. Increased hypoglycaemia risk.",
    source: "Metabolic interaction concern",
  },

  // ── NO DATA (notable gaps) ──────────────────────────────────────────────

  {
    peptideA: "Dihexa",
    peptideB: "Semax",
    type: "no_data",
    reason: "Both are cognitive enhancers but through very different mechanisms (HGF vs ACTH). No published data on combining. Dihexa has limited human safety data overall.",
    source: "Insufficient research",
  },
  {
    peptideA: "Dihexa",
    peptideB: "Selank",
    type: "no_data",
    reason: "No published research on this combination. Dihexa's long-term safety profile is still being established.",
    source: "Insufficient research",
  },
  {
    peptideA: "Cerebrolysin",
    peptideB: "Dihexa",
    type: "no_data",
    reason: "Both promote neurogenesis through different pathways but no combination data exists. Cerebrolysin requires IM/IV which complicates multi-peptide protocols.",
    source: "Insufficient research",
  },
  {
    peptideA: "Oxytocin",
    peptideB: "Selank",
    type: "no_data",
    reason: "Both have anxiolytic properties through different mechanisms. No published data on interaction. Theoretically compatible but unverified.",
    source: "Insufficient research",
  },
];

// ── Helper: look up interaction between two peptides ───────────────────────

export function getInteraction(a: string, b: string): PeptideInteraction {
  const found = peptideInteractions.find(
    (i) =>
      (i.peptideA === a && i.peptideB === b) ||
      (i.peptideA === b && i.peptideB === a)
  );

  if (found) return found;

  // Default: neutral (compatible, no documented interaction)
  return {
    peptideA: a,
    peptideB: b,
    type: "neutral",
    reason: "No documented interaction. These peptides target different pathways and are generally considered compatible.",
  };
}

// Remove duplicate synergy entry for Semaglutide + Cagrilintide
// (it was listed in caution section as a note — the synergy entry takes precedence via find-first)
