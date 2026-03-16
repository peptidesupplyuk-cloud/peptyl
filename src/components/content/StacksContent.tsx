import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Clock,
  Syringe,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Beaker,
  Target,
  Heart,
  Zap,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────

interface StackCompound {
  name: string;
  type: "peptide" | "supplement";
  role: string;
  dose: string;
  frequency: string;
  timing: string;
  route: string;
  whyIncluded: string;
}

interface StackPhase {
  name: string;
  weeks: string;
  description: string;
  compounds: StackCompound[];
  notes?: string;
}

interface StackBenefit {
  title: string;
  description: string;
  evidence: string;
}

interface StackReference {
  title: string;
  detail: string;
  type: "clinical" | "preclinical" | "established";
}

interface CuratedStack {
  id: string;
  name: string;
  subtitle: string;
  goal: string;
  icon: typeof Shield;
  duration: string;
  difficulty: "Beginner-Friendly" | "Intermediate" | "Advanced";
  evidence: "Clinical" | "Established" | "Emerging";
  summary: string;
  whoIsThisFor: string[];
  benefits: StackBenefit[];
  phases: StackPhase[];
  supportSupplements: StackCompound[];
  importantNotes: string[];
  references: StackReference[];
}

// ── Injury Recovery Stack ──────────────────────────────────────────────────

const CURATED_STACKS: CuratedStack[] = [
  {
    id: "injury-recovery",
    name: "Injury Recovery Stack",
    subtitle: "Accelerate tissue repair, reduce inflammation, and return to full function faster",
    goal: "Healing & Recovery",
    icon: Shield,
    duration: "6-8 weeks",
    difficulty: "Beginner-Friendly",
    evidence: "Established",
    summary:
      "The most widely used peptide combination for injury recovery. This stack pairs BPC-157 (localised tissue repair) with TB-500 (systemic healing), supported by GHK-Cu for collagen remodelling and KPV for targeted anti-inflammatory action. Each compound addresses a different stage of the healing cascade, so they work together rather than duplicating effort.",
    whoIsThisFor: [
      "Recovering from tendon, ligament, or muscle injuries",
      "Post-surgical healing support",
      "Chronic joint pain or inflammation",
      "Athletes returning from training injuries",
      "Anyone with slow-healing soft tissue damage",
    ],
    benefits: [
      {
        title: "Accelerated Tissue Repair",
        description:
          "BPC-157 upregulates growth factors (VEGF, FGF, EGF) and promotes angiogenesis, forming new blood vessels at injury sites. This increases nutrient delivery directly where healing is needed.",
        evidence: "Demonstrated across 100+ preclinical studies on tendon, muscle, ligament, and gut tissue repair.",
      },
      {
        title: "Systemic Cell Migration",
        description:
          "TB-500 (Thymosin Beta-4) promotes the migration of endothelial and stem cells to damaged tissue. Unlike BPC-157 which works locally, TB-500 has a systemic effect, meaning it supports healing throughout the body.",
        evidence: "Documented in wound healing and cardiac repair research. The 1:1 BPC/TB blend is the most widely used healing protocol.",
      },
      {
        title: "Collagen Remodelling",
        description:
          "GHK-Cu (copper peptide) stimulates collagen I, III, and elastin production while activating metalloproteinases that break down damaged extracellular matrix. This means stronger, better-organised scar tissue.",
        evidence: "Multiple peer-reviewed studies on wound healing, with measurable increases in collagen synthesis.",
      },
      {
        title: "Anti-Inflammatory Action",
        description:
          "KPV is a tripeptide fragment of alpha-MSH that directly inhibits NF-κB, one of the master regulators of inflammation. This reduces swelling and pain without suppressing the immune system.",
        evidence: "Demonstrated NF-κB suppression in published inflammatory models. Evidence grade B.",
      },
      {
        title: "Reduced Recovery Time",
        description:
          "By addressing four different healing pathways simultaneously (angiogenesis, cell migration, collagen synthesis, and inflammation), this stack targets the full repair cascade rather than just one mechanism.",
        evidence: "Based on established peptide therapy protocols combining complementary mechanisms.",
      },
    ],
    phases: [
      {
        name: "Phase 1: Acute Repair",
        weeks: "Weeks 1-3",
        description:
          "Focus on reducing inflammation and initiating tissue repair. This is the most critical phase where the injury site needs increased blood flow and growth factor stimulation.",
        compounds: [
          {
            name: "BPC-157",
            type: "peptide",
            role: "Primary tissue repair",
            dose: "250-500 mcg/day",
            frequency: "Once daily",
            timing: "Morning, or split AM/PM if using 500 mcg",
            route: "Subcutaneous injection near injury site",
            whyIncluded:
              "BPC-157 is the foundation of any healing stack. It promotes angiogenesis (new blood vessel formation) at the injury site, upregulates growth factors including VEGF and FGF, and has a protective effect on surrounding tissue. Injecting near the injury site provides the most direct benefit.",
          },
          {
            name: "TB-500",
            type: "peptide",
            role: "Systemic healing support",
            dose: "500 mcg/day",
            frequency: "Once daily",
            timing: "Can be taken with BPC-157 (often in a 1:1 blend)",
            route: "Subcutaneous injection (any site; systemic effect)",
            whyIncluded:
              "TB-500 (Thymosin Beta-4) complements BPC-157 by working systemically. While BPC-157 heals locally, TB-500 promotes the migration of repair cells throughout the body. It also reduces inflammation via IL-6 and TNF-alpha modulation. The 1:1 BPC/TB blend is the most established healing combination in peptide therapy.",
          },
          {
            name: "KPV",
            type: "peptide",
            role: "Anti-inflammatory",
            dose: "200-500 mcg/day",
            frequency: "Once daily",
            timing: "Morning",
            route: "Subcutaneous injection or oral",
            whyIncluded:
              "KPV directly suppresses NF-κB, the master inflammatory pathway. During the acute phase, inflammation can impede healing if it becomes excessive. KPV reduces this without suppressing the immune system, unlike NSAIDs which can actually slow tissue repair.",
          },
        ],
        notes:
          "During the acute phase, avoid NSAIDs (ibuprofen, naproxen) if possible. While they reduce pain, NSAIDs inhibit prostaglandins that are essential for tissue repair. This stack addresses inflammation through NF-κB suppression (KPV) and cytokine modulation (TB-500), which do not interfere with the healing cascade.",
      },
      {
        name: "Phase 2: Remodelling",
        weeks: "Weeks 4-6",
        description:
          "Transition from acute repair to tissue remodelling. The injury site is now forming new tissue, and this phase focuses on ensuring that tissue is strong and well-organised.",
        compounds: [
          {
            name: "BPC-157",
            type: "peptide",
            role: "Continued tissue repair",
            dose: "250-500 mcg/day",
            frequency: "Once daily",
            timing: "Morning",
            route: "Subcutaneous injection near injury site",
            whyIncluded:
              "BPC-157 continues to support angiogenesis and growth factor production. By this phase, the new blood vessels formed in Phase 1 are maturing and delivering nutrients to the remodelling tissue.",
          },
          {
            name: "TB-500",
            type: "peptide",
            role: "Cell migration and remodelling",
            dose: "500 mcg/day",
            frequency: "Once daily",
            timing: "With BPC-157",
            route: "Subcutaneous injection",
            whyIncluded:
              "TB-500 continues systemic healing support. Its role in promoting actin polymerisation helps cells move into damaged areas and form organised tissue structures.",
          },
          {
            name: "GHK-Cu",
            type: "peptide",
            role: "Collagen remodelling",
            dose: "1-2 mg/day",
            frequency: "Once daily",
            timing: "Morning or evening",
            route: "Subcutaneous injection or topical",
            whyIncluded:
              "GHK-Cu is introduced in Phase 2 because this is when collagen remodelling becomes the primary healing activity. It stimulates collagen I and III synthesis while activating metalloproteinases (MMPs) that clear damaged extracellular matrix. The copper ion also has mild antimicrobial properties. The result is stronger, more organised scar tissue.",
          },
        ],
        notes:
          "KPV can be discontinued or reduced in Phase 2 if inflammation has resolved. GHK-Cu is added here because collagen remodelling is most active 3-6 weeks post-injury.",
      },
      {
        name: "Phase 3: Strengthening (Optional)",
        weeks: "Weeks 7-8",
        description:
          "A tapering phase for those with severe injuries or slow healing. If recovery is progressing well, this phase can be skipped.",
        compounds: [
          {
            name: "BPC-157",
            type: "peptide",
            role: "Maintenance repair",
            dose: "250 mcg/day",
            frequency: "Once daily or every other day",
            timing: "Morning",
            route: "Subcutaneous injection",
            whyIncluded:
              "Reduced dose to maintain growth factor stimulation during final tissue maturation. Can taper to every other day.",
          },
          {
            name: "GHK-Cu",
            type: "peptide",
            role: "Continued collagen support",
            dose: "1 mg/day",
            frequency: "Once daily or every other day",
            timing: "Morning or evening",
            route: "Subcutaneous injection or topical",
            whyIncluded:
              "Continue supporting collagen remodelling. Tissue can take 8-12 weeks to reach full structural integrity, so GHK-Cu supports this final maturation.",
          },
        ],
        notes:
          "TB-500 is typically discontinued by week 7 as its systemic cell migration role is most valuable in the acute and early remodelling phases. If healing is progressing well by week 6, you may skip Phase 3 entirely.",
      },
    ],
    supportSupplements: [
      {
        name: "Vitamin C",
        type: "supplement",
        role: "Collagen synthesis cofactor",
        dose: "1,000-2,000 mg/day",
        frequency: "Split AM/PM",
        timing: "With meals",
        route: "Oral",
        whyIncluded:
          "Vitamin C is an essential cofactor for collagen synthesis. Without adequate vitamin C, the body cannot properly hydroxylate proline and lysine residues in collagen, leading to weaker tissue. It also supports the antioxidant defence at injury sites.",
      },
      {
        name: "Zinc",
        type: "supplement",
        role: "Immune and repair support",
        dose: "15-30 mg/day",
        frequency: "Once daily",
        timing: "With food (to avoid nausea)",
        route: "Oral (zinc picolinate or bisglycinate)",
        whyIncluded:
          "Zinc is required for over 300 enzymatic reactions including those involved in tissue repair and immune function. Deficiency is common and impairs wound healing. Supports the metalloproteinase activity that GHK-Cu relies on.",
      },
      {
        name: "Omega-3 (EPA/DHA)",
        type: "supplement",
        role: "Anti-inflammatory and cell membrane support",
        dose: "2-3 g/day (combined EPA+DHA)",
        frequency: "Once daily",
        timing: "With food",
        route: "Oral",
        whyIncluded:
          "EPA and DHA are precursors to resolvins and protectins, which actively resolve inflammation rather than simply suppressing it. This complements KPV's NF-κB inhibition with a different mechanism. Also supports cell membrane fluidity needed for tissue repair.",
      },
      {
        name: "Magnesium",
        type: "supplement",
        role: "Muscle relaxation and enzyme cofactor",
        dose: "200-400 mg/day",
        frequency: "Evening",
        timing: "Before bed",
        route: "Oral (magnesium glycinate or threonate)",
        whyIncluded:
          "Magnesium supports muscle relaxation, reduces cramping around injury sites, and is a cofactor for ATP production needed for cellular repair. Glycinate form is well-absorbed and gentle on the stomach.",
      },
    ],
    importantNotes: [
      "This is a research-based protocol, not medical advice. Consult a healthcare provider before starting any peptide regimen, especially if you have existing medical conditions or are taking medications.",
      "BPC-157 and TB-500 are research peptides. They are not approved by the FDA, MHRA, or EMA for human therapeutic use. All evidence cited is from preclinical research and established peptide therapy protocols.",
      "Start at the lower end of dose ranges and assess tolerance before increasing. Individual responses vary.",
      "Peptides must be properly reconstituted with bacteriostatic water and stored refrigerated (2-8°C). Use within 30 days of reconstitution.",
      "If you experience unusual side effects (persistent nausea, injection site reactions beyond mild redness, or any allergic symptoms), discontinue and consult a healthcare professional.",
      "This stack does not replace physical therapy, proper nutrition, sleep, or medical treatment for serious injuries.",
    ],
    references: [
      {
        title: "BPC-157 Tissue Repair Mechanisms",
        detail:
          "Over 100 preclinical studies demonstrating BPC-157's ability to accelerate healing in tendon, ligament, muscle, nerve, and gut tissue through VEGF and FGF upregulation and nitric oxide system modulation.",
        type: "preclinical",
      },
      {
        title: "TB-500 (Thymosin Beta-4) Wound Healing",
        detail:
          "Research demonstrating TB-500's role in promoting cell migration via actin polymerisation, with documented effects on endothelial cell migration, wound closure, and cardiac tissue repair.",
        type: "preclinical",
      },
      {
        title: "GHK-Cu Collagen Synthesis",
        detail:
          "Peer-reviewed studies showing GHK-Cu stimulates collagen I and III production, activates metalloproteinases for tissue remodelling, and increases decorin synthesis for organised scar tissue formation.",
        type: "preclinical",
      },
      {
        title: "KPV Anti-Inflammatory Pathway",
        detail:
          "Published research on KPV (alpha-MSH fragment) demonstrating direct NF-κB pathway inhibition, reducing pro-inflammatory cytokines without immunosuppressive effects seen with corticosteroids.",
        type: "preclinical",
      },
      {
        title: "BPC-157 + TB-500 Combination Protocol",
        detail:
          "The 1:1 BPC-157/TB-500 blend is the most widely documented peptide combination in established therapy protocols, with complementary local (BPC) and systemic (TB) healing mechanisms.",
        type: "established",
      },
    ],
  },
];

// ── Sub-Components ─────────────────────────────────────────────────────────

const EvidenceBadge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    Clinical: "bg-success/10 text-success border-success/20",
    Established: "bg-primary/10 text-primary border-primary/20",
    Emerging: "bg-warm/10 text-warm border-warm/20",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${styles[type] || styles.Emerging}`}>
      {type} Evidence
    </span>
  );
};

const DifficultyBadge = ({ level }: { level: string }) => {
  const styles: Record<string, string> = {
    "Beginner-Friendly": "bg-success/10 text-success border-success/20",
    Intermediate: "bg-warm/10 text-warm border-warm/20",
    Advanced: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${styles[level] || ""}`}>
      {level}
    </span>
  );
};

const RefBadge = ({ type }: { type: string }) => {
  const styles: Record<string, { label: string; class: string }> = {
    clinical: { label: "Clinical Trial", class: "bg-success/10 text-success" },
    preclinical: { label: "Preclinical", class: "bg-info/10 text-info" },
    established: { label: "Established Protocol", class: "bg-primary/10 text-primary" },
  };
  const s = styles[type] || styles.preclinical;
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.class}`}>{s.label}</span>;
};

const CompoundRow = ({ compound }: { compound: StackCompound }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${compound.type === "peptide" ? "bg-primary" : "bg-warm"}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold text-sm text-foreground">{compound.name}</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground uppercase tracking-wider">
                {compound.type}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{compound.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-foreground">{compound.dose}</p>
            <p className="text-[10px] text-muted-foreground">{compound.frequency}</p>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Dose</p>
                  <p className="text-xs text-foreground font-medium">{compound.dose}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Frequency</p>
                  <p className="text-xs text-foreground font-medium">{compound.frequency}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Timing</p>
                  <p className="text-xs text-foreground font-medium">{compound.timing}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Route</p>
                  <p className="text-xs text-foreground font-medium">{compound.route}</p>
                </div>
              </div>
              <div className="bg-muted/40 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Why This Is Included</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{compound.whyIncluded}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PhaseSection = ({ phase, index }: { phase: StackPhase; index: number }) => {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-sm">
            {index + 1}
          </div>
          <div>
            <h4 className="font-heading font-semibold text-foreground text-sm">{phase.name}</h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {phase.weeks}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground hidden sm:block">
            {phase.compounds.length} compound{phase.compounds.length !== 1 ? "s" : ""}
          </span>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{phase.description}</p>
              <div className="space-y-2">
                {phase.compounds.map((c) => (
                  <CompoundRow key={c.name} compound={c} />
                ))}
              </div>
              {phase.notes && (
                <div className="flex gap-2.5 p-3 rounded-xl bg-warm/5 border border-warm/10">
                  <Info className="h-4 w-4 text-warm shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{phase.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Stack Detail View ──────────────────────────────────────────────────────

const StackDetailView = ({ stack }: { stack: CuratedStack }) => {
  const Icon = stack.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Hero */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-foreground mb-1">{stack.name}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{stack.subtitle}</p>
            <div className="flex flex-wrap gap-2">
              <EvidenceBadge type={stack.evidence} />
              <DifficultyBadge level={stack.difficulty} />
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-border bg-muted/50 text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {stack.duration}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{stack.summary}</p>
      </div>

      {/* Who Is This For */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-base mb-3 flex items-center gap-2">
          <Target className="h-4.5 w-4.5 text-primary" />
          Who Is This For?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {stack.whoIsThisFor.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-base mb-3 flex items-center gap-2">
          <Heart className="h-4.5 w-4.5 text-primary" />
          Key Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stack.benefits.map((b, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-2">
                <h4 className="font-heading font-semibold text-sm text-foreground">{b.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
                <div className="flex items-start gap-1.5 pt-1">
                  <Beaker className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-primary/80 leading-relaxed">{b.evidence}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Protocol Phases */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-base mb-3 flex items-center gap-2">
          <Syringe className="h-4.5 w-4.5 text-primary" />
          Protocol Breakdown
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click each phase to see the exact compounds, doses, and timing. Every compound includes an explanation of why it is in this stack.
        </p>
        <div className="space-y-3">
          {stack.phases.map((phase, i) => (
            <PhaseSection key={phase.name} phase={phase} index={i} />
          ))}
        </div>
      </div>

      {/* Support Supplements */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-base mb-3 flex items-center gap-2">
          <Zap className="h-4.5 w-4.5 text-warm" />
          Recommended Support Supplements
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          These are not required but significantly support the healing process. All are well-researched with strong safety profiles.
        </p>
        <div className="space-y-2">
          {stack.supportSupplements.map((s) => (
            <CompoundRow key={s.name} compound={s} />
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-warm/5 border border-warm/15 rounded-2xl p-5 sm:p-6">
        <h3 className="font-heading font-bold text-foreground text-base mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5 text-warm" />
          Important Notes
        </h3>
        <ul className="space-y-2.5">
          {stack.importantNotes.map((note, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="text-warm font-bold text-xs mt-0.5">•</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{note}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* References */}
      <div>
        <h3 className="font-heading font-bold text-foreground text-base mb-3 flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5 text-primary" />
          Research References
        </h3>
        <div className="space-y-2">
          {stack.references.map((ref, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <h4 className="font-heading font-semibold text-sm text-foreground">{ref.title}</h4>
                <RefBadge type={ref.type} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{ref.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Export ─────────────────────────────────────────────────────────────

const StacksContent = () => {
  const [selectedStack, setSelectedStack] = useState<string>(CURATED_STACKS[0].id);
  const stack = CURATED_STACKS.find((s) => s.id === selectedStack);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold text-foreground mb-1">Curated Stacks</h2>
        <p className="text-sm text-muted-foreground">
          Research-backed peptide and supplement combinations, broken down step by step. Each stack explains what to take, when, how much, and why.
        </p>
      </div>

      {/* Stack selector (for when we have multiple) */}
      {CURATED_STACKS.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {CURATED_STACKS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedStack(s.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedStack === s.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                }`}
              >
                <Icon className="h-4 w-4" />
                {s.name}
              </button>
            );
          })}
        </div>
      )}

      {stack && <StackDetailView stack={stack} />}

      {/* Coming soon notice */}
      <div className="bg-muted/30 border border-border rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">More stacks coming soon</p>
        <p className="text-xs text-muted-foreground/60">
          Body Recomposition, Cognitive Performance, Longevity, and Immune Defence stacks are in development.
        </p>
      </div>
    </div>
  );
};

export default StacksContent;
