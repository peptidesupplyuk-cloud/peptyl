import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Beaker,
  Zap,
  BookOpen,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Compound {
  name: string;
  type: "peptide" | "supplement";
  role: string;
  dose: string;
  frequency: string;
  timing: string;
  route: string;
  why: string;
}

interface Phase {
  name: string;
  weeks: string;
  compounds: Compound[];
  note?: string;
}

interface Benefit {
  title: string;
  desc: string;
  citation: string;
}

interface Reference {
  title: string;
  detail: string;
  type: "clinical" | "preclinical" | "established";
}

interface CuratedStack {
  id: string;
  name: string;
  tagline: string;
  icon: typeof Shield;
  duration: string;
  difficulty: string;
  evidence: string;
  overview: string;
  forWhom: string[];
  benefits: Benefit[];
  phases: Phase[];
  supplements: Compound[];
  warnings: string[];
  refs: Reference[];
}

// ── Data ───────────────────────────────────────────────────────────────────

const STACKS: CuratedStack[] = [
  {
    id: "injury-recovery",
    name: "Injury Recovery Stack",
    tagline: "Tissue repair + anti-inflammation + collagen remodelling",
    icon: Shield,
    duration: "6-8 weeks",
    difficulty: "Beginner-Friendly",
    evidence: "Established",
    overview:
      "Pairs BPC-157 (local tissue repair) with TB-500 (systemic healing), GHK-Cu (collagen remodelling), and KPV (anti-inflammatory). Four compounds, four different healing pathways.",
    forWhom: [
      "Tendon, ligament, or muscle injuries",
      "Post-surgical recovery",
      "Chronic joint pain",
      "Athletes returning from injury",
      "Slow-healing soft tissue damage",
    ],
    benefits: [
      {
        title: "Tissue Repair",
        desc: "BPC-157 upregulates VEGF, FGF, and EGF, forming new blood vessels at the injury site to accelerate healing.",
        citation: "100+ preclinical studies on tendon, muscle, and ligament repair",
      },
      {
        title: "Systemic Healing",
        desc: "TB-500 promotes stem and endothelial cell migration to damaged tissue throughout the body.",
        citation: "Documented in wound healing and cardiac repair research",
      },
      {
        title: "Collagen Strength",
        desc: "GHK-Cu stimulates collagen I and III synthesis while clearing damaged matrix for stronger scar tissue.",
        citation: "Peer-reviewed wound healing studies with measurable collagen increase",
      },
      {
        title: "Inflammation Control",
        desc: "KPV inhibits NF-κB directly, reducing swelling and pain without immune suppression.",
        citation: "Published NF-κB suppression models, evidence grade B",
      },
    ],
    phases: [
      {
        name: "Phase 1: Acute Repair",
        weeks: "Weeks 1-3",
        compounds: [
          {
            name: "BPC-157", type: "peptide", role: "Primary repair",
            dose: "250-500 mcg/day", frequency: "1x daily", timing: "Morning",
            route: "SubQ near injury",
            why: "Foundation compound. Promotes angiogenesis and growth factor upregulation at the injury site. Injecting near the injury provides the most direct benefit.",
          },
          {
            name: "TB-500", type: "peptide", role: "Systemic healing",
            dose: "500 mcg/day", frequency: "1x daily", timing: "With BPC-157 (1:1 blend)",
            route: "SubQ (any site)",
            why: "Complements BPC-157's local action with systemic cell migration. Also modulates IL-6 and TNF-alpha for inflammation control.",
          },
          {
            name: "KPV", type: "peptide", role: "Anti-inflammatory",
            dose: "200-500 mcg/day", frequency: "1x daily", timing: "Morning",
            route: "SubQ or oral",
            why: "Directly suppresses NF-κB without the healing-inhibiting effects of NSAIDs. Most valuable during the acute inflammatory phase.",
          },
          {
            name: "GHK-Cu", type: "peptide", role: "Early collagen support",
            dose: "1 mg/day", frequency: "1x daily", timing: "Evening",
            route: "SubQ or topical",
            why: "Starting GHK-Cu early primes collagen synthesis. Lower dose in Phase 1, increased in Phase 2 when remodelling becomes the primary activity.",
          },
        ],
        note: "Avoid NSAIDs (ibuprofen, naproxen) if possible. They inhibit prostaglandins essential for tissue repair. This stack handles inflammation through NF-κB suppression (KPV) and cytokine modulation (TB-500) instead.",
      },
      {
        name: "Phase 2: Remodelling",
        weeks: "Weeks 4-6",
        compounds: [
          {
            name: "BPC-157", type: "peptide", role: "Continued repair",
            dose: "250-500 mcg/day", frequency: "1x daily", timing: "Morning",
            route: "SubQ near injury",
            why: "Continued angiogenesis and growth factor support as new tissue matures.",
          },
          {
            name: "TB-500", type: "peptide", role: "Tissue remodelling",
            dose: "500 mcg/day", frequency: "1x daily", timing: "With BPC-157",
            route: "SubQ",
            why: "Sustained systemic healing support. Actin polymerisation helps cells organise into functional tissue structures during the critical remodelling window.",
          },
          {
            name: "KPV", type: "peptide", role: "Continued anti-inflammatory",
            dose: "200-500 mcg/day", frequency: "1x daily", timing: "Morning",
            route: "SubQ or oral",
            why: "Maintaining NF-κB suppression through the remodelling phase prevents residual inflammation from disrupting collagen organisation and tissue maturation.",
          },
          {
            name: "GHK-Cu", type: "peptide", role: "Collagen remodelling",
            dose: "1-2 mg/day", frequency: "1x daily", timing: "Evening",
            route: "SubQ or topical",
            why: "Dose increased. Collagen remodelling peaks at weeks 3-6. GHK-Cu activates MMPs to clear damaged matrix and stimulates collagen I/III for stronger tissue.",
          },
        ],
        note: "GHK-Cu dose increases here because collagen remodelling is most active 3-6 weeks post-injury. TB-500 and KPV continue throughout for sustained systemic healing and inflammation control.",
      },
      {
        name: "Phase 3: Strengthening",
        weeks: "Weeks 7-8",
        compounds: [
          {
            name: "BPC-157", type: "peptide", role: "Maintenance",
            dose: "250 mcg/day", frequency: "Daily or every other day", timing: "Morning",
            route: "SubQ",
            why: "Tapering dose to support final tissue maturation. Can move to every other day.",
          },
          {
            name: "TB-500", type: "peptide", role: "Final systemic support",
            dose: "250-500 mcg/day", frequency: "1x daily", timing: "With BPC-157",
            route: "SubQ",
            why: "Maintaining TB-500 through the full 8 weeks ensures continued cell migration to the injury site during final tissue maturation, supporting stronger long-term outcomes.",
          },
          {
            name: "KPV", type: "peptide", role: "Residual inflammation control",
            dose: "200 mcg/day", frequency: "1x daily", timing: "Morning",
            route: "SubQ or oral",
            why: "Low-grade inflammation can persist for weeks after apparent healing. Keeping KPV through week 8 ensures complete inflammatory resolution for optimal tissue quality.",
          },
          {
            name: "GHK-Cu", type: "peptide", role: "Final collagen support",
            dose: "1 mg/day", frequency: "Daily or every other day", timing: "Evening",
            route: "SubQ or topical",
            why: "Full structural integrity takes 8-12 weeks. GHK-Cu continues supporting collagen maturation.",
          },
        ],
        note: "All four peptides run the full 8-week course. BPC-157 and GHK-Cu can taper to every other day if healing is progressing well. TB-500 and KPV at maintenance doses ensure complete systemic recovery.",
      },
    ],
    supplements: [
      {
        name: "Vitamin C", type: "supplement", role: "Collagen cofactor",
        dose: "1-2 g/day", frequency: "Split AM/PM", timing: "With meals", route: "Oral",
        why: "Essential cofactor for collagen hydroxylation. Without it, collagen is structurally weak.",
      },
      {
        name: "Zinc", type: "supplement", role: "Repair enzyme support",
        dose: "15-30 mg/day", frequency: "1x daily", timing: "With food", route: "Oral (picolinate)",
        why: "Required for 300+ enzymatic reactions in tissue repair. Supports the MMP activity GHK-Cu relies on.",
      },
      {
        name: "Omega-3", type: "supplement", role: "Inflammation resolution",
        dose: "2-3 g EPA+DHA/day", frequency: "1x daily", timing: "With food", route: "Oral",
        why: "Precursor to resolvins that actively resolve inflammation (different pathway to KPV).",
      },
      {
        name: "Magnesium", type: "supplement", role: "Muscle + ATP support",
        dose: "200-400 mg/day", frequency: "Evening", timing: "Before bed", route: "Oral (glycinate)",
        why: "Reduces muscle cramping around injury. Cofactor for ATP production needed for repair.",
      },
    ],
    warnings: [
      "Research-based protocol, not medical advice. Consult a healthcare provider before starting.",
      "BPC-157 and TB-500 are research peptides, not approved by FDA/MHRA/EMA for human use.",
      "Start at lower dose ranges and assess tolerance before increasing.",
      "Reconstitute with bacteriostatic water, store at 2-8°C, use within 30 days.",
      "Does not replace physical therapy, proper nutrition, or medical treatment.",
    ],
    refs: [
      { title: "BPC-157 Tissue Repair", detail: "100+ preclinical studies: VEGF/FGF upregulation, NO system modulation across tendon, muscle, ligament, nerve, and gut tissue.", type: "preclinical" },
      { title: "TB-500 Wound Healing", detail: "Cell migration via actin polymerisation. Documented effects on endothelial migration, wound closure, cardiac repair.", type: "preclinical" },
      { title: "GHK-Cu Collagen Synthesis", detail: "Stimulates collagen I/III, activates MMPs, increases decorin for organised scar tissue.", type: "preclinical" },
      { title: "KPV NF-κB Inhibition", detail: "Alpha-MSH fragment with direct NF-κB suppression. Anti-inflammatory without immunosuppression.", type: "preclinical" },
      { title: "BPC-157 + TB-500 Protocol", detail: "Most documented peptide combination. Complementary local + systemic healing.", type: "established" },
    ],
  },
];

// ── Protocol Overview Grid ─────────────────────────────────────────────────

const ProtocolGrid = ({ stack }: { stack: CuratedStack }) => {
  const allCompounds = Array.from(
    new Set(stack.phases.flatMap((p) => p.compounds.map((c) => c.name)))
  );

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-2 font-semibold text-muted-foreground w-24">Compound</th>
            {stack.phases.map((p) => (
              <th key={p.name} className="text-center py-2 px-2 font-semibold text-muted-foreground">{p.weeks}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allCompounds.map((name) => (
            <tr key={name} className="border-b border-border/50">
              <td className="py-1.5 px-2 font-heading font-semibold text-foreground">{name}</td>
              {stack.phases.map((phase) => {
                const c = phase.compounds.find((x) => x.name === name);
                return (
                  <td key={phase.name} className="py-1.5 px-2 text-center">
                    {c ? (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-[11px]">
                        {c.dose}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Compound Row (compact) ─────────────────────────────────────────────────

const CompoundRow = ({ c }: { c: Compound }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`h-2 w-2 rounded-full shrink-0 ${c.type === "peptide" ? "bg-primary" : "bg-warm"}`} />
          <span className="font-heading font-semibold text-xs text-foreground">{c.name}</span>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">{c.role}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-medium text-foreground">{c.dose}</span>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">{c.frequency}</span>
          {open ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 pt-1 border-t border-border">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {[
                  ["Dose", c.dose],
                  ["Frequency", c.frequency],
                  ["Timing", c.timing],
                  ["Route", c.route],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="text-[11px] text-foreground">{val}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/30 rounded-md p-2">{c.why}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Phase Block ────────────────────────────────────────────────────────────

const PhaseBlock = ({ phase, idx }: { phase: Phase; idx: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl bg-card">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 text-left hover:bg-muted/10 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-xs">{idx + 1}</div>
          <div>
            <h4 className="font-heading font-semibold text-foreground text-sm leading-tight">{phase.name}</h4>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{phase.weeks}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{phase.compounds.length} compounds</span>
          {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5">
              {phase.compounds.map((c) => <CompoundRow key={c.name} c={c} />)}
              {phase.note && (
                <div className="flex gap-2 p-2 rounded-lg bg-warm/5 border border-warm/10 mt-1">
                  <Info className="h-3.5 w-3.5 text-warm shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{phase.note}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Stack Detail ───────────────────────────────────────────────────────────

const StackDetail = ({ stack }: { stack: CuratedStack }) => {
  const [showRefs, setShowRefs] = useState(false);
  const Icon = stack.icon;
  const refStyles: Record<string, { label: string; cls: string }> = {
    clinical: { label: "Clinical", cls: "bg-success/10 text-success" },
    preclinical: { label: "Preclinical", cls: "bg-info/10 text-info" },
    established: { label: "Protocol", cls: "bg-primary/10 text-primary" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-bold text-lg text-foreground leading-tight">{stack.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{stack.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">{stack.evidence}</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-success/10 text-success border-success/20">{stack.difficulty}</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border bg-muted/50 text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{stack.duration}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{stack.overview}</p>
      </div>

      {/* Two-column: Who + Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Who */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-heading font-bold text-sm text-foreground mb-2">Who Is This For?</h3>
          <ul className="space-y-1">
            {stack.forWhom.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-heading font-bold text-sm text-foreground mb-2">Key Benefits</h3>
          <div className="space-y-2.5">
            {stack.benefits.map((b, i) => (
              <div key={i}>
                <h4 className="font-heading font-semibold text-xs text-foreground">{b.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{b.desc}</p>
                <p className="text-[10px] text-primary/70 flex items-center gap-1 mt-0.5"><Beaker className="h-2.5 w-2.5" />{b.citation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Protocol Overview Grid */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-heading font-bold text-sm text-foreground mb-2">Protocol at a Glance</h3>
        <ProtocolGrid stack={stack} />
      </div>

      {/* Phase Breakdown */}
      <div>
        <h3 className="font-heading font-bold text-sm text-foreground mb-2">Phase Breakdown</h3>
        <div className="space-y-2">
          {stack.phases.map((p, i) => <PhaseBlock key={p.name} phase={p} idx={i} />)}
        </div>
      </div>

      {/* Support Supplements */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-heading font-bold text-sm text-foreground mb-2 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-warm" />
          Support Supplements
        </h3>
        <p className="text-[11px] text-muted-foreground mb-2">Not required but significantly support healing. Strong safety profiles.</p>
        <div className="space-y-1.5">
          {stack.supplements.map((s) => <CompoundRow key={s.name} c={s} />)}
        </div>
      </div>

      {/* Warnings */}
      <div className="bg-warm/5 border border-warm/10 rounded-xl p-4">
        <h3 className="font-heading font-bold text-sm text-foreground mb-2 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-warm" />
          Important
        </h3>
        <ul className="space-y-1">
          {stack.warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-warm text-xs mt-px">•</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{w}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* References (collapsible) */}
      <div>
        <button onClick={() => setShowRefs(!showRefs)} className="flex items-center gap-1.5 text-xs font-heading font-bold text-foreground hover:text-primary transition-colors">
          <BookOpen className="h-3.5 w-3.5" />
          Research References ({stack.refs.length})
          {showRefs ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        <AnimatePresence>
          {showRefs && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="space-y-1.5 mt-2">
                {stack.refs.map((r, i) => {
                  const s = refStyles[r.type] || refStyles.preclinical;
                  return (
                    <div key={i} className="bg-card border border-border rounded-lg p-3 flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-heading font-semibold text-xs text-foreground">{r.title}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{r.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ── Main Export ─────────────────────────────────────────────────────────────

const StacksContent = () => {
  const stack = STACKS[0];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-heading font-bold text-foreground">Curated Stacks</h2>
        <p className="text-xs text-muted-foreground">Research-backed combinations broken down step by step.</p>
      </div>

      {stack && <StackDetail stack={stack} />}

      <div className="bg-muted/30 border border-border rounded-xl p-4 text-center">
        <p className="text-xs text-muted-foreground">More stacks coming soon: Body Recomposition, Cognitive Performance, Longevity, Immune Defence</p>
      </div>
    </div>
  );
};

export default StacksContent;
