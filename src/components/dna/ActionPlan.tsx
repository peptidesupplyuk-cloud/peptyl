import { Zap, Clock, Calendar } from "lucide-react";

interface Props {
  plan?: {
    immediate?: string[];
    "30_days"?: string[];
    "90_days"?: string[];
  };
}

const columns = [
  { key: "immediate", label: "Immediate", icon: Zap, accent: "border-primary/30 bg-primary/5" },
  { key: "30_days", label: "30 Days", icon: Clock, accent: "border-blue-500/30 bg-blue-500/5" },
  { key: "90_days", label: "90 Days", icon: Calendar, accent: "border-purple-500/30 bg-purple-500/5" },
] as const;

const ActionPlan = ({ plan }: Props) => {
  if (!plan) return null;

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Action Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((col) => {
          const items = plan[col.key] || [];
          if (!items.length) return null;
          return (
            <div key={col.key} className={`border rounded-xl p-4 ${col.accent}`}>
              <div className="flex items-center gap-2 mb-3">
                <col.icon className="h-4 w-4 text-foreground" />
                <span className="font-heading font-semibold text-foreground text-sm">{col.label}</span>
              </div>
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {item}
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
