import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Activity, TrendingDown, TrendingUp, AlertTriangle, Zap, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { useProtocols } from "@/hooks/use-protocols";

interface WearableNudge {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  type: "warning" | "positive" | "info";
  priority: number;
}

const WearableNudges = () => {
  const { user } = useAuth();
  const { data: protocols = [] } = useProtocols();

  const today = format(new Date(), "yyyy-MM-dd");
  const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const fourteenDaysAgo = format(subDays(new Date(), 14), "yyyy-MM-dd");

  const { data: recentWhoop = [] } = useQuery({
    queryKey: ["wearable-nudge-whoop-recent", user?.id, sevenDaysAgo],
    enabled: !!user,
    staleTime: 1000 * 60 * 15,
    queryFn: async () => {
      const { data } = await supabase
        .from("whoop_daily_metrics")
        .select("hrv, recovery_score, sleep_score, resting_heart_rate, date")
        .eq("user_id", user!.id)
        .gte("date", sevenDaysAgo)
        .lte("date", today)
        .order("date", { ascending: false });
      return data || [];
    },
  });

  const { data: prevWhoop = [] } = useQuery({
    queryKey: ["wearable-nudge-whoop-prev", user?.id, fourteenDaysAgo, sevenDaysAgo],
    enabled: !!user && recentWhoop.length > 0,
    staleTime: 1000 * 60 * 15,
    queryFn: async () => {
      const { data } = await supabase
        .from("whoop_daily_metrics")
        .select("hrv, recovery_score, sleep_score, resting_heart_rate, date")
        .eq("user_id", user!.id)
        .gte("date", fourteenDaysAgo)
        .lt("date", sevenDaysAgo)
        .order("date", { ascending: false });
      return data || [];
    },
  });

  const { data: recentFitbit = [] } = useQuery({
    queryKey: ["wearable-nudge-fitbit-recent", user?.id, sevenDaysAgo],
    enabled: !!user,
    staleTime: 1000 * 60 * 15,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("fitbit_daily_metrics")
        .select("hrv, sleep_score, resting_heart_rate, date")
        .eq("user_id", user!.id)
        .gte("date", sevenDaysAgo)
        .lte("date", today)
        .order("date", { ascending: false });
      return (data || []) as Array<{ hrv: number | null; sleep_score: number | null; resting_heart_rate: number | null; date: string }>;
    },
  });

  const nudges = useMemo(() => {
    const results: WearableNudge[] = [];
    if (recentWhoop.length === 0 && recentFitbit.length === 0) return results;

    const avg = (arr: (number | null)[]): number | null => {
      const valid = arr.filter((v): v is number => v != null);
      return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
    };

    const recentHRV = avg([...recentWhoop.map(w => w.hrv), ...recentFitbit.map(f => f.hrv)]);
    const prevHRV = avg(prevWhoop.map(w => w.hrv));
    const recentSleep = avg([...recentWhoop.map(w => w.sleep_score), ...recentFitbit.map(f => f.sleep_score)]);
    const prevSleep = avg(prevWhoop.map(w => w.sleep_score));
    const recentRecovery = avg(recentWhoop.map(w => w.recovery_score));
    const recentRHR = avg([...recentWhoop.map(w => w.resting_heart_rate), ...recentFitbit.map(f => f.resting_heart_rate)]);
    const prevRHR = avg(prevWhoop.map(w => w.resting_heart_rate));

    if (recentHRV != null && prevHRV != null && prevHRV > 0) {
      const change = ((recentHRV - prevHRV) / prevHRV) * 100;
      if (change <= -15) {
        results.push({
          id: "hrv-decline", icon: <TrendingDown className="h-4 w-4 text-orange-400" />,
          title: "HRV Declining",
          message: `Your HRV dropped ${Math.abs(Math.round(change))}% this week (${Math.round(recentHRV)}ms vs ${Math.round(prevHRV)}ms). Consider reducing protocol intensity or prioritising recovery.`,
          type: "warning", priority: 0,
        });
      } else if (change >= 10) {
        results.push({
          id: "hrv-improving", icon: <TrendingUp className="h-4 w-4 text-primary" />,
          title: "HRV Improving",
          message: `Your HRV increased ${Math.round(change)}% this week (${Math.round(recentHRV)}ms). Your current protocol appears to be well-tolerated.`,
          type: "positive", priority: 3,
        });
      }
    }

    if (recentSleep != null && prevSleep != null && prevSleep > 0) {
      const change = ((recentSleep - prevSleep) / prevSleep) * 100;
      if (change <= -10) {
        results.push({
          id: "sleep-decline", icon: <Moon className="h-4 w-4 text-indigo-400" />,
          title: "Sleep Quality Dropping",
          message: `Sleep score down ${Math.abs(Math.round(change))}% this week. Poor sleep reduces peptide efficacy — consider adjusting evening dosing or reducing stimulants.`,
          type: "warning", priority: 1,
        });
      }
    }

    if (recentRecovery != null && recentRecovery < 40) {
      results.push({
        id: "low-recovery", icon: <AlertTriangle className="h-4 w-4 text-orange-400" />,
        title: "Low Recovery Average",
        message: `Your 7-day recovery average is ${Math.round(recentRecovery)}%. Consider a protocol deload or rest day if this persists.`,
        type: "warning", priority: 0,
      });
    } else if (recentRecovery != null && recentRecovery >= 70) {
      results.push({
        id: "high-recovery", icon: <Zap className="h-4 w-4 text-emerald-400" />,
        title: "Strong Recovery",
        message: `Your recovery is averaging ${Math.round(recentRecovery)}% — excellent tolerance to your current protocols.`,
        type: "positive", priority: 4,
      });
    }

    if (recentRHR != null && prevRHR != null && prevRHR > 0) {
      const change = recentRHR - prevRHR;
      if (change >= 5) {
        results.push({
          id: "rhr-elevated", icon: <Heart className="h-4 w-4 text-red-400" />,
          title: "Resting HR Elevated",
          message: `Resting heart rate up ${Math.round(change)} bpm this week. Could indicate overtraining, illness, or stress. Monitor closely.`,
          type: "warning", priority: 1,
        });
      }
    }

    results.sort((a, b) => a.priority - b.priority);
    return results.slice(0, 3);
  }, [recentWhoop, prevWhoop, recentFitbit]);

  if (nudges.length === 0) return null;

  const styleForType = (type: WearableNudge["type"]) => {
    switch (type) {
      case "warning": return { bg: "bg-orange-500/5 border-orange-500/20", glow: "rgba(251,146,60,0.15)" };
      case "positive": return { bg: "bg-primary/5 border-primary/20", glow: "hsl(var(--primary) / 0.15)" };
      case "info": return { bg: "bg-blue-500/5 border-blue-500/20", glow: "rgba(96,165,250,0.15)" };
    }
  };

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
        className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-10 blur-[60px]"
        style={{ background: "hsl(var(--primary))" }}
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-heading font-bold text-foreground tracking-tight">Wearable Insights</h3>
        </div>

        <div className="space-y-2.5">
          <AnimatePresence>
            {nudges.map((nudge, idx) => {
              const style = styleForType(nudge.type);
              return (
                <motion.div
                  key={nudge.id}
                  className={`relative overflow-hidden rounded-xl border px-4 py-3.5 ${style.bg}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ delay: 0.1 + idx * 0.1, duration: 0.35 }}
                >
                  <div
                    className="pointer-events-none absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-30 blur-2xl"
                    style={{ background: style.glow }}
                  />
                  <div className="relative flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">{nudge.icon}</div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground tracking-tight">{nudge.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{nudge.message}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default WearableNudges;
