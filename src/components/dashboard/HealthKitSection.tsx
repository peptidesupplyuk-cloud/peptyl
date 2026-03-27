import { Activity, Heart, Footprints, Flame, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHealthKit } from "@/hooks/use-healthkit";
import { Capacitor } from "@capacitor/core";
import { motion } from "framer-motion";

const HealthKitSection = () => {
  const { status, metrics, loading, requestPermission } = useHealthKit();

  // Only show on native iOS
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") {
    return null;
  }

  if (status === "unavailable") return null;

  if (status !== "granted") {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
        <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Apple Health
        </h3>
        <p className="text-xs text-muted-foreground">
          Connect Apple Health to sync steps, heart rate, HRV, sleep, and calories directly from your watch or phone.
        </p>
        <Button
          size="sm"
          onClick={requestPermission}
          className="w-full"
          disabled={status === "denied"}
        >
          <Watch className="h-3.5 w-3.5 mr-1" />
          {status === "denied" ? "Go to Settings → Health to enable" : "Connect Apple Health"}
        </Button>
      </div>
    );
  }

  const items = [
    metrics.steps != null && {
      icon: <Footprints className="h-4 w-4 text-amber-400" />,
      label: "Steps",
      value: metrics.steps.toLocaleString(),
      bg: "bg-amber-500/10",
    },
    metrics.restingHeartRate != null && {
      icon: <Heart className="h-4 w-4 text-red-400" />,
      label: "Resting HR",
      value: `${metrics.restingHeartRate} bpm`,
      bg: "bg-red-500/10",
    },
    metrics.hrv != null && {
      icon: <Activity className="h-4 w-4 text-primary" />,
      label: "HRV",
      value: `${metrics.hrv} ms`,
      bg: "bg-primary/10",
    },
    metrics.activeCalories != null && {
      icon: <Flame className="h-4 w-4 text-orange-400" />,
      label: "Active Cal",
      value: Math.round(metrics.activeCalories).toLocaleString(),
      bg: "bg-orange-500/10",
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; bg: string }[];

  if (items.length === 0 && !loading) return null;

  return (
    <motion.div
      className="bg-card rounded-2xl border border-border p-5 space-y-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Apple Health
        </h3>
        <span className="text-[10px] text-muted-foreground">Today</span>
      </div>
      {loading ? (
        <p className="text-xs text-muted-foreground animate-pulse">Syncing health data…</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/10 px-3 py-2.5"
            >
              <div className={`h-8 w-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-sm font-heading font-bold text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default HealthKitSection;
