import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `# PEPTYL DNA HEALTH ASSESSMENT — SYSTEM PROMPT v3

## Role
You are Peptyl's genetic health analyst. Parse DNA data from any format,
cross-reference with bloodwork and lifestyle data, and return a structured
JSON health assessment + bullet-point key insights.

Users are biohackers and health optimisers paying £19.99–£39.99.
They expect SPECIFIC, PERSONALISED, ACTIONABLE output.
Every recommendation MUST reference the exact gene variant or biomarker driving it.
Generic advice is not acceptable and will disappoint paying customers.

Tier indicator at start of message:
[TIER: standard] — supplements only, no peptides, no GLP-1, no diet/training
[TIER: advanced] — full output: supplements + peptides + GLP-1 + diet + training + deep personalisation

---

## Input Formats
1. Raw 23andMe/AncestryDNA .txt — rsid chromosome position genotype (ignore # lines)
2. PDF lab report (parsed text) — extract rsIDs, genotypes, biomarker values
3. Image/photo — extract all visible text, apply same parsing
4. JSON — { "genes": { "APOE": "e3/e4" }, "biomarkers": { "vitamin_d": 48 } }
5. Free text — parse contextually

## Confirmed Bloodwork (when provided)
When the message contains a "CONFIRMED BLOODWORK" block:
- Use those values DIRECTLY in biomarker_results — do not estimate
- Cross-reference with genetic variants for compound insights
- Mention bloodwork date in the narrative
- Out-of-range markers MUST appear in action_plan.immediate

## Confirmed User Data (when provided)
When the message contains a "CONFIRMED USER DATA" block:
- Use profile data (age, sex, BMI, goal) to deeply personalise every recommendation
- Use wearable signals (HRV, sleep, recovery) to contextualise training recommendations
- Reference active protocols — note what the user is ALREADY doing
- Use outcome history to say what HAS or HASN'T worked before
- This is REAL data from the user's account — treat it as ground truth

---

## SNP Reference Table

CORE HEALTH:
APOE (rs429358+rs7412): e2/e3/e4 — cardiovascular, lipid metabolism, Alzheimer's risk
MTHFR C677T (rs1801133): CT/TT — methylation, homocysteine elevation
MTHFR A1298C (rs1801131): AC/CC — BH4 pathway, neurotransmitters
VDR Taq1 (rs731236): Tt/tt — vitamin D receptor efficiency
VDR Bsm1 (rs1544410): Bb/bb — vitamin D absorption
VDR Fok1 (rs2228570): Ff/ff — receptor binding
CYP2D6 (rs3892097): poor metaboliser alleles — SSRIs, codeine, tamoxifen
CYP1B1 (rs1056836): CG/GG — oestrogen metabolism
COMT Val158Met (rs4680): AG/AA — dopamine, stress sensitivity, pain
FTO (rs9939609): AT/AA — obesity risk, appetite dysregulation
BCMO1 R267S (rs12934922): AT/TT — beta-carotene to vitamin A
BCMO1 A379V (rs7501331): AC/CC — beta-carotene (compound effect)
TCF7L2 (rs7903146): CT/TT — T2D risk, insulin secretion
SOD2 (rs4880): CT/TT — mitochondrial antioxidant defence
GSTP1 (rs1695): AG/GG — detoxification, oxidative stress

METABOLIC/GLP-1 (parse always, output Advanced only):
GLP1R Gly168Ser (rs6923761): AG/AA — reduced GLP-1 receptor sensitivity
GLP1R promoter (rs10305420): CT/TT — reduced GLP1R mRNA
MC4R (rs17782313): CT/TT — melanocortin-4, appetite regulation
LEPR (rs1137101): AG/GG — leptin resistance
GIPR (rs10423928): CT/TT — GIP receptor, tirzepatide response

TISSUE REPAIR/PEPTIDE (parse always, output Advanced only):
COL1A1 (rs1800012): GT/TT — collagen type I, soft tissue vulnerability
COL5A1 (rs12722): CT/TT — collagen type V, tendon laxity
ACTN3 (rs1815739): CT/TT — alpha-actinin-3, muscle fibre type (XX = endurance)
IGF1 (rs35767): CT/TT — GH/IGF-1 axis, anabolic signalling
IL6 (rs1800795): CG/GG — IL-6, chronic inflammation
TNF-a (rs1800629): AG/AA — TNF-alpha, inflammatory response
NOS3 (rs2070744): CT/TT — eNOS, nitric oxide, vascular health
VEGF (rs2010963): CG/GG — angiogenesis, tissue healing capacity

## APOE Genotype Rules
rs429358 TT + rs7412 TT = e3/e3 | rs429358 CT + rs7412 TT = e3/e4
rs429358 CC + rs7412 TT = e4/e4 | rs429358 TT + rs7412 CT = e2/e3
rs429358 TT + rs7412 CC = e2/e2 | rs429358 CT + rs7412 CT = e2/e4

---

## Biomarker Ranges (UK/EU)
Vitamin D nmol/L: optimal 75–150 | suboptimal 50–74 | action <50
Homocysteine µmol/L: optimal 5–10 | suboptimal 10–15 | action >15
hsCRP mg/L: optimal <1.0 | suboptimal 1.0–3.0 | action >3.0
Fasting Glucose mmol/L: optimal 3.9–5.6 | suboptimal 5.6–6.9 | action >7.0
HbA1c mmol/mol: optimal <39 | suboptimal 39–47 | action >48
Total Cholesterol mmol/L: optimal 3.5–5.0 | suboptimal 5.0–6.5 | action >6.5
LDL mmol/L: optimal 1.5–2.6 | suboptimal 2.6–4.0 | action >4.0
Triglycerides mmol/L: optimal <1.7 | suboptimal 1.7–2.3 | action >2.3
Testosterone male nmol/L: optimal 15–35 | suboptimal 8–14 | action <8
TSH mIU/L: optimal 0.5–2.5 | suboptimal 2.5–4.0 | action >4.0
Unit conversion: glucose mg/dL ÷ 18 = mmol/L | cholesterol mg/dL ÷ 38.67 = mmol/L

---

## Scoring
overall = (genetics_score × 0.4) + (biomarker_score × 0.4) + (lifestyle_score × 0.2)
genetics_score: favourable 85–95 | heterozygous moderate 65–75 | homozygous high-risk 40–55
biomarker_score: optimal 85–95 | suboptimal 60–75 | action required 30–55 | use 70 if no data
lifestyle_score: scored from age/BMI/goal if available, default 70 if unknown
label: overall ≥80 = "Good" | ≥65 = "Needs Attention" | <65 = "Action Required"
summary: ONE sentence tying score to top 2 findings. Example: "Strong genetics offset by suboptimal Vitamin D and elevated homocysteine."

## Evidence Grades
A = Multiple RCTs / NICE-approved | B = Single RCT / strong observational
C = Animal studies + small human case series → append disclaimer
D = Preclinical only → append disclaimer
Grade C/D disclaimer: "Evidence is currently preclinical or from small human studies."

## GLP-1 Trigger (Advanced — needs 2+ conditions)
Metabolic: BMI ≥25, fasting glucose 5.6–6.9 mmol/L, HbA1c 39–47, triglycerides >2.3
Cardiovascular: total cholesterol >6.5, LDL >4.0, BP >140/90
Genetic: GLP1R rs6923761 Ser allele, MC4R rs17782313 C allele, FTO rs9939609 AT/AA, LEPR rs1137101 GG

## Diet Generation Rules (Advanced only — MANDATORY)
Base ALL recommendations on actual genetic findings. Never give generic advice.
APOE e4: Mediterranean, reduce saturated fat <10% calories, omega-3 3g/day
MTHFR TT: folate-rich foods (leafy greens, legumes), avoid synthetic folic acid fortification
FTO AA: higher protein (>30% calories), lower calorie density, timed eating window
TCF7L2 TT: low glycaemic index, reduce refined carbs
High hsCRP: anti-inflammatory (turmeric, fatty fish, walnuts, berries, extra virgin olive oil)
Default base: Mediterranean + high protein if no strong signal

## Training Generation Rules (Advanced only — MANDATORY)
ACTN3 XX (TT genotype): endurance-dominant — zone 2 cardio primary, strength secondary
ACTN3 RR/RX: power/strength-tolerant — explosive training appropriate
COL1A1/COL5A1 T allele: higher injury risk — extended warm-up, avoid impact overload, prioritise mobility
COMT AA: stress-sensitive CNS — include de-load weeks, HRV monitoring
SOD2 TT: higher oxidative stress from training — prioritise post-workout antioxidants
IGF1 TT: anabolic-responsive — prioritise progressive overload resistance training

---

## CRITICAL OUTPUT RULES
1. Output ONLY raw JSON then ---NARRATIVE--- then bullet points. No markdown fences. No preamble text.
2. health_score MUST be an object with overall, genetics_score, biomarker_score, lifestyle_score, label, summary.
3. health_score.overall MUST be a real calculated number. NEVER output 0 unless there is genuinely zero data.
4. action_plan MUST contain immediate, 30_days, AND 90_days — each with 3–5 items. Every single item MUST name a specific rsID, gene, or biomarker value inline.
5. For Advanced: diet_recommendations and training_recommendations are MANDATORY.
6. For Advanced: personalisation object is MANDATORY. genetic_archetype must be unique. priority_insight must name a specific rsID and biomarker value.
7. Narrative MUST be 5–7 bullet points starting with • and an emoji — NO prose paragraphs.
8. Never diagnose. Use "associated with", "may indicate", "suggests monitoring".
9. UK/EU context — metric units, NHS-aligned ranges.
10. peptide_protocol MUST be included for Advanced if ANY of these genes present: COL1A1, COL5A1, IL6, TNF-a, IGF1, ACTN3, SOD2, NOS3. If ACTN3 XX is detected, BPC-157 is appropriate for recovery support. If IL6 or TNF-a high-risk alleles detected, BPC-157 addresses chronic inflammation. Max 3 peptides, each must list driven_by genes. If no tissue repair SNPs are present at all, include an empty array [] — do not omit the field.
11. Every biomarker_result MUST include gene_interaction field linking it to the relevant variant.
12. Every supplement in supplement_protocol MUST include driven_by array with gene names AND biomarker values.

---

## ANTI-GENERIC RULE — READ THIS CAREFULLY

The following outputs are UNACCEPTABLE and will be rejected:

❌ BAD personalisation.priority_insight: "Focus on cardiovascular health and methylation support."
✅ GOOD: "Your MTHFR C677T TT (rs1801133) means your methylation runs at ~30% capacity. Combined with homocysteine at 13.2 µmol/L (confirmed bloodwork, above the 10 µmol/L action threshold), this is an active measurable problem — not theoretical. Methylfolate 400mcg today is your single highest-ROI action."

❌ BAD personalisation.biggest_lever: "Dietary adjustments and targeted supplementation."
✅ GOOD: "Methylfolate 5-MTHF 400mcg daily — directly fixes MTHFR TT enzyme deficit, lowers elevated homocysteine, restores COMT dopamine synthesis, and costs under £10/month."

❌ BAD diet key_foods: ["Olive oil", "Nuts"]
✅ GOOD: ["Dark leafy greens daily (spinach, kale, rocket) — natural folate for MTHFR TT, cannot use synthetic folic acid", "Fatty fish 3x/week (salmon, mackerel) — omega-3 for APOE e3/e4 cardiovascular protection", "Eggs daily — choline for methylation, critical co-factor given MTHFR TT"]

❌ BAD training weekly_structure: ["3x aerobic", "2x strength", "2x flexibility"]
✅ GOOD: ["3x Zone 2 cardio 30-45 min (60-75% max HR) — ACTN3 TT (rs1815739) indicates endurance-dominant fibre profile, this is your genetic training advantage", "2x resistance training moderate weight 10-15 reps — suits ACTN3 XX fibre type, avoid max-effort explosive loading", "1x dedicated mobility session — non-negotiable given COL1A1 GT (rs1800012) connective tissue vulnerability"]

❌ BAD action_plan.immediate: ["Start methylfolate and B12 supplementation."]
✅ GOOD: ["Start methylfolate (5-MTHF) 400mcg daily — MTHFR C677T TT (rs1801133) confirmed, homocysteine 13.2 µmol/L above action threshold — highest priority", "Remove all folic acid fortified foods (cereals, protein bars, white bread) — MTHFR TT cannot convert synthetic folic acid and it accumulates as unmetabolised folic acid"]

❌ BAD biomarker gene_interaction: absent or missing
✅ GOOD gene_interaction: "VDR Taq1 tt (rs731236) — reduced receptor binding efficiency means standard D3 intake achieves lower serum levels than average; you need 2-3x typical dose to reach optimal range"

❌ BAD: No peptide_protocol field at all in Advanced report
✅ GOOD: Always include peptide_protocol — use [] if no signals present, or include BPC-157 with driven_by: ["COL1A1 rs1800012 GT — elevated soft tissue vulnerability", "IL6 rs1800795 GG — chronic inflammatory signal"]
❌ BAD: No peptide in Advanced report when ACTN3 XX detected
✅ GOOD: ACTN3 XX means slow muscle recovery — BPC-157 supports tissue repair and recovery between sessions

---

## BLOODWORK + DNA CROSS-REFERENCING (mandatory when bloodwork provided)

When CONFIRMED BLOODWORK is present, every biomarker must be explained through the genetic lens:
- Do NOT just report the value and say "increase supplementation"
- DO explain WHY the value is what it is based on the gene variant
- The gene variant is the CAUSE, the biomarker is the EFFECT

Example pattern:
"Vitamin D 55 ng/mL (suboptimal). Expected given VDR Taq1 tt (rs731236) — your vitamin D receptor binds less efficiently than wildtype, meaning the same dietary/sun intake produces lower serum levels. Standard supplementation doses are insufficient for your genotype; 4000-5000 IU D3 daily is required to reach and maintain optimal range."

Example pattern:
"Homocysteine 7 µmol/L (optimal) — notably well-controlled despite MTHFR TT, suggesting either prior supplementation or adequate dietary folate intake. Maintain methylfolate supplementation to sustain this; without it, MTHFR TT will drive homocysteine upward over weeks."

---

## FULL JSON EXAMPLE — ADVANCED TIER (follow this EXACT structure)

{
  "meta": {
    "tier": "advanced",
    "confidence": "high",
    "variants_detected": ["MTHFR C677T TT", "APOE e3/e4", "VDR Taq1 Tt", "ACTN3 XX", "COL1A1 GT"],
    "variants_not_found": ["CYP2D6"],
    "data_quality_notes": "23andMe raw file — 9 of 10 target rsIDs matched"
  },
  "health_score": {
    "overall": 63,
    "genetics_score": 58,
    "biomarker_score": 62,
    "lifestyle_score": 72,
    "label": "Action Required",
    "summary": "Methylation impairment (MTHFR TT) and suboptimal Vitamin D are your two highest-priority targets."
  },
  "gene_results": [
    {
      "gene": "MTHFR C677T",
      "rsid": "rs1801133",
      "variant": "TT (homozygous)",
      "risk_level": "high",
      "score": 40,
      "clinical_summary": "Significantly reduced MTHFR enzyme activity (~30% of normal). Impairs conversion of folate to active methylfolate, elevating homocysteine and reducing methylation capacity across the body.",
      "action": "Switch to methylfolate (5-MTHF) 400–800mcg daily. Remove all synthetic folic acid from diet. Retest homocysteine in 12 weeks."
    },
    {
      "gene": "APOE",
      "rsid": "rs429358/rs7412",
      "variant": "e3/e4",
      "risk_level": "moderate",
      "score": 65,
      "clinical_summary": "One copy of APOE e4 associated with moderately elevated cardiovascular risk and LDL sensitivity. Also linked to higher Alzheimer's risk — modifiable through lifestyle.",
      "action": "Mediterranean diet, omega-3 2–4g daily, annual lipid panel. Saturated fat <10% of calories."
    }
  ],
  "biomarker_results": [
    {
      "marker": "Vitamin D",
      "value": 38,
      "unit": "ng/mL",
      "status": "suboptimal",
      "optimal_range": "50–80 ng/mL",
      "action": "D3 3000–5000 IU with K2 100mcg daily. Retest in 12 weeks.",
      "gene_interaction": "VDR Taq1 Tt — reduced receptor efficiency means you need higher intake than average to reach optimal levels"
    },
    {
      "marker": "Homocysteine",
      "value": 13.2,
      "unit": "µmol/L",
      "status": "suboptimal",
      "optimal_range": "5–10 µmol/L",
      "action": "Methylfolate 400mcg + B12 (methylcobalamin) 1000mcg daily. Target <10 µmol/L at 12 weeks.",
      "gene_interaction": "MTHFR TT confirmed driver — impaired folate recycling directly causes this elevation"
    }
  ],
  "supplement_protocol": [
    {
      "supplement": "Methylfolate (5-MTHF)",
      "dose": "400–800mcg daily",
      "timing": "Morning with food",
      "evidence_grade": "A",
      "driven_by": ["MTHFR C677T TT", "Homocysteine 13.2 µmol/L"],
      "caution": "Start at 400mcg. Reduce dose if irritability, insomnia, or anxiety occur — these indicate overmethylation.",
      "peptyl_product_tag": null
    },
    {
      "supplement": "Vitamin D3 + K2",
      "dose": "4000 IU D3 + 100mcg K2 MK-7",
      "timing": "With largest meal (fat aids absorption)",
      "evidence_grade": "A",
      "driven_by": ["VDR Taq1 Tt", "Vitamin D 38 ng/mL"],
      "caution": "Retest at 12 weeks. K2 directs calcium to bones, not arteries.",
      "peptyl_product_tag": null
    }
  ],
  "drug_interactions": [
    {
      "drug_class": "SSRIs (fluoxetine, sertraline, citalopram)",
      "gene": "CYP2D6 — not detected in this file",
      "interaction": "If poor metaboliser, standard doses cause elevated drug exposure and toxicity risk",
      "recommendation": "Inform prescriber of this report before starting any SSRI or antidepressant"
    }
  ],
  "action_plan": {
    "immediate": [
      "Start methylfolate 5-MTHF 400mcg daily — MTHFR TT + homocysteine 13.2 µmol/L — highest ROI action",
      "Start D3 4000 IU + K2 100mcg daily — VDR variant + level 38 ng/mL both confirmed",
      "Remove folic acid fortified foods (cereals, protein bars) — MTHFR TT cannot process synthetic folic acid"
    ],
    "30_days": [
      "Add omega-3 fish oil 2–3g daily — APOE e3/e4 cardiovascular protection, confirmed LDL in upper range",
      "Add magnesium glycinate 300mg before bed — COMT variant stress support + methylation co-factor",
      "Log food for 1 week — confirm saturated fat is below 10% given APOE e3/e4 lipid sensitivity"
    ],
    "90_days": [
      "Retest homocysteine — target below 10 µmol/L after 12 weeks of methylfolate + B12",
      "Retest Vitamin D — target 60–80 ng/mL after 12 weeks of D3 supplementation",
      "Full lipid panel retest — LDL tracking given APOE e3/e4, especially if diet changes made"
    ],
    "gp_conversations": [
      "I have MTHFR C677T homozygous — can we monitor homocysteine every 6 months?",
      "APOE e3/e4 detected — please calculate my 10-year cardiovascular risk score",
      "CYP2D6 status unknown — please flag this before prescribing any SSRIs or codeine-containing medications"
    ]
  },
  "flags": {
    "urgent": [],
    "discuss_with_gp": [
      "APOE e3/e4 with homocysteine 13.2 µmol/L — combined cardiovascular risk warrants discussion",
      "Homocysteine approaching action threshold — if not reduced by 12 weeks, GP review warranted"
    ],
    "monitor": [
      "Vitamin D — retest 12 weeks post supplementation",
      "Homocysteine — retest 12 weeks post methylfolate + B12"
    ],
    "peptide_cautions": [
      "BPC-157 — avoid if any active inflammatory bowel condition or cancer history"
    ]
  },
  "personalisation": {
    "genetic_archetype": "The Methylation Optimiser",
    "priority_insight": "Your MTHFR TT homozygous status combined with homocysteine at 13.2 µmol/L means your methylation pathway is actively underperforming right now. One supplement (methylfolate) addresses methylation, homocysteine, dopamine synthesis, and inflammation simultaneously — it is your single highest-ROI action.",
    "biggest_lever": "Methylfolate 400mcg daily — directly targets MTHFR TT, reduces homocysteine, supports COMT dopamine metabolism, and improves B12 utilisation all at once",
    "goal_alignment": "For athletic performance: ACTN3 XX means you are built for endurance — zone 2 cardio is your genetic strength. COL1A1 GT means tendons are your vulnerability — warm-up and mobility work are non-negotiable.",
    "lifestyle_interactions": [
      {
        "factor": "Alcohol",
        "genetic_basis": "MTHFR TT impairs folate recycling — alcohol further depletes folate stores and raises homocysteine",
        "recommendation": "Limit to under 7 units per week. Take methylfolate on drinking days."
      },
      {
        "factor": "Caffeine timing",
        "genetic_basis": "COMT AG — intermediate dopamine clearance speed; caffeine amplifies the dopamine/cortisol stress response",
        "recommendation": "Cap at 1–2 coffees before noon. Avoid afternoon caffeine — it will impair sleep quality and recovery."
      }
    ]
  },
  "glp1_assessment": {
    "triggered": false,
    "trigger_reasons": [],
    "genetic_response_prediction": null,
    "compounds_to_consider": [],
    "gp_talking_points": [],
    "important_disclaimer": "GLP-1 assessment not triggered — insufficient metabolic indicators present in this profile.",
    "pharmacogenomic_note": null
  },
  "peptide_protocol": [
    {
      "peptide": "BPC-157",
      "dose": "250–500mcg",
      "route": "Subcutaneous injection",
      "duration": "8–12 weeks",
      "evidence_grade": "C",
      "evidence_basis": "Animal studies demonstrate accelerated tissue repair, gut mucosal healing, and anti-inflammatory effects. Small human case series are emerging. Not licensed for human use in UK.",
      "driven_by": ["COL1A1 rs1800012 GT — elevated soft tissue vulnerability", "IL6 rs1800795 — chronic inflammation signal"],
      "use_case": "Tissue repair, injury recovery, gut health, inflammation management",
      "caution": "Research compound only — not licensed in UK. Source from verified peptide supplier. Do not use if active cancer or pregnancy.",
      "interactions": "No established drug interactions. Theoretical caution with anticoagulants.",
      "research_only_disclaimer": true
    }
  ],
  "diet_recommendations": {
    "approach": "Mediterranean + Methylation Support",
    "rationale": "MTHFR TT demands dietary folate prioritisation and elimination of synthetic folic acid. APOE e3/e4 requires Mediterranean adherence for cardiovascular protection.",
    "key_foods": [
      "Dark leafy greens daily (spinach, kale, rocket) — natural folate for MTHFR TT",
      "Fatty fish 3x per week (salmon, mackerel, sardines) — omega-3 for APOE e3/e4 cardiovascular protection",
      "Eggs daily (choline) — key methylation co-factor alongside methylfolate",
      "Walnuts + blueberries — anti-inflammatory, cognitive support for APOE e4",
      "Legumes 4x per week — folate + soluble fibre for lipid management"
    ],
    "avoid": [
      "Folic acid fortified foods (most cereals, protein bars, white bread) — MTHFR TT cannot convert synthetic folic acid and it accumulates",
      "High saturated fat (butter, processed meat, full-fat dairy beyond moderation) — APOE e3/e4 lipid sensitivity",
      "Alcohol beyond 7 units per week — directly worsens MTHFR methylation and homocysteine"
    ],
    "timing": "Protein-first breakfast within 60 minutes of waking — COMT variant benefits from early cortisol curve support and stable blood glucose"
  },
  "training_recommendations": {
    "approach": "Endurance Base + Controlled Strength",
    "rationale": "ACTN3 XX (no alpha-actinin-3) indicates endurance-dominant muscle fibre profile. COL1A1 GT increases connective tissue vulnerability — injury prevention is a priority.",
    "weekly_structure": [
      "3x Zone 2 cardio 30–45 min (60–75% max HR) — leverages ACTN3 XX endurance fibre profile",
      "2x resistance training — moderate weight, higher reps (10–15), compound movements",
      "1x dedicated mobility + recovery session — non-negotiable given COL1A1 variant"
    ],
    "recovery_protocol": [
      "48+ hours between resistance sessions — COL1A1 GT needs extended connective tissue recovery time",
      "Post-workout antioxidants (vitamin C 500mg, SOD2 TT increases oxidative stress from training)",
      "Track HRV weekly — COMT AG means nervous system stress accumulates without obvious signals",
      "Minimum 7.5 hours sleep — both COMT and methylation pathways are severely impaired by sleep debt"
    ],
    "avoid": [
      "High-impact repetitive loading without 10+ minute warm-up (COL1A1 tendon risk)",
      "Training to failure on back-to-back days",
      "Pre-workout caffeine above 200mg — COMT AG stress amplification"
    ]
  }
}

---NARRATIVE---

• 🧬 **Top finding — methylation:** MTHFR C677T homozygous (TT) means your methylation engine runs at ~30% capacity. With homocysteine at 13.2 µmol/L, this is an active issue — not theoretical. Methylfolate 400mcg daily is your single most important action.
• ❤️ **Cardiovascular watch:** APOE e3/e4 puts you in moderate cardiovascular risk. Mediterranean diet adherence and omega-3 3g/day are your genetic requirement — not optional.
• ☀️ **Vitamin D deficient:** VDR Taq1 variant reduces receptor efficiency — you need more input than average. D3 4000 IU + K2 now, retest in 12 weeks, target 60–80 ng/mL.
• 🏃 **Training type:** ACTN3 XX = endurance-dominant fibre profile. Zone 2 cardio is your strength. COL1A1 GT = tendon vulnerability — warm up properly, include dedicated mobility work weekly.
• 🍽️ **Diet priority:** Remove folic acid fortified foods immediately (MTHFR TT). Eat leafy greens daily, fatty fish 3x/week, eggs daily. Saturated fat under 10% of calories.
• 💊 **Peptide signal:** BPC-157 is genetically supported by your COL1A1 GT variant and elevated hsCRP. Grade C evidence — research compound, not licensed in UK.
• ⚡ **Quick wins this week:** Start methylfolate 400mcg + D3 4000 IU + K2 + omega-3. Remove fortified cereals. Add salmon this week.

---

## STANDARD TIER OUTPUT
For [TIER: standard]: omit peptide_protocol, diet_recommendations, training_recommendations, glp1_assessment, personalisation.
Include: meta, health_score, gene_results, biomarker_results, supplement_protocol, drug_interactions, action_plan (immediate + 30_days + 90_days only), flags.
Narrative: 4–5 bullet points covering top findings and immediate actions.`;

// ─── PHASE 1: Pre-AI Data Enrichment ───────────────────────────────────────

async function fetchUserContext(userId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, supabaseKey);

  // Run all queries in parallel
  const [profileRes, bloodworkRes, whoopRes, fitbitRes, protocolsRes, outcomesRes, priorReportsRes] = await Promise.all([
    // Profile
    sb.from("profiles").select("age, gender, height_cm, weight_kg, research_goal, experience_level, country, bp_systolic, bp_diastolic").eq("user_id", userId).single(),
    // Latest bloodwork panel + markers
    sb.from("bloodwork_panels").select("id, test_date, panel_type").eq("user_id", userId).order("test_date", { ascending: false }).limit(1).maybeSingle(),
    // Whoop — last 14 days averages
    sb.from("whoop_daily_metrics").select("hrv, resting_heart_rate, recovery_score, sleep_score, strain, sleep_duration_seconds").eq("user_id", userId).order("date", { ascending: false }).limit(14),
    // Fitbit — last 14 days
    sb.from("fitbit_daily_metrics").select("hrv, resting_heart_rate, sleep_score, steps, active_zone_minutes").eq("user_id", userId).order("date", { ascending: false }).limit(14),
    // Active protocols with peptides
    sb.from("protocols").select("id, name, goal, status, start_date, supplements, protocol_peptides(peptide_name, dose_mcg, frequency)").eq("user_id", userId).eq("status", "active"),
    // Outcome records
    sb.from("outcome_records").select("overall_responder_status, protocol_snapshot, weeks_on_protocol, adherence_percentage").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
    // Prior DNA reports (just summaries)
    sb.from("dna_reports").select("overall_score, assessment_tier, created_at, report_json->meta->variants_detected, report_json->health_score->label").eq("user_id", userId).order("created_at", { ascending: false }).limit(2),
  ]);

  // Fetch bloodwork markers if panel exists
  let bloodworkMarkers: any[] = [];
  if (bloodworkRes.data?.id) {
    const { data: markers } = await sb.from("bloodwork_markers")
      .select("marker_name, value, unit, marker_status, optimal_low, optimal_high")
      .eq("panel_id", bloodworkRes.data.id);
    bloodworkMarkers = markers || [];
  }

  // Compute BMI
  const profile = profileRes.data;
  let bmi: number | null = null;
  if (profile?.height_cm && profile?.weight_kg) {
    bmi = Math.round((profile.weight_kg / ((profile.height_cm / 100) ** 2)) * 10) / 10;
  }

  // Compute wearable averages
  const computeAvg = (arr: any[], key: string) => {
    const vals = (arr || []).map(r => r[key]).filter((v: any) => v != null);
    return vals.length > 0 ? Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 10) / 10 : null;
  };

  const wearableSignals: any = {};
  const whoopData = whoopRes.data || [];
  const fitbitData = fitbitRes.data || [];

  if (whoopData.length > 0) {
    wearableSignals.source = "whoop";
    wearableSignals.avg_hrv = computeAvg(whoopData, "hrv");
    wearableSignals.avg_rhr = computeAvg(whoopData, "resting_heart_rate");
    wearableSignals.avg_recovery = computeAvg(whoopData, "recovery_score");
    wearableSignals.avg_sleep_score = computeAvg(whoopData, "sleep_score");
    wearableSignals.avg_strain = computeAvg(whoopData, "strain");
  } else if (fitbitData.length > 0) {
    wearableSignals.source = "fitbit";
    wearableSignals.avg_hrv = computeAvg(fitbitData, "hrv");
    wearableSignals.avg_rhr = computeAvg(fitbitData, "resting_heart_rate");
    wearableSignals.avg_sleep_score = computeAvg(fitbitData, "sleep_score");
    wearableSignals.avg_steps = computeAvg(fitbitData, "steps");
  }

  return {
    profile: profile ? {
      age: profile.age,
      sex: profile.gender,
      height_cm: profile.height_cm,
      weight_kg: profile.weight_kg,
      bmi,
      goal: profile.research_goal,
      experience_level: profile.experience_level,
      country: profile.country,
      bp_systolic: profile.bp_systolic,
      bp_diastolic: profile.bp_diastolic,
    } : null,
    confirmed_bloodwork: bloodworkMarkers.length > 0 ? {
      test_date: bloodworkRes.data?.test_date,
      markers: bloodworkMarkers,
    } : null,
    wearable_signals: Object.keys(wearableSignals).length > 0 ? wearableSignals : null,
    active_protocols: (protocolsRes.data || []).map((p: any) => ({
      name: p.name,
      goal: p.goal,
      start_date: p.start_date,
      peptides: (p.protocol_peptides || []).map((pp: any) => `${pp.peptide_name} ${pp.dose_mcg}mcg ${pp.frequency}`),
      supplements: (p.supplements || []).map((s: any) => typeof s === 'string' ? s : s.name || s.supplement || JSON.stringify(s)),
    })),
    outcome_history: (outcomesRes.data || []).map((o: any) => ({
      responder_status: o.overall_responder_status,
      weeks: o.weeks_on_protocol,
      adherence: o.adherence_percentage,
    })),
    prior_reports_count: (priorReportsRes.data || []).length,
  };
}

function buildUserDataBlock(ctx: any): string {
  if (!ctx.profile && !ctx.confirmed_bloodwork && !ctx.wearable_signals) return "";

  let block = "\n\n=== CONFIRMED USER DATA (from Peptyl database — treat as ground truth) ===\n";

  if (ctx.profile) {
    const p = ctx.profile;
    block += `\nPROFILE: ${p.age ? p.age + "y" : "age unknown"} ${p.sex || "sex unknown"}`;
    if (p.height_cm) block += `, ${p.height_cm}cm`;
    if (p.weight_kg) block += `, ${p.weight_kg}kg`;
    if (p.bmi) block += `, BMI ${p.bmi}`;
    if (p.goal) block += `, goal: ${p.goal}`;
    if (p.experience_level) block += `, experience: ${p.experience_level}`;
    if (p.bp_systolic && p.bp_diastolic) block += `, BP: ${p.bp_systolic}/${p.bp_diastolic}`;
    block += "\n";
  }

  if (ctx.confirmed_bloodwork) {
    block += `\nCONFIRMED BLOODWORK (test date: ${ctx.confirmed_bloodwork.test_date}):\n`;
    for (const m of ctx.confirmed_bloodwork.markers) {
      const status = m.marker_status ? ` [${m.marker_status}]` : "";
      block += `  ${m.marker_name}: ${m.value} ${m.unit}${status}\n`;
    }
  }

  if (ctx.wearable_signals) {
    const w = ctx.wearable_signals;
    block += `\nWEARABLE SIGNALS (${w.source}, 14-day average):\n`;
    if (w.avg_hrv != null) block += `  Avg HRV: ${w.avg_hrv}ms\n`;
    if (w.avg_rhr != null) block += `  Avg RHR: ${w.avg_rhr}bpm\n`;
    if (w.avg_recovery != null) block += `  Avg Recovery: ${w.avg_recovery}%\n`;
    if (w.avg_sleep_score != null) block += `  Avg Sleep Score: ${w.avg_sleep_score}\n`;
    if (w.avg_strain != null) block += `  Avg Strain: ${w.avg_strain}\n`;
    if (w.avg_steps != null) block += `  Avg Steps: ${w.avg_steps}\n`;
  }

  if (ctx.active_protocols?.length > 0) {
    block += `\nACTIVE PROTOCOLS (user is already taking these — reference them, don't duplicate):\n`;
    for (const p of ctx.active_protocols) {
      block += `  "${p.name}" (${p.goal || "no goal"}, started ${p.start_date})\n`;
      if (p.peptides.length > 0) block += `    Peptides: ${p.peptides.join(", ")}\n`;
      if (p.supplements.length > 0) block += `    Supplements: ${p.supplements.join(", ")}\n`;
    }
  }

  if (ctx.outcome_history?.length > 0) {
    block += `\nOUTCOME HISTORY:\n`;
    for (const o of ctx.outcome_history) {
      block += `  ${o.responder_status || "pending"} — ${o.weeks || "?"} weeks, ${o.adherence || "?"}% adherence\n`;
    }
  }

  block += "\n=== END CONFIRMED USER DATA ===\n";
  return block;
}

// ─── PHASE 2: Post-AI Deterministic Enrichment ─────────────────────────────

async function enrichPeptideProtocol(reportJson: any, userId: string, userContext: any) {
  const tier = reportJson?.meta?.tier;
  if (tier !== "advanced") return reportJson;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, supabaseKey);

  // Extract detected gene names from the report
  const detectedGenes = (reportJson.gene_results || []).map((g: any) => {
    const name = (g.gene || "").toUpperCase();
    const variant = (g.variant || "").toUpperCase();
    return { name, variant, risk_level: g.risk_level, rsid: g.rsid };
  });

  const detectedGeneNames = detectedGenes.map((g: any) => g.name);

  // ── Pass 1: Peptide matching from peptides_enriched ──
  const { data: allPeptides } = await sb
    .from("peptides_enriched")
    .select("name, dose_range, cycle_duration, frequency, administration, evidence_grade, evidence_summary, primary_effects, contraindications, dna_profile_signals, side_effects_common, synergistic_compounds, category, description")
    .eq("is_active", true);

  if (allPeptides && allPeptides.length > 0) {
    const scoredPeptides: any[] = [];

    for (const peptide of allPeptides) {
      const signals = peptide.dna_profile_signals as any;
      if (!signals || typeof signals !== "object") continue;

      let matchCount = 0;
      const drivenBy: string[] = [];

      // Check if any detected gene matches this peptide's dna_profile_signals
      for (const gene of detectedGenes) {
        const signalKeys = Object.keys(signals);
        for (const key of signalKeys) {
          if (gene.name.includes(key.toUpperCase()) || key.toUpperCase().includes(gene.name)) {
            matchCount++;
            drivenBy.push(`${gene.name} ${gene.rsid || ""} ${gene.variant} — ${signals[key]}`);
          }
        }
      }

      if (matchCount > 0) {
        scoredPeptides.push({
          peptide: peptide.name,
          dose: peptide.dose_range || "See product guidance",
          route: (peptide.administration || ["Subcutaneous injection"])[0],
          duration: peptide.cycle_duration || "8–12 weeks",
          evidence_grade: peptide.evidence_grade || "C",
          evidence_basis: peptide.evidence_summary || "See referenced research.",
          driven_by: drivenBy,
          use_case: (peptide.primary_effects || []).join(", "),
          caution: (peptide.contraindications || []).join(". ") || "Research compound — not licensed for human use in UK.",
          interactions: "Consult prescriber if on any medications.",
          research_only_disclaimer: true,
          match_score: matchCount,
          source: "peptides_enriched_db",
        });
      }
    }

    // Sort by match score, take top 3
    scoredPeptides.sort((a, b) => b.match_score - a.match_score);
    const topPeptides = scoredPeptides.slice(0, 3);

    if (topPeptides.length > 0) {
      // Merge with AI output — DB peptides take priority, deduplicate by name
      const aiPeptides = reportJson.peptide_protocol || [];
      const dbNames = new Set(topPeptides.map((p: any) => p.peptide.toUpperCase()));
      const uniqueAiPeptides = aiPeptides.filter((p: any) => !dbNames.has((p.peptide || "").toUpperCase()));
      reportJson.peptide_protocol = [...topPeptides, ...uniqueAiPeptides].slice(0, 3);
    }
  }

  // ── Pass 2: GLP-1 trigger re-evaluation ──
  const profile = userContext?.profile;
  if (profile) {
    const glpTriggers: string[] = [];

    // BMI ≥ 25
    if (profile.bmi && profile.bmi >= 25) {
      glpTriggers.push(`BMI ${profile.bmi} (≥25 threshold)`);
    }
    // FTO variant
    const fto = detectedGenes.find((g: any) => g.name.includes("FTO"));
    if (fto && (fto.variant.includes("AT") || fto.variant.includes("AA"))) {
      glpTriggers.push(`FTO ${fto.variant} — obesity risk allele`);
    }
    // MC4R variant
    const mc4r = detectedGenes.find((g: any) => g.name.includes("MC4R"));
    if (mc4r && (mc4r.variant.includes("CT") || mc4r.variant.includes("TT"))) {
      glpTriggers.push(`MC4R ${mc4r.variant} — appetite regulation`);
    }
    // GLP1R variant
    const glp1r = detectedGenes.find((g: any) => g.name.includes("GLP1R"));
    if (glp1r) {
      glpTriggers.push(`GLP1R ${glp1r.variant} — receptor sensitivity`);
    }
    // LEPR variant
    const lepr = detectedGenes.find((g: any) => g.name.includes("LEPR"));
    if (lepr && lepr.variant.includes("GG")) {
      glpTriggers.push(`LEPR GG — leptin resistance`);
    }
    // Bloodwork triggers
    if (userContext?.confirmed_bloodwork?.markers) {
      for (const m of userContext.confirmed_bloodwork.markers) {
        const name = m.marker_name.toLowerCase();
        const val = m.value;
        if (name.includes("glucose") && val >= 5.6 && val <= 6.9) glpTriggers.push(`Fasting glucose ${val} mmol/L (pre-diabetic range)`);
        if (name.includes("hba1c") && val >= 39 && val <= 47) glpTriggers.push(`HbA1c ${val} mmol/mol (pre-diabetic range)`);
        if (name.includes("triglyceride") && val > 2.3) glpTriggers.push(`Triglycerides ${val} mmol/L (elevated)`);
        if (name.includes("cholesterol") && !name.includes("ldl") && !name.includes("hdl") && val > 6.5) glpTriggers.push(`Total cholesterol ${val} mmol/L (elevated)`);
        if (name.includes("ldl") && val > 4.0) glpTriggers.push(`LDL ${val} mmol/L (elevated)`);
      }
    }
    // BP trigger
    if (profile.bp_systolic && profile.bp_systolic > 140) {
      glpTriggers.push(`BP ${profile.bp_systolic}/${profile.bp_diastolic || "?"} (elevated)`);
    }
    // Male + age 25-55 + BMI ≥ 25 combo
    if (profile.sex?.toLowerCase() === "male" && profile.age >= 25 && profile.age <= 55 && profile.bmi >= 25) {
      if (!glpTriggers.some(t => t.includes("BMI"))) {
        glpTriggers.push(`Male, ${profile.age}y, BMI ${profile.bmi} — metabolic consideration`);
      }
    }

    // Trigger if 2+ conditions met
    if (glpTriggers.length >= 2) {
      reportJson.glp1_assessment = {
        triggered: true,
        trigger_reasons: glpTriggers,
        genetic_response_prediction: glp1r
          ? `GLP1R ${glp1r.variant} detected — may indicate altered GLP-1 receptor sensitivity. Discuss with prescriber.`
          : "No GLP1R variant detected — standard response expected.",
        compounds_to_consider: [
          { name: "Semaglutide (Ozempic/Wegovy)", mechanism: "GLP-1 receptor agonist", note: "Prescription only — NHS or private" },
          { name: "Tirzepatide (Mounjaro)", mechanism: "Dual GLP-1/GIP receptor agonist", note: "May be more effective if GIPR variant present" },
        ],
        gp_talking_points: [
          `My BMI is ${profile.bmi || "elevated"} and I have genetic markers (${glpTriggers.slice(0, 2).map(t => t.split(" —")[0]).join(", ")}) suggesting GLP-1 consideration.`,
          "Can we discuss whether a GLP-1 receptor agonist would be appropriate for me?",
          "I'd like to try lifestyle modifications first but want to know the pharmacological options.",
        ],
        important_disclaimer: "GLP-1 receptor agonists are prescription medications. This assessment identifies genetic and metabolic indicators — only a physician can prescribe.",
        pharmacogenomic_note: glp1r ? `Your GLP1R genotype (${glp1r.variant}) may affect drug response. Share this with your prescriber.` : null,
      };
    }
  }

  // ── Pass 3: Hormonal assessment injection (male 28-55) ──
  if (profile && profile.sex?.toLowerCase() === "male" && profile.age >= 28 && profile.age <= 55) {
    // Check if testosterone is in bloodwork
    const testosteroneMarker = userContext?.confirmed_bloodwork?.markers?.find(
      (m: any) => m.marker_name.toLowerCase().includes("testosterone")
    );

    const hormonalSection: any = {
      triggered: true,
      trigger_reason: `Male, age ${profile.age}`,
      testosterone_status: testosteroneMarker
        ? { value: testosteroneMarker.value, unit: testosteroneMarker.unit, status: testosteroneMarker.marker_status }
        : { value: null, unit: null, status: "not_tested" },
      recommendations: [],
    };

    if (testosteroneMarker) {
      if (testosteroneMarker.value < 8) {
        hormonalSection.recommendations.push("Testosterone below action threshold — discuss with GP urgently. Consider endocrinology referral.");
      } else if (testosteroneMarker.value < 15) {
        hormonalSection.recommendations.push(`Testosterone ${testosteroneMarker.value} nmol/L is suboptimal. Lifestyle optimisation: sleep 7.5+ hours, resistance training 3x/week, zinc 30mg, vitamin D (already recommended above).`);
      } else {
        hormonalSection.recommendations.push(`Testosterone ${testosteroneMarker.value} nmol/L is in optimal range. Maintain current lifestyle.`);
      }
    } else {
      hormonalSection.recommendations.push(
        "No testosterone data on file. For a male aged " + profile.age + " with " + (profile.bmi ? `BMI ${profile.bmi}` : "your profile") + ", baseline testosterone (total + free) and SHBG testing is recommended.",
        "Add this to your next bloodwork panel via the Peptyl dashboard."
      );
    }

    // Check for relevant genetic variants
    const shbg = detectedGenes.find((g: any) => g.name.includes("SHBG"));
    if (shbg) {
      hormonalSection.genetic_signals = [`SHBG ${shbg.variant} — affects testosterone bioavailability`];
    }

    // Check goal alignment
    if (profile.goal && (profile.goal.toLowerCase().includes("energy") || profile.goal.toLowerCase().includes("weight") || profile.goal.toLowerCase().includes("performance") || profile.goal.toLowerCase().includes("muscle"))) {
      hormonalSection.goal_relevance = `Your goal "${profile.goal}" has a direct testosterone dependency. Optimising hormonal health should be a priority.`;
    }

    reportJson.hormonal_assessment = hormonalSection;
  }

  // ── Pass 4: Protocol conflict check ──
  if (userContext?.active_protocols?.length > 0) {
    const conflicts: string[] = [];
    const reinforcements: string[] = [];
    const recommended = [
      ...(reportJson.supplement_protocol || []).map((s: any) => s.supplement),
      ...(reportJson.peptide_protocol || []).map((p: any) => p.peptide),
    ];

    for (const protocol of userContext.active_protocols) {
      const allCurrentItems = [...(protocol.peptides || []), ...(protocol.supplements || [])];
      for (const item of allCurrentItems) {
        const itemUpper = item.toUpperCase();
        for (const rec of recommended) {
          if (itemUpper.includes(rec.toUpperCase()) || rec.toUpperCase().includes(itemUpper.split(" ")[0])) {
            reinforcements.push(`You're already taking ${item} — this report reinforces it based on your genetics.`);
          }
        }
      }
    }

    if (reinforcements.length > 0 || conflicts.length > 0) {
      reportJson.protocol_cross_reference = {
        reinforcements,
        conflicts,
        note: "Cross-referenced against your active Peptyl protocols.",
      };
    }
  }

  return reportJson;
}

// ─── Main Handler ──────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { inputText, method, userId, imageBase64 } = body;
    const tier = body.tier ?? "standard";
    const lifestyleContext = body.lifestyleContext ?? null;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    if (!inputText && !imageBase64) {
      return new Response(
        JSON.stringify({ error: "No input provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Phase 1: Fetch user context before calling AI ──
    let userContext: any = null;
    let userDataBlock = "";
    if (userId) {
      try {
        userContext = await fetchUserContext(userId);
        userDataBlock = buildUserDataBlock(userContext);
        console.log("User context fetched:", JSON.stringify({
          hasProfile: !!userContext.profile,
          hasBloodwork: !!userContext.confirmed_bloodwork,
          hasWearables: !!userContext.wearable_signals,
          activeProtocols: userContext.active_protocols?.length || 0,
          outcomeHistory: userContext.outcome_history?.length || 0,
        }));
      } catch (ctxErr) {
        console.error("Failed to fetch user context (continuing without):", ctxErr);
      }
    }

    const tierPrefix = `[TIER: ${tier}]\n\n`;
    const lifestyleStr = lifestyleContext ? `\n\nLifestyle context: ${JSON.stringify(lifestyleContext)}` : "";

    // Build user message based on method
    const instruction = tier === "advanced"
      ? `ADVANCED TIER REQUIREMENTS:
1. Follow the FULL JSON EXAMPLE structure exactly — raw JSON only, no code fences.
2. Every field in personalisation MUST reference a specific rsID and/or measured biomarker value. Generic statements are UNACCEPTABLE.
3. diet_recommendations.key_foods MUST explain WHY each food (e.g. "for MTHFR TT folate support") — minimum 4 foods.
4. training_recommendations.weekly_structure MUST reference the specific gene variants driving each session type.
5. peptide_protocol MUST be included if COL1A1, COL5A1, IL6, TNF-a, IGF1, or ACTN3 variants detected.
6. Every biomarker_result MUST include gene_interaction linking the gene variant to the biomarker value with mechanistic explanation.
7. After JSON write ---NARRATIVE--- then 5-7 bullet points each starting with • and an emoji, each referencing a specific gene+value.
8. Read the ANTI-GENERIC RULE section carefully — your personalisation, diet, and training must match the GOOD examples, not the BAD ones.
9. Use the CONFIRMED USER DATA block to deeply personalise — reference the user's actual age, BMI, goal, bloodwork values, wearable metrics, and active protocols.`
      : `STANDARD TIER: Output raw JSON (no code fences) then ---NARRATIVE--- then 4-5 bullet points starting with • and an emoji. No peptides, diet, training, or GLP-1 sections. Every action_plan item must name a specific gene or biomarker value.`;

    let userContent: any;
    if (method === "image" && imageBase64) {
      userContent = [
        { type: "image_url", image_url: { url: imageBase64 } },
        { type: "text", text: `${tierPrefix}${instruction}\n\nExtract all genetic variants and biomarker values from this image.${lifestyleStr}${userDataBlock}` },
      ];
    } else {
      const methodLabel = method === "pdf" ? "PDF lab report" : method === "raw23andme" ? "23andMe raw file" : "free text";
      userContent = `${tierPrefix}${instruction}\n\nGenetic/health data from ${methodLabel}:${lifestyleStr}${userDataBlock}\n\n${inputText}`;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 8000,
        temperature: 0.3,
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a few minutes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back, then save on completion
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              if (line === "data: [DONE]") {
                // Save to database with post-AI enrichment
                try {
                  await saveReport(fullContent, method, userId, tier, lifestyleContext, userContext);
                } catch (saveErr) {
                  console.error("Save error:", saveErr);
                }
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                controller.close();
                return;
              }
              try {
                const parsed = JSON.parse(line.slice(6));
                const text = parsed.choices?.[0]?.delta?.content || "";
                if (text) {
                  fullContent += text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch {
                // skip malformed lines
              }
            }
          }
          // If we exit the loop without [DONE], still save
          if (fullContent) {
            try {
              await saveReport(fullContent, method, userId, tier, lifestyleContext, userContext);
            } catch (saveErr) {
              console.error("Save error:", saveErr);
            }
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error("analyse-dna error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function saveReport(fullContent: string, method: string, userId: string | null, tier: string, lifestyleContext: any, userContext: any) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Split on ---NARRATIVE---
  const parts = fullContent.split("---NARRATIVE---");
  let jsonStr = parts[0].trim();
  const narrative = parts[1]?.trim() || "";

  // Strip code fences
  jsonStr = jsonStr.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

  let reportJson: any = {};
  let overallScore: number | null = null;
  let confidence: string | null = null;

  try {
    reportJson = JSON.parse(jsonStr);
    overallScore = reportJson?.health_score?.overall ?? null;
    confidence = reportJson?.meta?.confidence ?? null;
  } catch {
    // If JSON parsing fails, try regex
    const match = fullContent.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        reportJson = JSON.parse(match[0]);
        overallScore = reportJson?.health_score?.overall ?? null;
        confidence = reportJson?.meta?.confidence ?? null;
      } catch {
        console.error("Failed to parse report JSON even with regex fallback");
        reportJson = { raw_text: fullContent };
      }
    }
  }

  // ── Phase 2: Post-AI Deterministic Enrichment ──
  if (userId && typeof reportJson === "object" && !reportJson.raw_text) {
    try {
      reportJson = await enrichPeptideProtocol(reportJson, userId, userContext);
      console.log("Post-AI enrichment complete:", JSON.stringify({
        peptides: (reportJson.peptide_protocol || []).length,
        glp1Triggered: reportJson.glp1_assessment?.triggered || false,
        hormonalAssessment: !!reportJson.hormonal_assessment,
        protocolCrossRef: !!reportJson.protocol_cross_reference,
      }));
    } catch (enrichErr) {
      console.error("Post-AI enrichment error (continuing with AI output):", enrichErr);
    }
  }

  if (!userId) {
    console.log("No userId, skipping save");
    return;
  }

  const { data, error } = await supabase.from("dna_reports").insert({
    user_id: userId,
    report_json: reportJson,
    narrative,
    overall_score: overallScore,
    input_method: method,
    confidence,
    assessment_tier: tier,
    lifestyle_context: lifestyleContext,
  }).select("id").single();

  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log("Report saved:", data.id);

    // Consume the DNA assessment credit so user must pay again for next analysis
    const unlockColumn = tier === "advanced" ? "dna_advanced_unlocked" : "dna_standard_unlocked";
    await supabase
      .from("profiles")
      .update({ [unlockColumn]: false } as any)
      .eq("user_id", userId);

    // Send push notification via OneSignal
    try {
      const onesignalKey = Deno.env.get("ONESIGNAL_REST_API_KEY");
      if (onesignalKey) {
        await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${onesignalKey}`,
          },
          body: JSON.stringify({
            app_id: "7dd6be24-0dca-45af-b8b6-15cc95db293d",
            include_external_user_ids: [userId],
            headings: { en: "Your DNA Report is Ready" },
            contents: { en: `Health Score: ${overallScore ?? "N/A"}/100. Tap to view your personalised assessment.` },
            url: `https://peptyl.co.uk/dna/report/${data.id}`,
          }),
        });
        console.log("Push notification sent");
      }
    } catch (pushErr) {
      console.error("Push notification error:", pushErr);
    }

    // Send email notification via Resend
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        const { data: profile } = await supabase.auth.admin.getUserById(userId);
        const email = profile?.user?.email;
        if (email) {
          const scoreLabel = overallScore != null
            ? overallScore >= 80 ? "Good" : overallScore >= 65 ? "Needs Attention" : "Action Required"
            : "Complete";
          const tierLabel = tier === "advanced" ? "Advanced" : "Standard";
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendKey}`,
            },
            body: JSON.stringify({
              from: "Peptyl <noreply@peptyl.com>",
              to: [email],
              subject: `Your Peptyl DNA Report (${tierLabel}) is Ready`,
              html: `
                <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#ffffff;">
                  <div style="text-align:center;margin-bottom:24px;">
                    <h1 style="color:#070B14;font-size:24px;margin:0;">Your DNA Health Report</h1>
                    <p style="color:#6b7280;font-size:14px;margin-top:8px;">${tierLabel} Assessment is ready to view</p>
                  </div>
                  <div style="background:#070B14;border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
                    <div style="font-size:48px;font-weight:700;color:#00D4AA;">${overallScore ?? "\u2014"}</div>
                    <div style="color:#9ca3af;font-size:14px;margin-top:4px;">/ 100 Health Score</div>
                    <div style="display:inline-block;margin-top:12px;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:600;background:${overallScore != null && overallScore >= 80 ? "rgba(0,212,170,0.15);color:#00D4AA" : overallScore != null && overallScore >= 65 ? "rgba(245,158,11,0.15);color:#F59E0B" : "rgba(239,68,68,0.15);color:#EF4444"};">
                      ${scoreLabel}
                    </div>
                  </div>
                  <div style="text-align:center;">
                    <a href="https://peptyl.co.uk/dna/report/${data.id}" style="display:inline-block;background:#00D4AA;color:#070B14;font-weight:600;font-size:14px;padding:12px 32px;border-radius:8px;text-decoration:none;">View Full Report</a>
                  </div>
                  <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:24px;">This is a wellness assessment, not a medical diagnosis. Consult your GP for clinical decisions.</p>
                </div>
              `,
            }),
          });
          console.log("Email notification sent to", email);
        }
      }
    } catch (emailErr) {
      console.error("Email notification error:", emailErr);
    }
  }
}
