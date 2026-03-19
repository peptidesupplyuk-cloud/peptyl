import { useMemo, useState } from "react";
import { useAllInjections, useUpdateInjectionStatus } from "@/hooks/use-injections";
import { useProtocols } from "@/hooks/use-protocols";
import { useAllSupplementLogs } from "@/hooks/use-supplement-logs";
import { format, isSameDay, startOfDay, startOfWeek, subDays } from "date-fns";
import { toast } from "sonner";
import { CalendarDays, TrendingUp, TrendingDown, CheckCircle2, XCircle, SkipForward, ChevronLeft, ChevronRight, Pill, FlaskConical, History } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = ["completed", "skipped", "missed"] as const;

type UnifiedLogEntry = {
  id: string;
  name: string;
  type: "peptide" | "supplement";
  dose: string;
  date: Date;
  status: string;
  sortTime: number;
  originalInjectionId?: string;
  protocolId?: string | null;
};

const AdherenceTracker = () => {
  const { data: injections = [], isLoading: injLoading } = useAllInjections();
  const { data: supplementLogs = [], isLoading: suppLoading } = useAllSupplementLogs();
  const { data: protocols = [] } = useProtocols();
  const updateStatus = useUpdateInjectionStatus();
  const [logPage, setLogPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "peptide" | "supplement">("all");
  const [showFullHistory, setShowFullHistory] = useState(false);
  const LOG_PAGE_SIZE = 15;
  const isLoading = injLoading || suppLoading;

  const activeProtocols = useMemo(() => protocols.filter((p) => p.status === "active"), [protocols]);
  const activeProtocolIds = useMemo(() => new Set(activeProtocols.map((p) => p.id)), [activeProtocols]);
  const activeProtocolPeptideNames = useMemo(() => {
    return new Set(
      activeProtocols.flatMap((protocol) => protocol.peptides?.map((pep) => pep.peptide_name) ?? [])
    );
  }, [activeProtocols]);
  const activeProtocolSupplementNames = useMemo(() => {
    return new Set(
      activeProtocols.flatMap((protocol) => protocol.supplements?.map((s) => s.name) ?? [])
    );
  }, [activeProtocols]);

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatus.mutate({ id, status: newStatus }, {
      onSuccess: () => {
        toast.success("Status updated");
        setEditingId(null);
      },
      onError: () => toast.error("Failed to update status"),
    });
  };

  // Merge injections + supplements into unified log
  const unifiedLog = useMemo((): UnifiedLogEntry[] => {
    const entries: UnifiedLogEntry[] = [];

    for (const inj of injections) {
      entries.push({
        id: `inj-${inj.id}`,
        name: inj.peptide_name,
        type: "peptide",
        dose: `${inj.dose_mcg}mcg`,
        date: new Date(inj.scheduled_time),
        status: inj.status === "completed" ? "completed" : inj.status === "skipped" ? "skipped" : "missed",
        sortTime: new Date(inj.scheduled_time).getTime(),
        originalInjectionId: inj.id,
      });
    }

    for (const log of supplementLogs) {
      entries.push({
        id: `sup-${log.id}`,
        name: log.item,
        type: "supplement",
        dose: log.dose_amount ? `${log.dose_amount}${log.dose_unit ?? ""}` : "—",
        date: new Date(log.date + "T12:00:00"),
        status: log.completed ? "completed" : "missed",
        sortTime: new Date(log.date + "T12:00:00").getTime(),
      });
    }

    return entries;
  }, [injections, supplementLogs]);

  const stats = useMemo(() => {
    if (unifiedLog.length === 0) return null;

    const now = new Date();
    const eligible = unifiedLog.filter((e) => e.date <= now);

    const completed = eligible.filter((e) => e.status === "completed").length;
    const skipped = eligible.filter((e) => e.status === "skipped").length;
    const missed = eligible.filter((e) => e.status === "missed").length;
    const total = completed + skipped + missed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeek = eligible.filter((e) => e.date >= weekStart);
    const weekCompleted = thisWeek.filter((e) => e.status === "completed").length;
    const weekTotal = thisWeek.length;
    const weekRate = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

    const byItem: Record<string, { completed: number; total: number; type: "peptide" | "supplement" }> = {};
    for (const e of eligible) {
      if (!byItem[e.name]) byItem[e.name] = { completed: 0, total: 0, type: e.type };
      byItem[e.name].total++;
      if (e.status === "completed") byItem[e.name].completed++;
    }

    const peptideCount = eligible.filter((e) => e.type === "peptide").length;
    const supplementCount = eligible.filter((e) => e.type === "supplement").length;

    return { completed, skipped, missed, total, rate, byItem, weekCompleted, weekTotal, weekRate, peptideCount, supplementCount };
  }, [unifiedLog]);

  const heatmapData = useMemo(() => {
    const today = startOfDay(new Date());
    const days: Array<{ date: Date; status: "full" | "partial" | "missed" | "none" }> = [];
    for (let d = 89; d >= 0; d--) {
      const day = subDays(today, d);
      const dayEntries = unifiedLog.filter((e) => isSameDay(e.date, day));
      if (dayEntries.length === 0) {
        days.push({ date: day, status: "none" });
      } else {
        const allDone = dayEntries.every((e) => e.status === "completed");
        const anyDone = dayEntries.some((e) => e.status === "completed");
        days.push({ date: day, status: allDone ? "full" : anyDone ? "partial" : "missed" });
      }
    }
    return days;
  }, [unifiedLog]);

  const filteredLog = useMemo(() => {
    const past = unifiedLog
      .filter((e) => e.status !== "scheduled" && e.date < new Date())
      .sort((a, b) => b.sortTime - a.sortTime);
    if (filter === "all") return past;
    return past.filter((e) => e.type === filter);
  }, [unifiedLog, filter]);

  const logPageCount = Math.ceil(filteredLog.length / LOG_PAGE_SIZE);
  const pagedLog = filteredLog.slice(logPage * LOG_PAGE_SIZE, (logPage + 1) * LOG_PAGE_SIZE);

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} label="Completed" value={stats.completed} />
        <StatCard icon={<XCircle className="h-4 w-4 text-red-500" />} label="Missed" value={stats.missed} />
        <StatCard icon={<SkipForward className="h-4 w-4 text-muted-foreground" />} label="Skipped" value={stats.skipped} />
        <StatCard icon={<TrendingUp className="h-4 w-4 text-primary" />} label="Adherence" value={`${stats.rate}%`} />
      </div>

      {/* Type breakdown */}
      <div className="flex gap-3">
        <div className="flex-1 bg-card rounded-xl border border-border p-3 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Peptide Doses</p>
            <p className="text-lg font-heading font-bold text-foreground">{stats.peptideCount}</p>
          </div>
        </div>
        <div className="flex-1 bg-card rounded-xl border border-border p-3 flex items-center gap-2">
          <Pill className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Supplement Logs</p>
            <p className="text-lg font-heading font-bold text-foreground">{stats.supplementCount}</p>
          </div>
        </div>
      </div>

      {stats.weekTotal > 0 && (
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">This Week</p>
            <p className="text-2xl font-heading font-bold text-foreground leading-tight">
              {stats.weekCompleted}/{stats.weekTotal}
            </p>
            <p className="text-xs text-muted-foreground">scheduled doses & supplements completed</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium bg-primary/10 text-primary rounded-full px-3 py-1.5">
            {stats.weekRate}% adherence
          </span>
        </div>
      )}

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

      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <h3 className="font-heading font-semibold text-foreground text-sm flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-primary" /> Per-Item Adherence
        </h3>
        <div className="space-y-2">
          {Object.entries(stats.byItem).map(([name, data]) => {
            const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
            return (
              <div key={name} className="flex items-center gap-3">
                {data.type === "peptide" ? (
                  <FlaskConical className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Pill className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                )}
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

      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-foreground text-sm">Dose & Supplement Log</h3>
          <div className="flex gap-1">
            {(["all", "peptide", "supplement"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setLogPage(0); }}
                className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : f === "peptide" ? "Peptides" : "Supplements"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <div className="grid grid-cols-[20px_1fr_80px_70px_60px] text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pb-1 border-b border-border">
            <span></span>
            <span>Item</span>
            <span>Dose</span>
            <span>Date</span>
            <span className="text-right">Status</span>
          </div>
          {pagedLog.map((entry) => (
            <div key={entry.id} className="grid grid-cols-[20px_1fr_80px_70px_72px] text-xs py-1.5 border-b border-border/50 last:border-0">
              <span className="flex items-center">
                {entry.type === "peptide" ? (
                  <FlaskConical className="h-3 w-3 text-primary/60" />
                ) : (
                  <Pill className="h-3 w-3 text-accent-foreground/60" />
                )}
              </span>
              <span className="text-foreground font-medium truncate">{entry.name}</span>
              <span className="text-muted-foreground">{entry.dose}</span>
              <span className="text-muted-foreground">{format(entry.date, "MMM d")}</span>
              <div className="text-right">
                {entry.type === "peptide" && editingId === entry.id ? (
                  <div className="flex flex-col gap-0.5 items-end">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(entry.originalInjectionId!, s)}
                        className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                          entry.status === s
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
                    onClick={() => entry.type === "peptide" && setEditingId(entry.id)}
                    className={`font-medium ${entry.type === "peptide" ? "cursor-pointer hover:underline" : "cursor-default"} ${
                      entry.status === "completed" ? "text-green-500" :
                      entry.status === "skipped" ? "text-muted-foreground" :
                      "text-red-500"
                    }`}
                    title={entry.type === "peptide" ? "Click to change status" : undefined}
                  >
                    {entry.status === "completed" ? "✓" : entry.status === "skipped" ? "Skip" : "Missed"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {pagedLog.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No entries for this filter.</p>
          )}
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
