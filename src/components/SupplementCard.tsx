import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, BookOpen, FlaskConical, Beaker } from "lucide-react";
import type { SupplementData } from "@/data/supplements";

interface Props {
  supplement: SupplementData;
  index: number;
}

const gradeLabel: Record<string, { text: string; className: string }> = {
  A: { text: "Grade A — Strong clinical evidence", className: "bg-primary/10 text-primary" },
  B: { text: "Grade B — Moderate evidence", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  C: { text: "Grade C — Preliminary evidence", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  D: { text: "Grade D — Theoretical / Anecdotal", className: "bg-muted text-muted-foreground" },
};

const SupplementCard = ({ supplement: s, index }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const grade = gradeLabel[s.evidenceGrade] ?? gradeLabel.D;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card rounded-2xl border border-border p-6 sm:p-8 hover:border-primary/20 transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 rounded-xl bg-accent">
          <s.icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-xl font-heading font-bold text-foreground">{s.name}</h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {s.category}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${grade.className}`}>
              {s.evidenceGrade}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">{s.fullName}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
        </div>
      </div>

      {/* Benefits */}
      {s.benefits.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {s.benefits.map((b) => (
            <span key={b} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-2.5 w-2.5" />
              {b}
            </span>
          ))}
        </div>
      )}

      {/* Quick details */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
          <Beaker className="h-3 w-3" /> {s.form}
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
          {s.doseRange}
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50">
          🕐 {s.timing}
        </span>
      </div>

      {/* Biomarker targets */}
      {s.biomarkerTargets && s.biomarkerTargets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {s.biomarkerTargets.map((bm) => (
            <span key={bm} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
              📊 {bm}
            </span>
          ))}
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? "Hide details" : "Show synergies, studies & notes"}
      </button>

      {/* Expanded */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 space-y-4"
        >
          {/* Evidence grade detail */}
          <div className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg ${grade.className}`}>
            <FlaskConical className="h-3.5 w-3.5" />
            {grade.text}
          </div>

          {/* Synergies */}
          {s.synergies && s.synergies.length > 0 && (
            <div>
              <h3 className="text-sm font-heading font-semibold text-foreground mb-2">Synergies</h3>
              <div className="flex flex-wrap gap-1.5">
                {s.synergies.map((syn) => (
                  <span key={syn} className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20">
                    ✦ {syn}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contraindications */}
          {s.contraindications && s.contraindications.length > 0 && (
            <div>
              <h3 className="text-sm font-heading font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-warm" /> Cautions
              </h3>
              <div className="space-y-1.5">
                {s.contraindications.map((c) => (
                  <p key={c} className="text-xs text-muted-foreground bg-warm/5 border border-warm/20 px-3 py-2 rounded-lg">
                    {c}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Key studies */}
          {s.keyStudies && s.keyStudies.length > 0 && (
            <div>
              <h3 className="text-sm font-heading font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Key Studies
              </h3>
              <div className="space-y-1.5">
                {s.keyStudies.map((st) => (
                  <p key={st} className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg italic">
                    {st}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {s.notes && (
            <p className="text-xs text-muted-foreground italic px-3">💡 {s.notes}</p>
          )}

          {/* Half-life */}
          {s.halfLife && (
            <p className="text-xs text-muted-foreground px-3">Half-life: {s.halfLife}</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SupplementCard;
