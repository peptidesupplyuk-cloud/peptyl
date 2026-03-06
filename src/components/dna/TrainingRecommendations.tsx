import { Dumbbell, RefreshCw, XCircle, Shield } from "lucide-react";

interface TrainingData {
  approach?: string;
  rationale?: string;
  weekly_structure?: string[];
  recovery_protocol?: string[];
  avoid?: string[];
}

interface Props {
  data?: TrainingData;
}

const TrainingRecommendations = ({ data }: Props) => {
  if (!data || (!data.weekly_structure?.length && !data.recovery_protocol?.length)) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <Dumbbell className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-heading font-bold text-foreground">Training Protocol</h2>
          {data.approach && (
            <span className="text-xs font-semibold text-blue-700 bg-blue-500/10 px-2.5 py-0.5 rounded-full mt-1 inline-block">
              {data.approach}
            </span>
          )}
        </div>
      </div>

      {/* Rationale */}
      {data.rationale && (
        <div className="bg-muted/40 rounded-xl px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed">{data.rationale}</p>
        </div>
      )}

      {/* Weekly structure */}
      {data.weekly_structure && data.weekly_structure.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-heading font-semibold text-foreground">Weekly Structure</span>
          </div>
          <div className="space-y-2">
            {data.weekly_structure.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-xl px-4 py-3">
                <span className="text-blue-500 font-bold font-heading text-sm shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-foreground leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recovery + Avoid side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {data.recovery_protocol && data.recovery_protocol.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="text-sm font-heading font-semibold text-foreground">Recovery</span>
            </div>
            <ul className="space-y-2.5">
              {data.recovery_protocol.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="text-primary shrink-0 mt-1.5 text-[8px]">●</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.avoid && data.avoid.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-heading font-semibold text-foreground">Avoid</span>
            </div>
            <ul className="space-y-2.5">
              {data.avoid.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="text-destructive shrink-0 mt-1.5 text-[8px]">●</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingRecommendations;