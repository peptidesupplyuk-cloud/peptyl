import { Zap, Clock, Calendar, Stethoscope, MessageSquare, CheckCircle2 } from "lucide-react";

interface Props {
  plan?: {
    immediate?: string[];
    "30_days"?: string[];
    "90_days"?: string[];
    gp_conversations?: string[];
  };
}

const columns = [
  {
    key: "immediate",
    label: "Immediate",
    sublabel: "Start today",
    icon: Zap,
    accent: "border-primary/30 bg-primary/5",
    iconColor: "text-primary",
    dotColor: "text-primary",
  },
  {
    key: "30_days",
    label: "30 Days",
    sublabel: "First month targets",
    icon: Clock,
    accent: "border-blue-500/30 bg-blue-500/5",
    iconColor: "text-blue-500",
    dotColor: "text-blue-500",
  },
  {
    key: "90_days",
    label: "90 Days",
    sublabel: "Quarterly milestones",
    icon: Calendar,
    accent: "border-purple-500/30 bg-purple-500/5",
    iconColor: "text-purple-500",
    dotColor: "text-purple-500",
  },
  {
    key: "gp_conversations",
    label: "GP Conversations",
    sublabel: "Discuss with your doctor",
    icon: Stethoscope,
    accent: "border-amber-500/30 bg-amber-500/5",
    iconColor: "text-amber-500",
    dotColor: "text-amber-500",
  },
] as const;

// Strip verbose explanations — keep only the action (before " — ")
const tightenItem = (s: string): string => {
  const dash = s.indexOf(" — ");
  if (dash > 10 && dash < 80) return s.slice(0, dash).trim();
  if (s.length > 80) return s.slice(0, 80).trim() + "…";
  return s;
};

const ActionPlan = ({ plan }: Props) => {
  if (!plan) return null;

  const activeColumns = columns.filter((col) => {
    const items = (plan as any)[col.key];
    return items && items.length > 0;
  });

  if (activeColumns.length === 0) return null;

  const gridCols =
    activeColumns.length <= 2 ? "md:grid-cols-2" :
    activeColumns.length === 3 ? "md:grid-cols-3" :
    "md:grid-cols-4";

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-6">Action Plan</h2>

      {/* Timeline connector — desktop only */}
      <div className="hidden md:flex items-center mb-4 px-8">
        {activeColumns.map((col, i) => (
          <div key={col.key} className="flex items-center flex-1">
            <div className={`h-2.5 w-2.5 rounded-full ${col.iconColor.replace("text-", "bg-")}`} />
            {i < activeColumns.length - 1 && (
              <div className="flex-1 h-px border-t border-dashed border-border mx-1" />
            )}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
        {activeColumns.map((col) => {
          const items: string[] = (plan as any)[col.key] || [];
          const Icon = col.icon;
          const isGP = col.key === "gp_conversations";

          return (
            <div key={col.key} className={`border rounded-2xl p-5 flex flex-col gap-4 ${col.accent}`}>
              {/* Column header */}
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-background/60 ${col.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-heading font-bold text-foreground text-sm">{col.label}</p>
                  <p className="text-xs text-muted-foreground">{col.sublabel}</p>
                </div>
              </div>

              {/* Items — short, action-first */}
              <ul className="space-y-2.5 flex-1">
                {items.map((item, i) => {
                  const short = tightenItem(item);
                  return (
                    <li key={i} className="flex items-start gap-2">
                      {isGP ? (
                        <>
                          <MessageSquare className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${col.iconColor}`} />
                          <span className="text-sm text-foreground italic leading-snug">{short}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${col.iconColor}`} />
                          <span className="text-sm text-foreground leading-snug">{short}</span>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionPlan;
