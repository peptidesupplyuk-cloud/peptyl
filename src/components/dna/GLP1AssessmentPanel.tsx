import { MessageSquare, Info } from "lucide-react";

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

const responseStyle: Record<string, string> = {
  Standard: "bg-muted text-muted-foreground",
  Reduced: "bg-amber-500/10 text-amber-600",
  Enhanced: "bg-primary/10 text-primary",
};

const gradeStyle: Record<string, string> = {
  A: "bg-primary/10 text-primary",
  B: "bg-blue-500/10 text-blue-500",
  C: "bg-amber-500/10 text-amber-600",
  D: "bg-red-500/10 text-red-500",
};

const GLP1AssessmentPanel = ({ glp1 }: Props) => {
  if (!glp1 || !glp1.triggered) return null;

  return (
    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold text-foreground">Metabolic & Weight Assessment</h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500">
          Clinical
        </span>
      </div>

      {/* Trigger reasons */}
      {glp1.trigger_reasons && glp1.trigger_reasons.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Signals detected</h3>
          <ul className="space-y-1">
            {glp1.trigger_reasons.map((r, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-blue-500 mt-1">&#8226;</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Response prediction */}
      {glp1.genetic_response_prediction && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${responseStyle[glp1.genetic_response_prediction.predicted_response] || responseStyle.Standard}`}>
            {glp1.genetic_response_prediction.predicted_response} Response
          </span>
          <span className="text-xs text-muted-foreground">
            Confidence: {glp1.genetic_response_prediction.confidence}
          </span>
        </div>
      )}
      {glp1.genetic_response_prediction?.basis && (
        <p className="text-xs text-muted-foreground">{glp1.genetic_response_prediction.basis}</p>
      )}

      {/* Compounds */}
      {glp1.compounds_to_consider && glp1.compounds_to_consider.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Compounds worth discussing with your GP</h3>
          <div className="space-y-3">
            {glp1.compounds_to_consider.map((c, i) => (
              <div key={i} className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">{c.compound}</span>
                  {c.evidence_grade && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${gradeStyle[c.evidence_grade] || gradeStyle.A}`}>
                      Grade {c.evidence_grade}
                    </span>
                  )}
                </div>
                {c.indication && <p className="text-xs text-muted-foreground">{c.indication}</p>}
                {c.genetic_relevance && <p className="text-xs italic text-foreground/80 mt-1">{c.genetic_relevance}</p>}
                {c.note && <p className="text-xs text-muted-foreground mt-1">{c.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GP Talking Points */}
      {glp1.gp_talking_points && glp1.gp_talking_points.length > 0 && (
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Questions to ask your GP</h3>
          </div>
          <ul className="space-y-2">
            {glp1.gp_talking_points.map((point, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">💬</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pharmacogenomic note */}
      {glp1.pharmacogenomic_note && (
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
          <p className="text-xs italic text-foreground/80">{glp1.pharmacogenomic_note}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
        <div>
          {glp1.important_disclaimer && (
            <p className="text-xs text-foreground mb-1">{glp1.important_disclaimer}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Peptyl does not prescribe or recommend medications. All clinical decisions must involve a qualified healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GLP1AssessmentPanel;
