import { Zap, Clock, Calendar, Stethoscope, MessageSquare } from "lucide-react";

interface Props {
  plan?: {
    immediate?: string[];
    "30_days"?: string[];
    "90_days"?: string[];
    gp_conversations?: string[];
  };
}

const columns = [
  { key: "immediate", label: "Immediate", icon: Zap, accent: "border-primary/30 bg-primary/5" },
  { key: "30_days", label: "30 Days", icon: Clock, accent: "border-blue-500/30 bg-blue-500/5" },
  { key: "90_days", label: "90 Days", icon: Calendar, accent: "border-purple-500/30 bg-purple-500/5" },
  { key: "gp_conversations", label: "GP Conversations", icon: Stethoscope, accent: "border-teal-500/30 bg-teal-500/5" },
] as const;

const ActionPlan = ({ plan }: Props) => {
  if (!plan) return null;

  const activeColumns = columns.filter((col) => {
    const items = (plan as any)[col.key];
    return items && items.length > 0;
  });

  if (activeColumns.length === 0) return null;

  const gridCols = activeColumns.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-4";

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Action Plan</h2>
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-3`}>
        {activeColumns.map((col) => {
          const items = (plan as any)[col.key] || [];
          return (
            <div
              key={col.key}
              className={`border rounded-xl p-4 flex flex-col ${col.accent}`}
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/40">
                <div className="h-7 w-7 rounded-lg bg-background/60 flex items-center justify-center shrink-0">
                  <col.icon className="h-3.5 w-3.5 text-foreground" />
                </div>
                <span className="font-heading font-semibold text-foreground text-sm">{col.label}</span>
              </div>
              <ul className="space-y-2.5 flex-1">
                {items.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                    {col.key === "gp_conversations" ? (
                      <>
                        <MessageSquare className="h-3.5 w-3.5 text-teal-400 mt-0.5 shrink-0" />
                        <span className="italic text-foreground/80">{item}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-primary mt-0.5 shrink-0">•</span>
                        <span>{item}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionPlan;
