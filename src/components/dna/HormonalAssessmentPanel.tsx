import { Activity, FlaskConical, Eye, TestTube } from "lucide-react";

interface HormonalAssessment {
  triggered: boolean;
  sex?: string;
  age?: number;
  testosterone_value?: number;
  testosterone_unit?: string;
  testosterone_status?: "optimal" | "suboptimal" | "action_required" | "not_provided";
  testosterone_range_note?: string;
  summary?: string;
  optimisation_recommendations?: string[];
  watch_for?: string;
  bloodwork_to_add?: string[];
  peptide_consideration?: string;
}

interface Props {
  hormonal: HormonalAssessment | undefined;
}

const statusStyle: Record<string, { bg: string; text: string; badge: string; label: string }> = {
  optimal: {
    bg: "bg-primary/5 border-primary/20",
    text: "text-primary",
    badge: "bg-primary/10 text-primary",
    label: "Optimal",
  },
  suboptimal: {
    bg: "bg-amber-500/5 border-amber-500/20",
    text: "text-amber-500",
    badge: "bg-amber-500/10 text-amber-600",
    label: "Suboptimal",
  },
  action_required: {
    bg: "bg-red-500/5 border-red-500/20",
    text: "text-red-500",
    badge: "bg-red-500/10 text-red-500",
    label: "Action Required",
  },
  not_provided: {
    bg: "bg-muted/50 border-border",
    text: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
    label: "Not Tested",
  },
};

const HormonalAssessmentPanel = ({ hormonal }: Props) => {
  if (!hormonal || !hormonal.triggered) return null;

  const status = hormonal.testosterone_status ?? "not_provided";
  const style = statusStyle[status] ?? statusStyle.not_provided;

  return (
    <div className={`border rounded-2xl p-6 space-y-5 ${style.bg}`}>
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-foreground" />
          <h2 className="text-xl font-heading font-bold text-foreground">Hormonal Assessment</h2>
        </div>
        {hormonal.sex && hormonal.age && (
          <span className="text-xs text-muted-foreground">
            {hormonal.sex.charAt(0).toUpperCase() + hormonal.sex.slice(1)}, age {hormonal.age}
          </span>
        )}
      </div>

      {/* Testosterone value */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Testosterone</p>
          {hormonal.testosterone_value ? (
            <p className="text-3xl font-bold text-foreground">
              {hormonal.testosterone_value}
              <span className="text-base font-normal text-muted-foreground ml-1">{hormonal.testosterone_unit ?? "ng/dL"}</span>
            </p>
          ) : (
            <p className="text-lg font-semibold text-muted-foreground">Not tested</p>
          )}
          {hormonal.testosterone_range_note && (
            <p className="text-xs text-muted-foreground mt-1">{hormonal.testosterone_range_note}</p>
          )}
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${style.badge}`}>
          {style.label}
        </span>
      </div>

      {/* Summary */}
      {hormonal.summary && (
        <p className="text-sm text-foreground leading-relaxed">{hormonal.summary}</p>
      )}

      {/* Optimisation recommendations */}
      {hormonal.optimisation_recommendations && hormonal.optimisation_recommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Optimisation Recommendations
          </h3>
          <ul className="space-y-2">
            {hormonal.optimisation_recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${style.text.replace("text-", "bg-")}`} />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Watch for */}
      {hormonal.watch_for && (
        <div className="bg-background/60 border border-border rounded-xl p-4 flex items-start gap-3">
          <Eye className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Watch For</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{hormonal.watch_for}</p>
          </div>
        </div>
      )}

      {/* Bloodwork to add */}
      {hormonal.bloodwork_to_add && hormonal.bloodwork_to_add.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Recommended Bloodwork Additions
          </h3>
          <div className="flex flex-wrap gap-2">
            {hormonal.bloodwork_to_add.map((marker, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-background border border-border text-foreground">
                {marker}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Peptide consideration */}
      {hormonal.peptide_consideration && (
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
          <p className="text-xs font-semibold text-primary mb-1">Research Consideration</p>
          <p className="text-xs text-foreground leading-relaxed">{hormonal.peptide_consideration}</p>
        </div>
      )}
    </div>
  );
};

export default HormonalAssessmentPanel;
