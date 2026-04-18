import { toStringArray, toText } from "@/lib/dna-normalise";

interface Priority {
  priority?: unknown;
  timeline?: unknown;
  why?: unknown;
  actions?: unknown;
}

interface Props {
  priorities?: Priority[];
}

const timelineLabel = (t?: string): string => {
  if (!t) return "";
  return t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const timelineColor = (t?: string): string => {
  const l = t?.toLowerCase();
  if (l === "immediate" || l === "urgent") return "bg-destructive/10 text-destructive";
  if (l === "ongoing") return "bg-primary/10 text-primary";
  return "bg-muted text-muted-foreground";
};

const cleanText = (s: string): string =>
  s.replace(/\s*[—–]\s*/g, " - ");

const HealthPriorities = ({ priorities }: Props) => {
  if (!priorities?.length) return null;

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Health Priorities</h2>
      <div className="space-y-4">
        {priorities.map((p, i) => {
          const priorityText = toText(p?.priority);
          const timeline = toText(p?.timeline);
          const why = toText(p?.why);
          const actions = toStringArray(p?.actions);
          if (!priorityText && !why && !actions.length) return null;
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-foreground text-sm">{priorityText}</h3>
                  {timeline && (
                    <span className={`text-[10px] px-2 py-0.5 rounded mt-1 inline-block font-medium ${timelineColor(timeline)}`}>
                      {timelineLabel(timeline)}
                    </span>
                  )}
                </div>
              </div>
              {why && (
                <p className="text-xs text-muted-foreground mb-3">{cleanText(why)}</p>
              )}
              {actions.length > 0 && (
                <ul className="space-y-1.5">
                  {actions.map((a, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-foreground">
                      <span className="text-primary shrink-0 mt-1 text-[8px]">●</span>
                      <span>{cleanText(a)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthPriorities;
