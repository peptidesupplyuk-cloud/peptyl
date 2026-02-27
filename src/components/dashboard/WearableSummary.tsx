import { Heart, Moon, Footprints, Activity, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
}

const MetricCard = ({ icon, label, value, unit, color }: MetricCardProps) => (
  <div className="flex items-center gap-2.5 min-w-0">
    <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground truncate">{label}</p>
      <p className="text-sm font-semibold text-foreground leading-tight">
        {value}{unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>}
      </p>
    </div>
  </div>
);

const WearableSummary = () => {
  const { user } = useAuth();

  // Fetch latest WHOOP metrics
  const { data: whoopMetrics } = useQuery({
    queryKey: ["whoop-latest-metric", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data } = await supabase
        .from("whoop_daily_metrics")
        .select("hrv, resting_heart_rate, recovery_score, strain, sleep_score, date")
        .eq("user_id", user!.id)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  // Fetch latest Fitbit metrics
  const { data: fitbitMetrics } = useQuery({
    queryKey: ["fitbit-latest-metric", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data } = await supabase
        .from("fitbit_daily_metrics" as any)
        .select("hrv, resting_heart_rate, sleep_score, steps, active_zone_minutes, calories_burned, date")
        .eq("user_id", user!.id)
        .order("date", { ascending: false })
        .limit(1)
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

  if (!hasWhoop && !hasFitbit) return null;

  // Merge: prefer WHOOP for shared metrics, add Fitbit-specific ones
  const hrv = whoopMetrics?.hrv ?? fitbitMetrics?.hrv ?? null;
  const rhr = whoopMetrics?.resting_heart_rate ?? fitbitMetrics?.resting_heart_rate ?? null;
  const sleepScore = whoopMetrics?.sleep_score ?? fitbitMetrics?.sleep_score ?? null;
  const recovery = whoopMetrics?.recovery_score ?? null;
  const steps = fitbitMetrics?.steps ?? null;
  const activeMinutes = fitbitMetrics?.active_zone_minutes ?? null;

  const sources = [hasWhoop && "WHOOP", hasFitbit && "Fitbit"].filter(Boolean).join(" + ");
  const latestDate = whoopMetrics?.date || fitbitMetrics?.date;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
          Wearable Summary
        </h3>
        <span className="text-[10px] text-muted-foreground">
          {sources} · {latestDate ? new Date(latestDate).toLocaleDateString() : ""}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {hrv != null && (
          <MetricCard
            icon={<Activity className="h-4 w-4 text-primary" />}
            label="HRV"
            value={Math.round(hrv)}
            unit="ms"
            color="bg-primary/10"
          />
        )}
        {rhr != null && (
          <MetricCard
            icon={<Heart className="h-4 w-4 text-red-400" />}
            label="Resting HR"
            value={Math.round(rhr)}
            unit="bpm"
            color="bg-red-500/10"
          />
        )}
        {sleepScore != null && (
          <MetricCard
            icon={<Moon className="h-4 w-4 text-indigo-400" />}
            label="Sleep"
            value={Math.round(sleepScore)}
            unit="%"
            color="bg-indigo-500/10"
          />
        )}
        {recovery != null && (
          <MetricCard
            icon={<Zap className="h-4 w-4 text-emerald-400" />}
            label="Recovery"
            value={`${Math.round(recovery)}%`}
            color="bg-emerald-500/10"
          />
        )}
        {steps != null && (
          <MetricCard
            icon={<Footprints className="h-4 w-4 text-amber-400" />}
            label="Steps"
            value={steps.toLocaleString()}
            color="bg-amber-500/10"
          />
        )}
        {activeMinutes != null && (
          <MetricCard
            icon={<Activity className="h-4 w-4 text-cyan-400" />}
            label="Active Mins"
            value={activeMinutes}
            unit="min"
            color="bg-cyan-500/10"
          />
        )}
      </div>
    </div>
  );
};

export default WearableSummary;
