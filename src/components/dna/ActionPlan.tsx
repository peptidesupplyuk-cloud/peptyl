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
      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
        {activeColumns.map((col) => {
          const items = (plan as any)[col.key] || [];
          return (
            <div key={col.key} className={`border rounded-xl p-4 ${col.accent}`}>
              <div className="flex items-center gap-2 mb-3">
                <col.icon className="h-4 w-4 text-foreground" />
                <span className="font-heading font-semibold text-foreground text-sm">{col.label}</span>
              </div>
              <ul className="space-y-2">
                {items.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    {col.key === "gp_conversations" ? (
                      <>
                        <MessageSquare className="h-3.5 w-3.5 text-teal-500 mt-0.5 shrink-0" />
                        <span className="italic">{item}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-primary mt-1">&#8226;</span>
                        {item}
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
