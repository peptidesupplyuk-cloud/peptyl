import { useMemo } from "react";
import { useAllInjections } from "@/hooks/use-injections";
import { useProtocols } from "@/hooks/use-protocols";
import { startOfWeek } from "date-fns";
import { CheckCircle2, XCircle, SkipForward, TrendingUp } from "lucide-react";

const AdherenceSummary = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { data: injections = [], isLoading } = useAllInjections();
  const { data: protocols = [] } = useProtocols();

  const protocolPeptideNames = useMemo(() => {
    return new Set(
      protocols.flatMap((protocol) => protocol.peptides?.map((pep) => pep.peptide_name) ?? [])
    );
  }, [protocols]);

  const stats = useMemo(() => {
    if (injections.length === 0) return null;

    const protocolInj = injections.filter(
      (i) => !!i.protocol_peptide_id || protocolPeptideNames.has(i.peptide_name)
    );
    if (protocolInj.length === 0) return null;

    const now = new Date();
    const completed = protocolInj.filter((i) => i.status === "completed").length;
    const skipped = protocolInj.filter((i) => i.status === "skipped").length;
    const missed = protocolInj.filter((i) => i.status === "scheduled" && new Date(i.scheduled_time) < now).length;
    const total = completed + skipped + missed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEligible = protocolInj.filter((i) => {
      const scheduledAt = new Date(i.scheduled_time);
      return scheduledAt >= weekStart && scheduledAt <= now;
    });
    const weekCompleted = weekEligible.filter((i) => i.status === "completed").length;

    return { completed, skipped, missed, rate, weekCompleted, weekTotal: weekEligible.length };
  }, [injections, protocolPeptideNames]);

  if (isLoading) return null;

  if (!stats) {
    return (
      <div className="bg-card rounded-xl border border-border px-4 py-3">
        <h2 className="font-heading font-semibold text-foreground text-sm">📊 Adherence Snapshot</h2>
        <p className="text-xs text-muted-foreground mt-1">Complete your first scheduled dose to unlock adherence stats.</p>
      </div>
    );
  }

  const tiles = [
    { icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />, label: "Completed", value: stats.completed },
    { icon: <XCircle className="h-3.5 w-3.5 text-destructive" />, label: "Missed", value: stats.missed },
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
      {stats.weekTotal > 0 && (
        <p className="text-xs text-muted-foreground px-1">
          This week: <span className="text-foreground font-medium">{stats.weekCompleted}/{stats.weekTotal}</span> doses completed.
        </p>
      )}
    </div>
  );
};

export default AdherenceSummary;
