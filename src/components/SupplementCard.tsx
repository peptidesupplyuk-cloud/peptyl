import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, BookOpen, FlaskConical, Beaker, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { SupplementData } from "@/data/supplements";
import { toSlug } from "@/lib/seo-slug";

interface Props {
  supplement: SupplementData;
  index: number;
}

const gradeConfig: Record<string, { label: string; className: string }> = {
  A: { label: "A", className: "bg-primary/20 text-primary border border-primary/30" },
  B: { label: "B", className: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  C: { label: "C", className: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  D: { label: "D", className: "bg-muted text-muted-foreground border border-border" },
};

const SupplementCard = ({ supplement: s, index }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const grade = gradeConfig[s.evidenceGrade] ?? gradeConfig.D;

  return (
    <>
      {/* Compact row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg cursor-pointer hover:border-primary/20 transition-all group"
        style={{ minHeight: "65px" }}
      >
        <s.icon className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-foreground">{s.name}</span>
          <p className="text-[11px] text-muted-foreground truncate leading-tight">{s.fullName}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground hidden sm:inline-flex">
            {s.category}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${grade.className}`}>
            {grade.label}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-4 mr-0 border-l-2 border-primary/20 pl-4 pb-4 pt-2 space-y-3">
              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>

              {/* Benefits */}
              {s.benefits.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {s.benefits.map((b) => (
                    <span key={b} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {b}
                    </span>
                  ))}
                </div>
              )}

              {/* Dosing row */}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
                  <Beaker className="h-3 w-3" /> {s.form}
                </span>
                <span className="px-2 py-1 rounded-md bg-muted/50">{s.doseRange}</span>
                <span className="px-2 py-1 rounded-md bg-muted/50">🕐 {s.timing}</span>
              </div>

              {/* Biomarker targets */}
              {s.biomarkerTargets && s.biomarkerTargets.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {s.biomarkerTargets.map((bm, i) => {
                    if (typeof bm === "string") {
                      return (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                          📊 {bm}
                        </span>
                      );
                    }
                    const obj = bm as { biomarker?: string; notes?: string; direction?: string; threshold?: string };
                    return (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                        📊 {obj.biomarker ?? "Unknown"}{obj.direction ? ` — ${obj.direction}` : ""}{obj.threshold ? ` (${obj.threshold})` : ""}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Synergies */}
              {s.synergies && s.synergies.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Synergies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {s.synergies.map((syn) => (
                      <span key={syn} className="text-[11px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                        ✦ {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contraindications */}
              {s.contraindications && s.contraindications.length > 0 && (
                <div className="bg-warm/5 border border-warm/20 rounded-lg p-3 space-y-1">
                  <h4 className="text-xs font-semibold text-warm flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Cautions
                  </h4>
                  {s.contraindications.map((c) => (
                    <p key={c} className="text-[11px] text-muted-foreground">{c}</p>
                  ))}
                </div>
              )}

              {/* Key studies */}
              {s.keyStudies && s.keyStudies.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Key Studies
                  </h4>
                  {s.keyStudies.map((st) => (
                    <p key={st} className="text-[11px] text-muted-foreground italic leading-relaxed">{st}</p>
                  ))}
                </div>
              )}

              {/* Notes & half-life */}
              {s.notes && <p className="text-xs text-muted-foreground italic">💡 {s.notes}</p>}
              {s.halfLife && <p className="text-xs text-muted-foreground">Half-life: {s.halfLife}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupplementCard;
