import { Dumbbell, RefreshCw, XCircle } from "lucide-react";

interface ActivityEntry {
  activity?: string;
  duration?: string;
  reason?: string;
  driven_by?: string;
}

interface TrainingData {
  approach?: string;
  rationale?: string;
  personalization?: string;
  weekly_structure?: Array<string | ActivityEntry>;
  recovery_protocol?: string | string[];
  avoid?: string[];
}

interface Props {
  data?: TrainingData;
}

const normaliseActivity = (item: string | ActivityEntry): ActivityEntry => {
  if (typeof item === "string") return { activity: item };
  if (item && typeof item === "object") return item;
  return { activity: String(item ?? "") };
};

const toArray = (val: string | string[] | undefined): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return [val];
};

const TrainingRecommendations = ({ data }: Props) => {
  if (!data) return null;
  const recoveryItems = toArray(data.recovery_protocol);
  const hasContent =
    (Array.isArray(data.weekly_structure) && data.weekly_structure.length > 0) ||
    recoveryItems.length > 0 ||
    (Array.isArray(data.avoid) && data.avoid.length > 0);
  if (!hasContent) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
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

      {data.rationale && (
        <div className="bg-muted/40 rounded-xl px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed">{data.rationale}</p>
        </div>
      )}

      {Array.isArray(data.weekly_structure) && data.weekly_structure.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-heading font-semibold text-foreground">Weekly Structure</span>
          </div>
          <div className="space-y-2">
            {data.weekly_structure.map((raw, i) => {
              const item = normaliseActivity(raw);
              return (
                <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-xl px-4 py-3">
                  <span className="text-blue-500 font-bold font-heading text-sm shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {item.activity ?? "Activity"}
                      </p>
                      {item.duration && (
                        <span className="text-xs text-muted-foreground shrink-0">{item.duration}</span>
                      )}
                    </div>
                    {item.reason && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.reason}</p>
                    )}
                    {item.driven_by && (
                      <p className="text-[10px] text-muted-foreground/80 font-mono">{item.driven_by}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {recoveryItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="text-sm font-heading font-semibold text-foreground">Recovery</span>
            </div>
            <ul className="space-y-2.5">
              {recoveryItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="text-primary shrink-0 mt-1.5 text-[8px]">●</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(data.avoid) && data.avoid.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-heading font-semibold text-foreground">Avoid</span>
            </div>
            <ul className="space-y-2.5">
              {data.avoid.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="text-destructive shrink-0 mt-1.5 text-[8px]">●</span>
                  <span className="leading-relaxed">{typeof item === "string" ? item : JSON.stringify(item)}</span>
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
