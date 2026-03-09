import { Zap, Clock, Calendar, Stethoscope, MessageSquare, CheckCircle2, ArrowRight } from "lucide-react";

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
    icon: Zap,
    gradient: "from-primary/20 via-primary/5 to-transparent",
    iconBg: "bg-primary/20 text-primary",
    accentBar: "bg-primary",
    bulletColor: "text-primary",
    borderColor: "border-primary/20",
    glowColor: "shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.15),0_0_20px_-5px_hsl(var(--primary)/0.1)]",
  },
  {
    key: "30_days",
    label: "30 Days",
    icon: Clock,
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/20 text-blue-400",
    accentBar: "bg-blue-500",
    bulletColor: "text-blue-400",
    borderColor: "border-blue-500/20",
    glowColor: "shadow-[inset_0_1px_0_0_rgba(59,130,246,0.15),0_0_20px_-5px_rgba(59,130,246,0.1)]",
  },
  {
    key: "90_days",
    label: "90 Days",
    icon: Calendar,
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    iconBg: "bg-purple-500/20 text-purple-400",
    accentBar: "bg-purple-500",
    bulletColor: "text-purple-400",
    borderColor: "border-purple-500/20",
    glowColor: "shadow-[inset_0_1px_0_0_rgba(168,85,247,0.15),0_0_20px_-5px_rgba(168,85,247,0.1)]",
  },
  {
    key: "gp_conversations",
    label: "GP Conversations",
    icon: Stethoscope,
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/20 text-amber-400",
    accentBar: "bg-amber-500",
    bulletColor: "text-amber-400",
    borderColor: "border-amber-500/20",
    glowColor: "shadow-[inset_0_1px_0_0_rgba(245,158,11,0.15),0_0_20px_-5px_rgba(245,158,11,0.1)]",
  },
] as const;

const ActionPlan = ({ plan }: Props) => {
  if (!plan) return null;

  const activeColumns = columns.filter((col) => {
    const items = (plan as any)[col.key];
    return items && items.length > 0;
  });

  if (activeColumns.length === 0) return null;

  const gridCols =
    activeColumns.length <= 2
      ? "lg:grid-cols-2"
      : activeColumns.length === 3
      ? "lg:grid-cols-3"
      : "lg:grid-cols-4";

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-6">Action Plan</h2>

      {/* Desktop timeline connector */}
      <div className="hidden lg:block relative mb-6">
        <div className="flex items-center justify-between px-8">
          {activeColumns.map((col, i) => (
            <div key={col.key} className="flex items-center flex-1 last:flex-initial">
              <div className={`h-3 w-3 rounded-full ${col.accentBar} ring-4 ring-background shrink-0`} />
              {i < activeColumns.length - 1 && (
                <div className="flex-1 flex items-center mx-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/10" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground/40 -ml-0.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-4`}>
        {activeColumns.map((col) => {
          const items = (plan as any)[col.key] || [];
          return (
            <div
              key={col.key}
              className={`relative overflow-hidden rounded-2xl border ${col.borderColor} ${col.glowColor} bg-gradient-to-b ${col.gradient} backdrop-blur-sm flex flex-col`}
            >
              {/* Accent bar top */}
              <div className={`h-1 w-full ${col.accentBar} opacity-80`} />

              {/* Header */}
              <div className="px-5 pt-4 pb-3 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl ${col.iconBg} flex items-center justify-center shrink-0`}>
                  <col.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground text-sm tracking-wide">
                    {col.label}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {col.key === "immediate" && "Start today"}
                    {col.key === "30_days" && "First month targets"}
                    {col.key === "90_days" && "Quarterly milestones"}
                    {col.key === "gp_conversations" && "Discuss with your doctor"}
                  </p>
                </div>
              </div>

              <div className="h-px bg-border/40 mx-4" />

              {/* Items */}
              <ul className="px-5 py-4 space-y-3 flex-1">
                {items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 group">
                    {col.key === "gp_conversations" ? (
                      <>
                        <MessageSquare className={`h-4 w-4 ${col.bulletColor} mt-0.5 shrink-0 opacity-80`} />
                        <span className="text-[13px] text-foreground/80 italic leading-relaxed">{item}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className={`h-4 w-4 ${col.bulletColor} mt-0.5 shrink-0 opacity-70`} />
                        <span className="text-[13px] text-foreground/90 leading-relaxed">{item}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Mobile timeline - vertical left bar */}
      <style>{`
        @media (max-width: 639px) {
          /* On mobile single-column, add subtle left timeline */
        }
      `}</style>
    </div>
  );
};

export default ActionPlan;
