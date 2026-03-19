import { useMemo } from "react";
import { motion } from "framer-motion";
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
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm px-5 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-heading font-bold text-foreground text-sm tracking-tight">Adherence Snapshot</h2>
        </div>
        <p className="text-xs text-muted-foreground">Complete your first scheduled dose to unlock adherence stats.</p>
      </motion.div>
    );
  }

  const tiles = [
    { icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />, label: "Completed", value: stats.completed, glowColor: "rgba(52,211,153,0.15)" },
    { icon: <XCircle className="h-3.5 w-3.5 text-destructive" />, label: "Missed", value: stats.missed, glowColor: "hsl(var(--destructive) / 0.15)" },
    { icon: <SkipForward className="h-3.5 w-3.5 text-muted-foreground" />, label: "Skipped", value: stats.skipped, glowColor: "hsl(var(--muted) / 0.15)" },
    { icon: <TrendingUp className="h-3.5 w-3.5 text-primary" />, label: "Adherence", value: `${stats.rate}%`, glowColor: "hsl(var(--primary) / 0.15)" },
  ];

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ willChange: "transform" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-16 right-0 w-48 h-48 rounded-full opacity-10 blur-[80px]"
        style={{ background: "hsl(var(--primary))" }}
      />

      <div className="relative p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-heading font-bold text-foreground text-sm tracking-tight">Adherence Snapshot</h2>
          </div>
          {onNavigate && (
            <button onClick={onNavigate} className="text-xs text-primary font-medium hover:underline">
              View full →
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {tiles.map((t, idx) => (
            <motion.div
              key={t.label}
              className="relative overflow-hidden rounded-xl border border-border/50 bg-muted/10 px-3.5 py-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.08, duration: 0.35 }}
            >
              <div
                className="pointer-events-none absolute -bottom-4 -right-4 w-12 h-12 rounded-full opacity-30 blur-xl"
                style={{ background: t.glowColor }}
              />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1">
                  {t.icon}
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{t.label}</span>
                </div>
                <p className="text-xl font-heading font-bold text-foreground leading-none tracking-tight">{t.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {stats.weekTotal > 0 && (
          <p className="text-[11px] text-muted-foreground">
            This week: <span className="text-foreground font-semibold">{stats.weekCompleted}/{stats.weekTotal}</span> doses completed
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default AdherenceSummary;
