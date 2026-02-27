import { useMemo, useState } from "react";
import { useAllInjections, useUpdateInjectionStatus } from "@/hooks/use-injections";
import { useProtocols } from "@/hooks/use-protocols";
import { format, subDays, isSameDay, startOfDay } from "date-fns";
import { toast } from "sonner";
import { CalendarDays, TrendingUp, TrendingDown, CheckCircle2, XCircle, SkipForward, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = ["completed", "skipped", "missed"] as const;

const AdherenceTracker = () => {
  const { data: injections = [], isLoading } = useAllInjections();
  const { data: protocols = [] } = useProtocols();
  const updateStatus = useUpdateInjectionStatus();
  const [logPage, setLogPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const LOG_PAGE_SIZE = 15;

  const activeProtocol = protocols.find((p) => p.status === "active");
  const protocolStart = activeProtocol?.start_date
    ? startOfDay(new Date(activeProtocol.start_date))
    : null;

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatus.mutate({ id, status: newStatus }, {
      onSuccess: () => {
        toast.success("Status updated");
        setEditingId(null);
      },
      onError: () => toast.error("Failed to update status"),
    });
  };

  // === Stats ===
  const stats = useMemo(() => {
    if (injections.length === 0) return null;

    // Filter to current protocol if available
    const scoped = protocolStart
      ? injections.filter((i) => new Date(i.scheduled_time) >= protocolStart)
      : injections;

    const completed = scoped.filter((i) => i.status === "completed").length;
    const skipped = scoped.filter((i) => i.status === "skipped").length;
    const missed = scoped.filter((i) =>
      i.status === "scheduled" && new Date(i.scheduled_time) < new Date()
    ).length;
    const total = completed + skipped + missed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Streak (scoped to current protocol)
    let streak = 0;
    const today = startOfDay(new Date());
    for (let d = 0; d < 365; d++) {
      const day = subDays(today, d);
      if (protocolStart && day < protocolStart) break;
      const dayInj = scoped.filter((i) => isSameDay(new Date(i.scheduled_time), day));
      if (dayInj.length === 0) continue;
      const allDone = dayInj.every((i) => i.status === "completed");
      if (allDone) streak++;
      else break;
    }

    // Per peptide
    const byPeptide: Record<string, { completed: number; total: number }> = {};
    for (const inj of injections) {
      const isPast = new Date(inj.scheduled_time) < new Date();
      if (!isPast && inj.status === "scheduled") continue;
      if (!byPeptide[inj.peptide_name]) byPeptide[inj.peptide_name] = { completed: 0, total: 0 };
      byPeptide[inj.peptide_name].total++;
      if (inj.status === "completed") byPeptide[inj.peptide_name].completed++;
    }

    return { completed, skipped, missed, total, rate, streak, byPeptide };
  }, [injections, protocolStart]);

  // === Heatmap (last 90 days) ===
  const heatmapData = useMemo(() => {
    const today = startOfDay(new Date());
    const days: Array<{ date: Date; status: "full" | "partial" | "missed" | "none" }> = [];
    for (let d = 89; d >= 0; d--) {
      const day = subDays(today, d);
      const dayInj = injections.filter((i) => isSameDay(new Date(i.scheduled_time), day));
      if (dayInj.length === 0) {
        days.push({ date: day, status: "none" });
      } else {
        const allDone = dayInj.every((i) => i.status === "completed");
        const anyDone = dayInj.some((i) => i.status === "completed");
        days.push({ date: day, status: allDone ? "full" : anyDone ? "partial" : "missed" });
      }
    }
    return days;
  }, [injections]);

  // === Detailed log (paginated) ===
  const pastInjections = useMemo(() => {
    return injections
      .filter((i) => i.status !== "scheduled" || new Date(i.scheduled_time) < new Date())
      .sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());
  }, [injections]);

  const logPageCount = Math.ceil(pastInjections.length / LOG_PAGE_SIZE);
  const pagedLog = pastInjections.slice(logPage * LOG_PAGE_SIZE, (logPage + 1) * LOG_PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-40 bg-muted rounded" />
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <CalendarDays className="h-10 w-10 text-primary mx-auto mb-3" />
        <h3 className="font-heading font-semibold text-foreground mb-1">No Tracking Data Yet</h3>
        <p className="text-sm text-muted-foreground">
          Complete protocol doses to start building your adherence history.
        </p>
      </div>
    );
  }

  const statusColor = (s: string) => {
    switch (s) {
      case "full": return "bg-green-500";
      case "partial": return "bg-yellow-500";
      case "missed": return "bg-red-500/70";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} label="Completed" value={stats.completed} />
        <StatCard icon={<XCircle className="h-4 w-4 text-red-500" />} label="Missed" value={stats.missed} />
        <StatCard icon={<SkipForward className="h-4 w-4 text-muted-foreground" />} label="Skipped" value={stats.skipped} />
        <StatCard icon={<TrendingUp className="h-4 w-4 text-primary" />} label="Adherence" value={`${stats.rate}%`} />
      </div>

      {/* Streak */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-xl">🔥</span>
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-foreground">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <h3 className="font-heading font-semibold text-foreground text-sm flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" /> 90-Day Adherence
        </h3>
        <div className="flex flex-wrap gap-[3px]">
          {heatmapData.map((day, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${statusColor(day.status)}`}
              title={`${format(day.date, "MMM d")}: ${day.status === "none" ? "No doses" : day.status}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> All done</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-500 inline-block" /> Partial</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/70 inline-block" /> Missed</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-muted inline-block" /> No dose</span>
        </div>
      </div>

      {/* Per-peptide breakdown */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <h3 className="font-heading font-semibold text-foreground text-sm flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-primary" /> Per-Peptide Adherence
        </h3>
        <div className="space-y-2">
          {Object.entries(stats.byPeptide).map(([name, data]) => {
            const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
            return (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground min-w-[120px] truncate">{name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Log */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <h3 className="font-heading font-semibold text-foreground text-sm">Dose Log</h3>
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_80px_70px_60px] text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pb-1 border-b border-border">
            <span>Peptide</span>
            <span>Dose</span>
            <span>Date</span>
            <span className="text-right">Status</span>
          </div>
          {pagedLog.map((inj) => (
            <div key={inj.id} className="grid grid-cols-[1fr_80px_70px_72px] text-xs py-1.5 border-b border-border/50 last:border-0">
              <span className="text-foreground font-medium truncate">{inj.peptide_name}</span>
              <span className="text-muted-foreground">{inj.dose_mcg}mcg</span>
              <span className="text-muted-foreground">{format(new Date(inj.scheduled_time), "MMM d")}</span>
              <div className="text-right">
                {editingId === inj.id ? (
                  <div className="flex flex-col gap-0.5 items-end">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(inj.id, s)}
                        className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                          inj.status === s
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }`}
                      >
                        {s === "completed" ? "✓ Done" : s === "skipped" ? "Skip" : "Missed"}
                      </button>
                    ))}
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-[9px] text-muted-foreground hover:text-foreground"
                    >
                      cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingId(inj.id)}
                    className={`font-medium cursor-pointer hover:underline ${
                      inj.status === "completed" ? "text-green-500" :
                      inj.status === "skipped" ? "text-muted-foreground" :
                      "text-red-500"
                    }`}
                    title="Click to change status"
                  >
                    {inj.status === "completed" ? "✓" : inj.status === "skipped" ? "Skip" : "Missed"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {logPageCount > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setLogPage((p) => Math.max(0, p - 1))} disabled={logPage === 0}>
              <ChevronLeft className="h-3 w-3 mr-1" /> Prev
            </Button>
            <span className="text-[10px] text-muted-foreground">{logPage + 1} / {logPageCount}</span>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setLogPage((p) => Math.min(logPageCount - 1, p + 1))} disabled={logPage >= logPageCount - 1}>
              Next <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="bg-card rounded-xl border border-border p-4">
    <div className="flex items-center gap-2 mb-1">{icon}<span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span></div>
    <p className="text-xl font-heading font-bold text-foreground">{value}</p>
  </div>
);

export default AdherenceTracker;
