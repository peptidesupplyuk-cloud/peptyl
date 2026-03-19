import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Heart, Dna, Droplets, Zap, TrendingUp, ChevronRight } from "lucide-react";
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { useProtocols } from "@/hooks/use-protocols";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAllInjections } from "@/hooks/use-injections";
import { BIOMARKERS, getMarkerStatus } from "@/data/biomarker-ranges";
import { differenceInCalendarDays, startOfDay, subDays, isSameDay } from "date-fns";

/* ── Score calculation engine ── */

interface ScoreBreakdown {
  label: string;
  score: number;
  maxScore: number;
  icon: React.ReactNode;
  color: string;
  detail: string;
}

function computeBioAge(args: {
  panels: any[];
  protocols: any[];
  allInjections: any[];
  hasDna: boolean;
  dnaScore: number | null;
  whoopDays: number;
  fitbitDays: number;
}): { total: number; breakdown: ScoreBreakdown[] } {
  const { panels, protocols, allInjections, hasDna, dnaScore, whoopDays, fitbitDays } = args;
  const breakdown: ScoreBreakdown[] = [];

  // 1. Biomarker Health (0-30)
  let bioScore = 0;
  const latest = panels[0];
  if (latest) {
    const markers = latest.markers || [];
    const markerMap = Object.fromEntries(markers.map((m: any) => [m.marker_name, m.value]));
    let optimal = 0;
    let tracked = 0;
    for (const def of BIOMARKERS) {
      if (markerMap[def.key] !== undefined) {
        tracked++;
        const status = getMarkerStatus(def, markerMap[def.key]);
        if (status === "optimal") optimal++;
        else if (status === "suboptimal") optimal += 0.5;
      }
    }
    if (tracked > 0) {
      bioScore = Math.round((optimal / tracked) * 25);
    }
    if (panels.length > 1) bioScore += 5; // tracking over time
  }
  bioScore = Math.min(30, bioScore);
  breakdown.push({
    label: "Biomarkers",
    score: bioScore,
    maxScore: 30,
    icon: <Droplets className="h-3.5 w-3.5" />,
    color: "text-blue-400",
    detail: latest ? `${panels[0]?.markers?.length || 0} markers tracked` : "No bloodwork yet",
  });

  // 2. Protocol Adherence (0-25)
  let adherenceScore = 0;
  const activeProtocols = protocols.filter((p: any) => p.status === "active");
  if (activeProtocols.length > 0) {
    adherenceScore += 5;
    const now = new Date();
    const today = startOfDay(now);
    const protocolInjections = allInjections.filter((i: any) => !!i.protocol_peptide_id);
    const completed = protocolInjections.filter((i: any) => i.status === "completed").length;
    const total = protocolInjections.filter(
      (i: any) => i.status === "completed" || i.status === "skipped" || (i.status === "scheduled" && new Date(i.scheduled_time) < now)
    ).length;
    const rate = total > 0 ? completed / total : 0;
    adherenceScore += Math.round(rate * 15);

    // Streak bonus
    let streak = 0;
    for (let d = 0; d < 365; d++) {
      const day = subDays(today, d);
      const dayInj = protocolInjections.filter(
        (i: any) => isSameDay(new Date(i.scheduled_time), day) && new Date(i.scheduled_time) <= now
      );
      if (dayInj.length === 0) continue;
      if (dayInj.every((i: any) => i.status === "completed")) streak++;
      else break;
    }
    if (streak >= 7) adherenceScore += 3;
    if (streak >= 30) adherenceScore += 2;
  }
  adherenceScore = Math.min(25, adherenceScore);
  breakdown.push({
    label: "Adherence",
    score: adherenceScore,
    maxScore: 25,
    icon: <Zap className="h-3.5 w-3.5" />,
    color: "text-emerald-400",
    detail: activeProtocols.length > 0 ? `${activeProtocols.length} active protocol${activeProtocols.length > 1 ? "s" : ""}` : "No active protocol",
  });

  // 3. Genetic Insights (0-20)
  let dnaScoreVal = 0;
  if (hasDna) {
    dnaScoreVal = 10;
    if (dnaScore && dnaScore >= 60) dnaScoreVal += 5;
    if (dnaScore && dnaScore >= 80) dnaScoreVal += 5;
  }
  dnaScoreVal = Math.min(20, dnaScoreVal);
  breakdown.push({
    label: "Genetics",
    score: dnaScoreVal,
    maxScore: 20,
    icon: <Dna className="h-3.5 w-3.5" />,
    color: "text-purple-400",
    detail: hasDna ? `Score: ${dnaScore || "—"}/100` : "No DNA uploaded",
  });

  // 4. Wearable Data (0-15)
  let wearableScore = 0;
  const totalWearableDays = whoopDays + fitbitDays;
  if (totalWearableDays > 0) wearableScore += 5;
  if (totalWearableDays >= 7) wearableScore += 5;
  if (totalWearableDays >= 30) wearableScore += 5;
  wearableScore = Math.min(15, wearableScore);
  breakdown.push({
    label: "Wearables",
    score: wearableScore,
    maxScore: 15,
    icon: <Activity className="h-3.5 w-3.5" />,
    color: "text-cyan-400",
    detail: totalWearableDays > 0 ? `${totalWearableDays} days synced` : "No wearable connected",
  });

  // 5. Data Completeness (0-10)
  let completeness = 0;
  if (panels.length > 0) completeness += 3;
  if (hasDna) completeness += 3;
  if (totalWearableDays > 0) completeness += 2;
  if (activeProtocols.length > 0) completeness += 2;
  completeness = Math.min(10, completeness);
  breakdown.push({
    label: "Coverage",
    score: completeness,
    maxScore: 10,
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    color: "text-amber-400",
    detail: `${[panels.length > 0, hasDna, totalWearableDays > 0, activeProtocols.length > 0].filter(Boolean).length}/4 data streams`,
  });

  const total = bioScore + adherenceScore + dnaScoreVal + wearableScore + completeness;
  return { total, breakdown };
}

/* ── Animated ring (2× internal resolution for HiDPI) ── */

const ScoreRing = ({ score, size = 128 }: { score: number; size?: number }) => {
  const scale = 2; // render at 2x for retina clarity
  const vb = size * scale;
  const strokeW = 7 * scale;
  const r = (vb / 2) - strokeW - 4;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const offset = circ * (1 - pct);
  const color = score >= 70 ? "hsl(var(--primary))" : score >= 40 ? "hsl(var(--warm))" : "hsl(var(--destructive))";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${vb} ${vb}`}
        className="transform -rotate-90"
        style={{ shapeRendering: "geometricPrecision" }}
      >
        {/* Track */}
        <circle
          cx={vb / 2} cy={vb / 2} r={r}
          fill="none"
          stroke="hsl(var(--muted) / 0.25)"
          strokeWidth={strokeW}
        />
        {/* Scored arc */}
        <motion.circle
          cx={vb / 2} cy={vb / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 ${6 * scale}px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-[2rem] font-heading font-bold text-foreground leading-none tracking-tight"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
        >
          {score}
        </motion.span>
        <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">
          Bio Score
        </span>
      </div>
    </div>
  );
};

/* ── Breakdown bar ── */

const BreakdownBar = ({ item, delay }: { item: ScoreBreakdown; delay: number }) => {
  const pct = item.maxScore > 0 ? (item.score / item.maxScore) * 100 : 0;

  return (
    <motion.div
      className="space-y-1.5"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={item.color}>{item.icon}</span>
          <span className="text-[13px] font-semibold text-foreground tracking-tight">{item.label}</span>
        </div>
        <span className="text-[13px] font-medium text-muted-foreground tabular-nums">{item.score}/{item.maxScore}</span>
      </div>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: pct >= 70
              ? "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--teal-glow)))"
              : pct >= 40
              ? "linear-gradient(90deg, hsl(var(--warm)), hsl(var(--warm) / 0.8))"
              : "hsl(var(--destructive) / 0.7)",
            boxShadow: pct >= 70 ? "0 0 8px hsl(var(--primary) / 0.35)" : undefined,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: delay + 0.2 }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">{item.detail}</p>
    </motion.div>
  );
};

/* ── Main component ── */

const BioAgeScore = () => {
  const { user } = useAuth();
  const { data: panels = [] } = useBloodworkPanels();
  const { data: protocols = [] } = useProtocols();
  const { data: allInjections = [] } = useAllInjections();

  const { data: dnaReports = [] } = useQuery({
    queryKey: ["bio-age-dna", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { data } = await supabase
        .from("dna_reports")
        .select("overall_score")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1);
      return data || [];
    },
  });

  const { data: whoopCount = 0 } = useQuery({
    queryKey: ["bio-age-whoop-days", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { count } = await supabase
        .from("whoop_daily_metrics")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return count ?? 0;
    },
  });

  const { data: fitbitCount = 0 } = useQuery({
    queryKey: ["bio-age-fitbit-days", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { count } = await (supabase as any)
        .from("fitbit_daily_metrics")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return count ?? 0;
    },
  });

  const hasDna = dnaReports.length > 0;
  const dnaScore = dnaReports[0]?.overall_score ?? null;

  const { total, breakdown } = useMemo(
    () => computeBioAge({ panels, protocols, allInjections, hasDna, dnaScore, whoopDays: whoopCount, fitbitDays: fitbitCount }),
    [panels, protocols, allInjections, hasDna, dnaScore, whoopCount, fitbitCount]
  );

  const statusText = total >= 80
    ? "Exceptional data coverage"
    : total >= 60
    ? "Strong foundation — keep building"
    : total >= 35
    ? "Growing — add more data streams"
    : "Getting started — every step counts";

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
        className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-15 blur-[80px]"
        style={{ background: total >= 60 ? "hsl(var(--primary))" : "hsl(var(--warm))" }}
      />

      <div className="relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <Heart className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-heading font-bold text-foreground tracking-tight">Health Intelligence Score</h3>
        </div>

        {/* Score + Breakdown */}
        <div className="flex items-start gap-7">
          {/* Ring */}
          <div className="shrink-0 flex flex-col items-center">
            <ScoreRing score={total} />
            <p className="text-[11px] text-muted-foreground text-center mt-2 max-w-[128px] leading-snug font-medium">{statusText}</p>
          </div>

          {/* Bars */}
          <div className="flex-1 space-y-3.5 min-w-0">
            {breakdown.map((item, idx) => (
              <BreakdownBar key={item.label} item={item} delay={0.1 + idx * 0.1} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BioAgeScore;
