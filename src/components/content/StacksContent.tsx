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
            dose: "500 mcg/day (250 mcg AM + 250 mcg PM)", frequency: "2x daily", timing: "Morning + evening, 12 hours apart",
            route: "SubQ near injury site",
            why: "500 mcg is the established therapeutic dose for acute injury. Splitting into two 250 mcg injections maintains more consistent growth factor stimulation (VEGF, FGF, EGF) throughout the day. Inject as close to the injury site as practical for maximum local angiogenesis.",
          },
          {
            name: "TB-500", type: "peptide", role: "Systemic healing",
            dose: "2.5 mg, 2x per week", frequency: "2x weekly (e.g. Mon/Thu)", timing: "Morning, on injection days",
            route: "SubQ (any site — systemic effect)",
            why: "TB-500 has a longer half-life than BPC-157, so twice-weekly dosing at 2.5 mg (5 mg/week total) is optimal. This is the loading dose. TB-500 works systemically via actin polymerisation and cell migration, so injection site does not need to be near the injury.",
          },
          {
            name: "KPV", type: "peptide", role: "Anti-inflammatory",
            dose: "500 mcg/day (250 mcg AM + 250 mcg PM)", frequency: "2x daily", timing: "With BPC-157 doses",
            route: "SubQ or oral",
            why: "500 mcg at the top of the dose range for acute inflammation. Splitting 2x daily maintains steady NF-κB suppression. Can be taken orally (good bioavailability) or SubQ. During the acute phase, inflammation is the biggest barrier to healing, so maximum dose here.",
          },
          {
            name: "GHK-Cu", type: "peptide", role: "Collagen priming",
            dose: "1 mg/day", frequency: "1x daily", timing: "Evening",
            route: "SubQ or topical at injury site",
            why: "1 mg starting dose primes collagen synthesis pathways early. Lower dose in Phase 1 because collagen remodelling is not yet the primary healing activity. Topical application directly over the injury site can complement SubQ.",
          },
        ],
        note: "Avoid NSAIDs (ibuprofen, naproxen) if possible. They inhibit prostaglandins essential for tissue repair. This stack handles inflammation through NF-κB suppression (KPV) and cytokine modulation (TB-500) instead.",
      },
      {
        name: "Phase 2: Remodelling",
        weeks: "Weeks 4-6",
        compounds: [
          {
            name: "BPC-157", type: "peptide", role: "Sustained repair",
            dose: "500 mcg/day (250 mcg AM + 250 mcg PM)", frequency: "2x daily", timing: "Morning + evening",
            route: "SubQ near injury site",
            why: "Maintain full 500 mcg dose through the remodelling phase. New blood vessels formed in Phase 1 are now maturing. Continued BPC-157 supports growth factor production as tissue transitions from repair to remodelling.",
          },
          {
            name: "TB-500", type: "peptide", role: "Tissue remodelling",
            dose: "2.5 mg, 2x per week", frequency: "2x weekly", timing: "Morning, on injection days",
            route: "SubQ",
            why: "Maintain loading dose. TB-500's actin polymerisation support is critical during remodelling, helping cells organise into functional tissue structures rather than disorganised scar tissue.",
          },
          {
            name: "KPV", type: "peptide", role: "Sustained anti-inflammatory",
            dose: "300 mcg/day (single dose)", frequency: "1x daily", timing: "Morning",
            route: "SubQ or oral",
            why: "Reduced from 500 mcg to 300 mcg as acute inflammation subsides. Single morning dose is sufficient for maintenance suppression of NF-κB. Prevents residual inflammation from disrupting collagen organisation.",
          },
          {
            name: "GHK-Cu", type: "peptide", role: "Active collagen remodelling",
            dose: "2 mg/day (1 mg AM + 1 mg PM)", frequency: "2x daily", timing: "Morning + evening",
            route: "SubQ or topical at injury site",
            why: "Dose doubled to 2 mg and split 2x daily. Collagen remodelling peaks at weeks 3-6. GHK-Cu activates metalloproteinases (MMPs) to clear damaged extracellular matrix and stimulates collagen I/III synthesis. This is the most important phase for GHK-Cu.",
          },
        ],
        note: "This is the peak phase for collagen remodelling. GHK-Cu dose increases and splits to 2x daily for sustained MMP activation. KPV steps down as inflammation resolves.",
      },
      {
        name: "Phase 3: Strengthening",
        weeks: "Weeks 7-8",
        compounds: [
          {
            name: "BPC-157", type: "peptide", role: "Maintenance repair",
            dose: "250 mcg/day (single morning dose)", frequency: "1x daily", timing: "Morning",
            route: "SubQ",
            why: "Tapered to 250 mcg single dose. By week 7 the primary repair cascade is complete. Maintenance dose supports final tissue maturation without overstimulating growth factor pathways.",
          },
          {
            name: "TB-500", type: "peptide", role: "Final systemic support",
            dose: "2.5 mg, 1x per week", frequency: "1x weekly", timing: "Morning",
            route: "SubQ",
            why: "Reduced to once weekly maintenance. Continued cell migration support during final tissue maturation. Moving to 1x weekly at this stage is sufficient as the major healing work is done.",
          },
          {
            name: "KPV", type: "peptide", role: "Residual inflammation control",
            dose: "200 mcg/day", frequency: "1x daily", timing: "Morning",
            route: "SubQ or oral",
            why: "Minimum effective dose. Low-grade inflammation can persist for weeks after visible healing. KPV at 200 mcg ensures complete inflammatory resolution for optimal final tissue quality.",
          },
          {
            name: "GHK-Cu", type: "peptide", role: "Final collagen maturation",
            dose: "1 mg/day", frequency: "1x daily", timing: "Evening",
            route: "SubQ or topical",
            why: "Back to 1 mg maintenance. Full structural integrity takes 8-12 weeks. GHK-Cu at this dose continues supporting collagen cross-linking and maturation without the aggressive remodelling of Phase 2.",
          },
        ],
        note: "Tapering phase. BPC-157 and TB-500 step down as major repair completes. KPV and GHK-Cu at maintenance doses ensure clean resolution. If healing is ahead of schedule by week 6, BPC-157 can move to every other day.",
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
  // Collect all compounds from phases + supplements
  const allPhaseCompounds = Array.from(
    new Set(stack.phases.flatMap((p) => p.compounds.map((c) => c.name)))
  );
  const suppNames = stack.supplements.map((s) => s.name);
  // Build a lookup for supplement dose/frequency
  const suppLookup = Object.fromEntries(stack.supplements.map((s) => [s.name, s]));

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 px-2.5 font-heading font-bold text-foreground text-[11px] w-28 border-b border-border">Compound</th>
            <th className="text-center py-2 px-1.5 font-heading font-bold text-[10px] text-muted-foreground border-b border-border whitespace-nowrap">Route</th>
            {stack.phases.map((p) => (
              <th key={p.name} className="text-center py-2 px-1.5 border-b border-border">
                <span className="font-heading font-bold text-[10px] text-foreground block">{p.name.replace(/Phase \d: /, "")}</span>
                <span className="text-[9px] text-muted-foreground">{p.weeks}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Peptide rows */}
          <tr>
            <td colSpan={2 + stack.phases.length} className="pt-2 pb-1 px-2.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Peptides</span>
            </td>
          </tr>
          {allPhaseCompounds.map((name) => {
            const firstInstance = stack.phases.flatMap((p) => p.compounds).find((c) => c.name === name);
            return (
              <tr key={name} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                <td className="py-2 px-2.5">
                  <span className="font-heading font-semibold text-foreground text-[11px]">{name}</span>
                </td>
                <td className="py-2 px-1.5 text-center">
                  <span className="text-[10px] text-muted-foreground">{firstInstance?.route.split(" ")[0] || "SubQ"}</span>
                </td>
                {stack.phases.map((phase) => {
                  const c = phase.compounds.find((x) => x.name === name);
                  return (
                    <td key={phase.name} className="py-2 px-1.5 text-center">
                      {c ? (
                        <div>
                          <span className="block font-semibold text-foreground text-[11px] leading-tight">{c.dose.split("(")[0].trim()}</span>
                          <span className="block text-[9px] text-muted-foreground leading-tight mt-0.5">{c.frequency}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/25">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {/* Supplement rows */}
          <tr>
            <td colSpan={2 + stack.phases.length} className="pt-3 pb-1 px-2.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-warm">Support Supplements</span>
            </td>
          </tr>
          {suppNames.map((name) => {
            const s = suppLookup[name];
            return (
              <tr key={name} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                <td className="py-2 px-2.5">
                  <span className="font-heading font-semibold text-foreground text-[11px]">{name}</span>
                </td>
                <td className="py-2 px-1.5 text-center">
                  <span className="text-[10px] text-muted-foreground">{s.route.split(" ")[0]}</span>
                </td>
                {stack.phases.map((phase) => (
                  <td key={phase.name} className="py-2 px-1.5 text-center">
                    <div>
                      <span className="block font-semibold text-foreground text-[11px] leading-tight">{s.dose}</span>
                      <span className="block text-[9px] text-muted-foreground leading-tight mt-0.5">{s.frequency}</span>
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
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
