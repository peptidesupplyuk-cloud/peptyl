import { useMemo } from "react";
import { useAllInjections } from "@/hooks/use-injections";
import { startOfDay, subDays, isSameDay } from "date-fns";
import { CheckCircle2, XCircle, SkipForward, TrendingUp } from "lucide-react";

const AdherenceSummary = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { data: injections = [], isLoading } = useAllInjections();

  const stats = useMemo(() => {
    if (injections.length === 0) return null;

    const completed = injections.filter((i) => i.status === "completed").length;
    const skipped = injections.filter((i) => i.status === "skipped").length;
    const missed = injections.filter((i) => i.status !== "scheduled" ? false : new Date(i.scheduled_time) < new Date()).length;
    const total = completed + skipped + missed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    let streak = 0;
    const today = startOfDay(new Date());
    for (let d = 0; d < 365; d++) {
      const day = subDays(today, d);
      const dayInj = injections.filter((i) => isSameDay(new Date(i.scheduled_time), day));
      if (dayInj.length === 0) continue;
      if (dayInj.every((i) => i.status === "completed")) streak++;
      else break;
    }

    return { completed, skipped, missed, rate, streak };
  }, [injections]);

  if (isLoading || !stats || (stats.completed + stats.missed + stats.skipped) === 0) return null;

  const tiles = [
    { icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />, label: "Completed", value: stats.completed },
    { icon: <XCircle className="h-3.5 w-3.5 text-red-500" />, label: "Missed", value: stats.missed },
    { icon: <SkipForward className="h-3.5 w-3.5 text-muted-foreground" />, label: "Skipped", value: stats.skipped },
    { icon: <TrendingUp className="h-3.5 w-3.5 text-primary" />, label: "Adherence", value: `${stats.rate}%` },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-foreground text-sm">📊 Adherence Snapshot</h2>
        {onNavigate && (
          <button onClick={onNavigate} className="text-xs text-primary font-medium hover:underline">
            View full →
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {tiles.map((t) => (
          <div key={t.label} className="bg-card rounded-xl border border-border px-3 py-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              {t.icon}
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.label}</span>
            </div>
            <p className="text-lg font-heading font-bold text-foreground">{t.value}</p>
          </div>
        ))}
      </div>
      {stats.streak > 0 && (
        <div className="bg-card rounded-xl border border-border px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-base">🔥</span>
          </div>
          <div>
            <p className="text-lg font-heading font-bold text-foreground leading-tight">{stats.streak}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdherenceSummary;
