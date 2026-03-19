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
  const activeProtocols = protocols.filter((p) => p.status === "active");

  const today = format(new Date(), "yyyy-MM-dd");
  const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const fourteenDaysAgo = format(subDays(new Date(), 14), "yyyy-MM-dd");

  // Recent 7-day wearable average
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

  // Previous 7-day wearable average (for trend)
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

  // Recent 7-day Fitbit average
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

    // Compute averages
    const avg = (arr: (number | null)[]): number | null => {
      const valid = arr.filter((v): v is number => v != null);
      return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
    };

    const recentHRV = avg([...recentWhoop.map(w => w.hrv), ...recentFitbit.map(f => f.hrv)]);
    const prevHRV = avg(prevWhoop.map(w => w.hrv));
    const recentSleep = avg([...recentWhoop.map(w => w.sleep_score), ...recentFitbit.map(f => f.sleep_score)]);
    const prevSleep = avg(prevWhoop.map(w => w.sleep_score));
    const recentRecovery = avg(recentWhoop.map(w => w.recovery_score));
    const prevRecovery = avg(prevWhoop.map(w => w.recovery_score));
    const recentRHR = avg([...recentWhoop.map(w => w.resting_heart_rate), ...recentFitbit.map(f => f.resting_heart_rate)]);
    const prevRHR = avg(prevWhoop.map(w => w.resting_heart_rate));

    // HRV declining
    if (recentHRV != null && prevHRV != null && prevHRV > 0) {
      const change = ((recentHRV - prevHRV) / prevHRV) * 100;
      if (change <= -15) {
        results.push({
          id: "hrv-decline",
          icon: <TrendingDown className="h-4 w-4 text-orange-400" />,
          title: "HRV Declining",
          message: `Your HRV dropped ${Math.abs(Math.round(change))}% this week (${Math.round(recentHRV)}ms vs ${Math.round(prevHRV)}ms). Consider reducing protocol intensity or prioritising recovery.`,
          type: "warning",
          priority: 0,
        });
      } else if (change >= 10) {
        results.push({
          id: "hrv-improving",
          icon: <TrendingUp className="h-4 w-4 text-primary" />,
          title: "HRV Improving",
          message: `Your HRV increased ${Math.round(change)}% this week (${Math.round(recentHRV)}ms). Your current protocol appears to be well-tolerated.`,
          type: "positive",
          priority: 3,
        });
      }
    }

    // Sleep declining
    if (recentSleep != null && prevSleep != null && prevSleep > 0) {
      const change = ((recentSleep - prevSleep) / prevSleep) * 100;
      if (change <= -10) {
        results.push({
          id: "sleep-decline",
          icon: <Moon className="h-4 w-4 text-indigo-400" />,
          title: "Sleep Quality Dropping",
          message: `Sleep score down ${Math.abs(Math.round(change))}% this week. Poor sleep reduces peptide efficacy — consider adjusting evening dosing or reducing stimulants.`,
          type: "warning",
          priority: 1,
        });
      }
    }

    // Recovery low
    if (recentRecovery != null && recentRecovery < 40) {
      results.push({
        id: "low-recovery",
        icon: <AlertTriangle className="h-4 w-4 text-orange-400" />,
        title: "Low Recovery Average",
        message: `Your 7-day recovery average is ${Math.round(recentRecovery)}%. Consider a protocol deload or rest day if this persists.`,
        type: "warning",
        priority: 0,
      });
    } else if (recentRecovery != null && recentRecovery >= 70) {
      results.push({
        id: "high-recovery",
        icon: <Zap className="h-4 w-4 text-emerald-400" />,
        title: "Strong Recovery",
        message: `Your recovery is averaging ${Math.round(recentRecovery)}% — excellent tolerance to your current protocols.`,
        type: "positive",
        priority: 4,
      });
    }

    // RHR elevated
    if (recentRHR != null && prevRHR != null && prevRHR > 0) {
      const change = recentRHR - prevRHR;
      if (change >= 5) {
        results.push({
          id: "rhr-elevated",
          icon: <Heart className="h-4 w-4 text-red-400" />,
          title: "Resting HR Elevated",
          message: `Resting heart rate up ${Math.round(change)} bpm this week. Could indicate overtraining, illness, or stress. Monitor closely.`,
          type: "warning",
          priority: 1,
        });
      }
    }

    // Sort by priority
    results.sort((a, b) => a.priority - b.priority);
    return results.slice(0, 3); // Max 3 nudges
  }, [recentWhoop, prevWhoop, recentFitbit]);

  if (nudges.length === 0) return null;

  const bgForType = (type: WearableNudge["type"]) => {
    switch (type) {
      case "warning": return "bg-orange-500/5 border-orange-500/20";
      case "positive": return "bg-primary/5 border-primary/20";
      case "info": return "bg-blue-500/5 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Activity className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
          Wearable Insights
        </span>
      </div>
      <AnimatePresence>
        {nudges.map((nudge, idx) => (
          <motion.div
            key={nudge.id}
            className={`rounded-xl border px-4 py-3 ${bgForType(nudge.type)}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
          >
            <div className="flex items-start gap-2.5">
              <div className="shrink-0 mt-0.5">{nudge.icon}</div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{nudge.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{nudge.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WearableNudges;
