import { motion } from "framer-motion";
import { Heart, Moon, Footprints, Activity, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, isSameDay, isFuture } from "date-fns";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  glowColor: string;
  delay: number;
}

const MetricCard = ({ icon, label, value, unit, color, glowColor, delay }: MetricCardProps) => (
  <motion.div
    className="relative flex items-center gap-3 min-w-0 rounded-xl border border-border/50 bg-muted/10 px-3.5 py-3 overflow-hidden"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35, ease: "easeOut" }}
  >
    {/* Subtle ambient glow */}
    <div
      className="pointer-events-none absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-20 blur-2xl"
      style={{ background: glowColor }}
    />
    <div className={`relative h-9 w-9 rounded-xl ${color} flex items-center justify-center shrink-0`}
      style={{ boxShadow: `0 0 12px ${glowColor}` }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground font-medium truncate">{label}</p>
      <p className="text-base font-heading font-bold text-foreground leading-tight tracking-tight">
        {value}{unit && <span className="text-[10px] font-normal text-muted-foreground/70 ml-0.5">{unit}</span>}
      </p>
    </div>
  </motion.div>
);

interface WearableSummaryProps {
  selectedDate?: Date;
}

const WearableSummary = ({ selectedDate }: WearableSummaryProps) => {
  const { user } = useAuth();
  const targetDate = selectedDate || new Date();
  const dateStr = format(targetDate, "yyyy-MM-dd");
  const isFutureDate = isFuture(targetDate) && !isSameDay(targetDate, new Date());

  const { data: whoopMetrics } = useQuery({
    queryKey: ["whoop-date-metric", user?.id, dateStr],
    enabled: !!user && !isFutureDate,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data } = await supabase
        .from("whoop_daily_metrics")
        .select("hrv, resting_heart_rate, recovery_score, strain, sleep_score, date")
        .eq("user_id", user!.id)
        .eq("date", dateStr)
        .maybeSingle();
      return data;
    },
  });

  const { data: fitbitMetrics } = useQuery({
    queryKey: ["fitbit-date-metric", user?.id, dateStr],
    enabled: !!user && !isFutureDate,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data } = await supabase
        .from("fitbit_daily_metrics" as any)
        .select("hrv, resting_heart_rate, sleep_score, steps, active_zone_minutes, calories_burned, date")
        .eq("user_id", user!.id)
        .eq("date", dateStr)
        .maybeSingle();
      return data as unknown as {
        hrv: number | null;
        resting_heart_rate: number | null;
        sleep_score: number | null;
        steps: number | null;
        active_zone_minutes: number | null;
        calories_burned: number | null;
        date: string;
      } | null;
    },
  });

  const hasWhoop = !!whoopMetrics;
  const hasFitbit = !!fitbitMetrics;

  if (isFutureDate) {
    return (
      <div className="bg-muted/30 rounded-xl px-4 py-3 mt-2">
        <p className="text-xs text-muted-foreground text-center">No wearable data for future dates</p>
      </div>
    );
  }

  if (!hasWhoop && !hasFitbit) return null;

  const hrv = whoopMetrics?.hrv ?? fitbitMetrics?.hrv ?? null;
  const rhr = whoopMetrics?.resting_heart_rate ?? fitbitMetrics?.resting_heart_rate ?? null;
  const sleepScore = whoopMetrics?.sleep_score ?? fitbitMetrics?.sleep_score ?? null;
  const recovery = whoopMetrics?.recovery_score ?? null;
  const steps = fitbitMetrics?.steps ?? null;
  const activeMinutes = fitbitMetrics?.active_zone_minutes ?? null;

  const sources = [hasWhoop && "WHOOP", hasFitbit && "Fitbit"].filter(Boolean).join(" + ");

  const metrics = [
    hrv != null && { icon: <Activity className="h-4 w-4 text-primary" />, label: "HRV", value: Math.round(hrv), unit: "ms", color: "bg-primary/10", glowColor: "hsl(var(--primary) / 0.25)" },
    rhr != null && { icon: <Heart className="h-4 w-4 text-red-400" />, label: "Resting HR", value: Math.round(rhr), unit: "bpm", color: "bg-red-500/10", glowColor: "rgba(248,113,113,0.2)" },
    sleepScore != null && { icon: <Moon className="h-4 w-4 text-indigo-400" />, label: "Sleep", value: Math.round(sleepScore), unit: "%", color: "bg-indigo-500/10", glowColor: "rgba(129,140,248,0.2)" },
    recovery != null && { icon: <Zap className="h-4 w-4 text-emerald-400" />, label: "Recovery", value: `${Math.round(recovery)}%`, color: "bg-emerald-500/10", glowColor: "rgba(52,211,153,0.2)" },
    steps != null && { icon: <Footprints className="h-4 w-4 text-amber-400" />, label: "Steps", value: steps.toLocaleString(), color: "bg-amber-500/10", glowColor: "rgba(251,191,36,0.2)" },
    activeMinutes != null && { icon: <Activity className="h-4 w-4 text-cyan-400" />, label: "Active Mins", value: activeMinutes, unit: "min", color: "bg-cyan-500/10", glowColor: "rgba(34,211,238,0.2)" },
  ].filter(Boolean) as Omit<MetricCardProps, "delay">[];

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm mt-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ willChange: "transform" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full opacity-10 blur-[80px]"
        style={{ background: "hsl(var(--primary))" }}
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-heading font-bold text-foreground tracking-tight">Wearable Summary</h3>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            {sources} · {dateStr}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5">
          {metrics.map((m, idx) => (
            <MetricCard key={m.label} {...m} delay={0.15 + idx * 0.08} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default WearableSummary;
