import { motion } from "framer-motion";
import { CheckCircle2, XCircle, SkipForward, TrendingUp, FlaskConical, Pill } from "lucide-react";
import { useAdherence } from "@/hooks/use-adherence";

const AdherenceSummary = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { overall, totalPeptideRate, totalSupplementRate, perProtocol, isLoading } = useAdherence();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm px-5 py-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-3" />
        <div className="grid grid-cols-2 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (overall === null && totalPeptideRate === null && totalSupplementRate === null) {
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
    { icon: <TrendingUp className="h-3.5 w-3.5 text-primary" />, label: "Overall", value: overall !== null ? `${overall}%` : "—", glowColor: "hsl(var(--primary) / 0.15)" },
    { icon: <FlaskConical className="h-3.5 w-3.5 text-emerald-400" />, label: "Peptides", value: totalPeptideRate !== null ? `${totalPeptideRate}%` : "—", glowColor: "rgba(52,211,153,0.15)" },
    { icon: <Pill className="h-3.5 w-3.5 text-blue-400" />, label: "Supplements", value: totalSupplementRate !== null ? `${totalSupplementRate}%` : "—", glowColor: "rgba(96,165,250,0.15)" },
    { icon: <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />, label: "Protocols", value: `${perProtocol.length}`, glowColor: "hsl(var(--muted) / 0.15)" },
  ];

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ willChange: "transform" }}
    >
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

        {/* Per-protocol breakdown */}
        {perProtocol.length > 0 && (
          <div className="space-y-1.5">
            {perProtocol.map((p) => (
              <div key={p.protocolId} className="flex items-center justify-between text-xs bg-muted/30 rounded-lg px-3 py-1.5">
                <span className="text-foreground font-medium break-words line-clamp-1">{p.protocolName}</span>
                <span className="text-muted-foreground shrink-0 ml-2">
                  {p.combinedAdherence !== null ? `${p.combinedAdherence}%` : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdherenceSummary;
