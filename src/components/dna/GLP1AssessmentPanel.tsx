import { MessageSquare, Info, Stethoscope } from "lucide-react";

interface GLP1Assessment {
  triggered: boolean;
  trigger_reasons?: string[];
  genetic_response_prediction?: {
    predicted_response: string;
    confidence: string;
    basis: string;
  };
  compounds_to_consider?: Array<{
    compound: string;
    route?: string;
    indication?: string;
    evidence_grade?: string;
    genetic_relevance?: string;
    note?: string;
  }>;
  gp_talking_points?: string[];
  important_disclaimer?: string;
  pharmacogenomic_note?: string;
}

interface Props {
  glp1: GLP1Assessment | undefined;
}

const gradeStyle: Record<string, string> = {
  A: "bg-primary/10 text-primary",
  B: "bg-blue-500/10 text-blue-500",
  C: "bg-amber-500/10 text-amber-600",
  D: "bg-red-500/10 text-red-500",
};

const GLP1AssessmentPanel = ({ glp1 }: Props) => {
  if (!glp1 || !glp1.triggered) return null;

  return (
    // Soft neutral — not alarming blue
    <div className="bg-muted/30 border border-border rounded-2xl p-6 space-y-5">

      {/* Header — framed as GP conversation, not clinical alert */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-foreground" />
          <h2 className="text-xl font-heading font-bold text-foreground">GP Discussion — Metabolic</h2>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
          Prescription only
        </span>
      </div>

      {/* Short contextual intro — not a warning */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        Based on your metabolic signals, GLP-1 receptor agonists are worth raising with your GP.
        These are prescription medications — this section gives you the context to have that conversation.
      </p>

      {/* Trigger signals — compact chips, not a scary list */}
      {glp1.trigger_reasons && glp1.trigger_reasons.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Signals detected</p>
          <div className="flex flex-wrap gap-2">
            {glp1.trigger_reasons.map((r, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-background border border-border text-foreground">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Compounds — named clearly, framed positively */}
      {glp1.compounds_to_consider && glp1.compounds_to_consider.filter(c => c.compound).length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Compounds to ask about</p>
          <div className="space-y-3">
            {glp1.compounds_to_consider.filter(c => c.compound).map((c, i) => (
              <div key={i} className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <span className="font-semibold text-foreground text-sm">{c.compound}</span>
                  {c.evidence_grade && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${gradeStyle[c.evidence_grade] ?? gradeStyle.A}`}>
                      Grade {c.evidence_grade}
                    </span>
                  )}
                </div>
                {c.indication && <p className="text-xs text-muted-foreground">{c.indication}</p>}
                {c.genetic_relevance && <p className="text-xs italic text-foreground/70 mt-1">{c.genetic_relevance}</p>}
                {c.note && <p className="text-xs text-muted-foreground mt-1 border-t border-border pt-2">{c.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GP talking points — practical, empowering */}
      {glp1.gp_talking_points && glp1.gp_talking_points.length > 0 && (
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Questions to ask your GP</p>
          </div>
          <ul className="space-y-2">
            {glp1.gp_talking_points.map((point, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-muted-foreground mt-0.5 shrink-0">→</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pharmacogenomic note if present */}
      {glp1.pharmacogenomic_note && (
        <p className="text-xs text-muted-foreground italic">{glp1.pharmacogenomic_note}</p>
      )}

      {/* Single small disclaimer — not a wall of warnings */}
      <div className="flex items-start gap-2 pt-1">
        <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          GLP-1 agonists are prescription-only. Only a physician can assess suitability and prescribe.
        </p>
      </div>
    </div>
  );
};

export default GLP1AssessmentPanel;
