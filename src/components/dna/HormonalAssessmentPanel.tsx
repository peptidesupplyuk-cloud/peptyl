import { Activity, AlertTriangle } from "lucide-react";

interface HormonalData {
  triggered?: boolean;
  trigger_reason?: string;
  testosterone_status?: {
    value: number | null;
    unit: string | null;
    status: string;
  };
  recommendations?: string[];
  genetic_signals?: string[];
  goal_relevance?: string;
}

interface Props {
  data?: HormonalData;
}

const HormonalAssessmentPanel = ({ data }: Props) => {
  if (!data?.triggered) return null;

  const tStatus = data.testosterone_status;
  const statusColor = tStatus?.status === "not_tested"
    ? "bg-yellow-500/10 text-yellow-600"
    : tStatus?.value && tStatus.value < 8
      ? "bg-destructive/10 text-destructive"
      : tStatus?.value && tStatus.value < 15
        ? "bg-yellow-500/10 text-yellow-600"
        : "bg-primary/10 text-primary";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
          <Activity className="h-5 w-5 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-heading font-bold text-foreground">Hormonal Assessment</h2>
          <span className="text-xs text-muted-foreground">{data.trigger_reason}</span>
        </div>
      </div>

      {/* Testosterone status */}
      {tStatus && (
        <div className="bg-muted/40 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Testosterone</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}>
              {tStatus.status === "not_tested"
                ? "Not Tested"
                : `${tStatus.value} ${tStatus.unit || "nmol/L"}`}
            </span>
          </div>
          {tStatus.status === "not_tested" && (
            <div className="flex items-start gap-2 mt-2">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                No testosterone data on file. Consider adding this to your next bloodwork panel.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div>
          <span className="text-sm font-heading font-semibold text-foreground mb-3 block">Recommendations</span>
          <ul className="space-y-2.5">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="text-orange-500 shrink-0 mt-1.5 text-[8px]">●</span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Genetic signals */}
      {data.genetic_signals && data.genetic_signals.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.genetic_signals.map((s, i) => (
            <span key={i} className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-md">{s}</span>
          ))}
        </div>
      )}

      {/* Goal relevance */}
      {data.goal_relevance && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
          <p className="text-xs text-foreground leading-relaxed">{data.goal_relevance}</p>
        </div>
      )}
    </div>
  );
};

export default HormonalAssessmentPanel;
