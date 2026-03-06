import { CheckCircle2, XCircle, Clock, Salad } from "lucide-react";

interface DietData {
  approach?: string;
  rationale?: string;
  key_foods?: string[];
  avoid?: string[];
  timing?: string;
}

interface Props {
  data?: DietData;
}

const DietRecommendations = ({ data }: Props) => {
  if (!data || (!data.key_foods?.length && !data.avoid?.length)) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
          <Salad className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-heading font-bold text-foreground">Diet Protocol</h2>
          {data.approach && (
            <span className="text-xs font-semibold text-green-700 bg-green-500/10 px-2.5 py-0.5 rounded-full mt-1 inline-block">
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

      {/* Prioritise + Avoid grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {data.key_foods && data.key_foods.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-heading font-semibold text-foreground">Prioritise</span>
            </div>
            <ul className="space-y-2.5">
              {data.key_foods.map((food, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="text-primary shrink-0 mt-1.5 text-[8px]">●</span>
                  <span className="leading-relaxed">{food}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.avoid && data.avoid.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-heading font-semibold text-foreground">Avoid / Limit</span>
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

      {/* Timing callout */}
      {data.timing && (
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
          <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground leading-relaxed">{data.timing}</p>
        </div>
      )}
    </div>
  );
};

export default DietRecommendations;