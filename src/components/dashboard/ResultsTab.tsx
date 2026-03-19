import { useMemo, useState } from "react";
import { useProtocols } from "@/hooks/use-protocols";
import { useBloodworkPanels, type BloodworkPanel } from "@/hooks/use-bloodwork";
import { useAllInjections } from "@/hooks/use-injections";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BIOMARKERS } from "@/data/biomarker-ranges";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Moon,
  Heart,
  BarChart3,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Trophy,
  Flame,
  Zap,
  Target,
  Star,
  Shield,
  Award,
  Crown,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { differenceInCalendarDays, format, startOfDay, subDays, isSameDay, startOfWeek, endOfWeek, addDays, isWithinInterval } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */

interface MarkerDelta {
  name: string;
  displayName: string;
  before: number;
  after: number;
  unit: string;
  pctChange: number;
  direction: "improved" | "worsened" | "unchanged";
}

interface WeekSummary {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  totalDoses: number;
  completedDoses: number;
  skippedDoses: number;
  missedDoses: number;
  adherenceRate: number;
  streak: number;
  isCurrentWeek: boolean;
  isMilestone: boolean;
  milestoneDay: 30 | 60 | 90 | null;
}

/* ═══════════════════════════════════════════════════════
   ADMIN MOCK DATA
   ═══════════════════════════════════════════════════════ */

const ADMIN_EMAIL = "peptidesupplyuk@gmail.com";

function generateMockWeeks(): WeekSummary[] {
  const today = new Date();
  const weeks: WeekSummary[] = [];
  
  for (let w = 0; w < 13; w++) {
    const startDate = subDays(today, (12 - w) * 7);
    const endDate = addDays(startDate, 6);
    const dayInProtocol = (w + 1) * 7;
    const isMilestone30 = dayInProtocol >= 28 && dayInProtocol < 35;
    const isMilestone60 = dayInProtocol >= 56 && dayInProtocol < 63;
    const isMilestone90 = dayInProtocol >= 84;

    const baseAdherence = 75 + Math.min(w * 2, 20) + (Math.random() * 8 - 4);
    const adherenceRate = Math.min(100, Math.max(60, Math.round(baseAdherence)));
    const totalDoses = 14;
    const completedDoses = Math.round((adherenceRate / 100) * totalDoses);
    const skippedDoses = Math.floor(Math.random() * (totalDoses - completedDoses));
    const missedDoses = totalDoses - completedDoses - skippedDoses;

    weeks.push({
      weekNumber: w + 1,
      startDate,
      endDate,
      totalDoses,
      completedDoses,
      skippedDoses,
      missedDoses,
      adherenceRate,
      streak: Math.min(w + 1, adherenceRate >= 90 ? w + 1 : Math.floor(Math.random() * 5) + 1),
      isCurrentWeek: w === 12,
      isMilestone: isMilestone30 || isMilestone60 || isMilestone90,
      milestoneDay: isMilestone90 ? 90 : isMilestone60 ? 60 : isMilestone30 ? 30 : null,
    });
  }
  return weeks;
}

/* ═══════════════════════════════════════════════════════
   MAIN RESULTS TAB
   ═══════════════════════════════════════════════════════ */

const ResultsTab = () => {
  const { user } = useAuth();
  const { data: protocols = [] } = useProtocols();
  const { data: panels = [] } = useBloodworkPanels();
  const { data: allInjections = [] } = useAllInjections();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const { data: outcomeRecords = [] } = useQuery({
    queryKey: ["outcome_records_all", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outcome_records")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: whoopMetrics = [] } = useQuery({
    queryKey: ["whoop_metrics_results", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("whoop_daily_metrics")
        .select("date, hrv, recovery_score, sleep_score")
        .eq("user_id", user!.id)
        .order("date", { ascending: true });
      return data ?? [];
    },
  });

  const activeProtocol = protocols.find((p) => p.status === "active");
  const completedProtocols = protocols.filter((p) => p.status === "completed");
  const completedRecords = outcomeRecords.filter((r: any) => r.status === "completed");

  // Build weekly summaries from real injection data
  const weekSummaries: WeekSummary[] = useMemo(() => {
    if (isAdmin && !activeProtocol) return generateMockWeeks();
    if (!activeProtocol) return [];

    const protocolStart = startOfDay(new Date(activeProtocol.start_date));
    const today = startOfDay(new Date());
    const totalProtocolDays = differenceInCalendarDays(today, protocolStart) + 1;
    const totalWeeks = Math.ceil(totalProtocolDays / 7);

    const protocolInjections = allInjections.filter(
      (i) => new Date(i.scheduled_time) >= protocolStart
    );

    const weeks: WeekSummary[] = [];
    for (let w = 0; w < totalWeeks; w++) {
      const weekStart = addDays(protocolStart, w * 7);
      const weekEnd = addDays(weekStart, 6);
      const dayInProtocol = (w + 1) * 7;

      const weekInjections = protocolInjections.filter((i) => {
        const d = startOfDay(new Date(i.scheduled_time));
        return d >= weekStart && d <= weekEnd;
      });

      const totalDoses = weekInjections.length;
      const completedDoses = weekInjections.filter((i) => i.status === "completed").length;
      const skippedDoses = weekInjections.filter((i) => i.status === "skipped").length;
      const missedDoses = weekInjections.filter(
        (i) => i.status === "scheduled" && new Date(i.scheduled_time) < new Date()
      ).length;
      const adherenceRate = totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0;

      // Calculate streak within this week
      let streak = 0;
      for (let d = 6; d >= 0; d--) {
        const day = addDays(weekStart, d);
        if (day > today) continue;
        const dayInj = weekInjections.filter((i) => isSameDay(new Date(i.scheduled_time), day));
        if (dayInj.length === 0) continue;
        if (dayInj.every((i) => i.status === "completed")) streak++;
        else break;
      }

      const isMilestone30 = dayInProtocol >= 28 && dayInProtocol < 35;
      const isMilestone60 = dayInProtocol >= 56 && dayInProtocol < 63;
      const isMilestone90 = dayInProtocol >= 84 && dayInProtocol < 91;

      weeks.push({
        weekNumber: w + 1,
        startDate: weekStart,
        endDate: weekEnd,
        totalDoses,
        completedDoses,
        skippedDoses,
        missedDoses,
        adherenceRate,
        streak,
        isCurrentWeek: w === totalWeeks - 1,
        isMilestone: isMilestone30 || isMilestone60 || isMilestone90,
        milestoneDay: isMilestone90 ? 90 : isMilestone60 ? 60 : isMilestone30 ? 30 : null,
      });
    }
    return weeks;
  }, [activeProtocol, allInjections, isAdmin]);

  const overallAdherence = useMemo(() => {
    if (weekSummaries.length === 0) return 0;
    const total = weekSummaries.reduce((sum, w) => sum + w.totalDoses, 0);
    const completed = weekSummaries.reduce((sum, w) => sum + w.completedDoses, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [weekSummaries]);

  const longestStreak = useMemo(() => {
    if (weekSummaries.length === 0) return 0;
    // Count consecutive weeks with >=80% adherence
    let max = 0, current = 0;
    for (const w of weekSummaries) {
      if (w.adherenceRate >= 80) { current++; max = Math.max(max, current); }
      else current = 0;
    }
    return max;
  }, [weekSummaries]);

  const hasActiveJourney = weekSummaries.length > 0;
  const hasCompletedResults = completedProtocols.length > 0 || completedRecords.length > 0;

  if (!hasActiveJourney && !hasCompletedResults) {
    return (
      <div className="bg-card rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
        <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/50" />
        <h3 className="font-heading font-semibold text-foreground text-lg">No Results Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Start a protocol to track your weekly progress, hit milestones, and see your results over time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══ ACTIVE JOURNEY ═══ */}
      {hasActiveJourney && (
        <>
          {/* Overall Stats Banner */}
          <OverallStatsBanner
            weeks={weekSummaries.length}
            adherence={overallAdherence}
            longestStreak={longestStreak}
            protocolName={activeProtocol?.name || "Research Protocol"}
          />

          {/* Milestone Progress */}
          <MilestoneTrack weekSummaries={weekSummaries} />

          {/* Weekly Cards */}
          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-foreground text-sm px-1">Weekly Progress</h3>
            {[...weekSummaries].reverse().map((week, idx) => (
              <motion.div
                key={week.weekNumber}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                {week.isMilestone && week.milestoneDay ? (
                  <MilestoneCard week={week} />
                ) : (
                  <WeeklyCard week={week} />
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ═══ COMPLETED PROTOCOL RESULTS ═══ */}
      {hasCompletedResults && (
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-foreground text-sm px-1">Completed Protocols</h3>
          {completedRecords.map((record: any) => {
            const protocol = protocols.find((p) => p.id === record.protocol_id);
            return (
              <CompletedProtocolResult
                key={record.id}
                record={record}
                protocolName={protocol?.name ?? "Protocol"}
                panels={panels}
                whoopMetrics={whoopMetrics}
              />
            );
          })}
          {completedProtocols
            .filter((p) => !outcomeRecords.some((r: any) => r.protocol_id === p.id))
            .map((p) => (
              <div key={p.id} className="bg-card rounded-2xl border border-border/30 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-semibold text-foreground text-sm">{p.name}</h4>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Awaiting retest
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Log your retest bloods to see your before vs after comparison.
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   OVERALL STATS BANNER
   ═══════════════════════════════════════════════════════ */

const OverallStatsBanner = ({
  weeks,
  adherence,
  longestStreak,
  protocolName,
}: {
  weeks: number;
  adherence: number;
  longestStreak: number;
  protocolName: string;
}) => (
  <motion.div
    className="relative overflow-hidden bg-card rounded-2xl border border-border shadow-sm"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    style={{ willChange: "transform" }}
  >
    {/* Ambient glow */}
    <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-primary/10 rounded-full blur-[80px] opacity-15" />
    <div className="pointer-events-none absolute -bottom-16 -left-16 w-40 h-40 bg-primary/5 rounded-full blur-[60px] opacity-15" />
    
    <div className="relative p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"
          style={{ boxShadow: "0 0 16px hsl(var(--primary) / 0.15)" }}
        >
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-foreground text-lg leading-tight tracking-tight">Your Journey</h2>
          <p className="text-xs text-muted-foreground">{protocolName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <StatPill icon={<Calendar className="h-3.5 w-3.5" />} label="Weeks" value={String(weeks)} />
        <StatPill icon={<Target className="h-3.5 w-3.5" />} label="Adherence" value={`${adherence}%`} highlight={adherence >= 80} />
      </div>
    </div>
  </motion.div>
);

const StatPill = ({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) => (
  <motion.div
    className={`relative overflow-hidden rounded-xl p-3.5 text-center space-y-1 border ${highlight ? "bg-primary/10 border-primary/20" : "bg-muted/10 border-border/50"}`}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.35 }}
  >
    {highlight && (
      <div className="pointer-events-none absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-25 blur-xl" style={{ background: "hsl(var(--primary) / 0.3)" }} />
    )}
    <div className="relative">
      <div className="flex justify-center text-muted-foreground">{icon}</div>
      <p className={`text-xl font-heading font-bold tracking-tight leading-none ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">{label}</p>
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════
   MILESTONE PROGRESS TRACK
   ═══════════════════════════════════════════════════════ */

const MilestoneTrack = ({ weekSummaries }: { weekSummaries: WeekSummary[] }) => {
  const totalDays = weekSummaries.length * 7;
  const milestones = [
    { day: 30, icon: Shield, label: "30 Days", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { day: 60, icon: Award, label: "60 Days", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { day: 90, icon: Crown, label: "90 Days", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  ];

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      style={{ willChange: "transform" }}
    >
      <div className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 rounded-full opacity-10 blur-[60px]" style={{ background: "hsl(var(--primary))" }} />

      <div className="relative p-5 sm:p-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Milestones</h3>
        
        {/* Progress bar */}
        <div className="relative h-2.5 bg-muted/30 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--teal-glow, var(--primary))))",
              boxShadow: "0 0 12px hsl(var(--primary) / 0.35)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (totalDays / 90) * 100)}%` }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
          />
          {milestones.map((m) => {
            const pct = (m.day / 90) * 100;
            const reached = totalDays >= m.day;
            return (
              <div
                key={m.day}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${pct}%` }}
              >
                <div className={`h-4 w-4 rounded-full border-2 -ml-2 transition-all duration-500 ${
                  reached
                    ? "bg-primary border-primary scale-110"
                    : "bg-card border-border"
                }`}
                  style={reached ? { boxShadow: "0 0 8px hsl(var(--primary) / 0.4)" } : {}}
                >
                  {reached && (
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Milestone labels */}
        <div className="grid grid-cols-3 gap-2.5">
          {milestones.map((m, idx) => {
            const reached = totalDays >= m.day;
            const Icon = m.icon;
            return (
              <motion.div
                key={m.day}
                className={`relative overflow-hidden rounded-xl border p-3.5 text-center transition-all ${
                  reached ? m.bg : "bg-muted/10 border-border/50 opacity-50"
                }`}
                initial={{ opacity: 0, y: 8 }}
                animate={reached ? { opacity: 1, y: 0, scale: [1, 1.04, 1] } : { opacity: 0.5, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
              >
                {reached && (
                  <div className="pointer-events-none absolute -bottom-4 -right-4 w-14 h-14 rounded-full opacity-25 blur-xl" style={{ background: m.color.replace("text-", "") }} />
                )}
                <Icon className={`h-5 w-5 mx-auto mb-1.5 ${reached ? m.color : "text-muted-foreground"}`} />
                <p className={`text-xs font-semibold tracking-tight ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                  {m.label}
                </p>
                {reached ? (
                  <p className="text-[10px] text-primary font-semibold mt-0.5">Unlocked ✓</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.day - totalDays} days left</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   WEEKLY CARD
   ═══════════════════════════════════════════════════════ */

const WeeklyCard = ({ week }: { week: WeekSummary }) => {
  const ringSize = 48;
  const strokeWidth = 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (week.adherenceRate / 100) * circumference;

  const adherenceColor = week.adherenceRate >= 90
    ? "text-primary stroke-primary"
    : week.adherenceRate >= 70
    ? "stroke-amber-400 text-amber-400"
    : "stroke-red-400 text-red-400";

  return (
    <div className={`relative overflow-hidden bg-card rounded-2xl border p-4 flex items-center gap-4 shadow-sm ${
      week.isCurrentWeek ? "border-primary/30" : "border-border"
    }`}
      style={week.isCurrentWeek ? { boxShadow: "0 0 20px -5px hsl(var(--primary) / 0.12)" } : {}}
    >
      {/* Subtle glow for current week */}
      {week.isCurrentWeek && (
        <div className="pointer-events-none absolute -top-8 -left-8 w-24 h-24 rounded-full opacity-15 blur-2xl" style={{ background: "hsl(var(--primary))" }} />
      )}

      {/* Adherence ring — 2x for retina */}
      <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize * 2} ${ringSize * 2}`}
          className="-rotate-90"
          style={{ shapeRendering: "geometricPrecision" }}
        >
          <circle cx={ringSize} cy={ringSize} r={radius * 2} fill="none" strokeWidth={strokeWidth * 2} stroke="hsl(var(--muted) / 0.25)" />
          <motion.circle
            cx={ringSize} cy={ringSize} r={radius * 2} fill="none"
            strokeWidth={strokeWidth * 2}
            strokeLinecap="round"
            stroke={week.adherenceRate >= 90 ? "hsl(var(--primary))" : week.adherenceRate >= 70 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)"}
            initial={{ strokeDashoffset: circumference * 2 }}
            animate={{ strokeDashoffset: offset * 2 }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeDasharray={circumference * 2}
            style={{ filter: `drop-shadow(0 0 ${week.adherenceRate >= 90 ? 6 : 3}px ${week.adherenceRate >= 90 ? "hsl(var(--primary) / 0.4)" : "transparent"})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-heading font-bold ${adherenceColor.split(" ")[0]}`}>{week.adherenceRate}%</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-heading font-semibold text-foreground tracking-tight">
            Week {week.weekNumber}
          </h4>
          {week.isCurrentWeek && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              Current
            </span>
          )}
          {week.adherenceRate === 100 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-0.5">
              <Star className="h-2.5 w-2.5" /> Perfect
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {format(week.startDate, "d MMM")} – {format(week.endDate, "d MMM")}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-muted-foreground">
            {week.completedDoses}/{week.totalDoses} doses
          </span>
        </div>
      </div>

      {/* Day dots */}
      <div className="hidden sm:flex flex-col gap-1 shrink-0">
        <DayDots week={week} />
      </div>
    </div>
  );
};

const DayDots = ({ week }: { week: WeekSummary }) => {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const dotsPerDay = Math.ceil(week.totalDoses / 7);
  
  return (
    <div className="flex gap-0.5">
      {days.map((d, i) => {
        const dayIdx = i;
        const fraction = Math.min(1, week.completedDoses / Math.max(1, week.totalDoses));
        const filled = dayIdx < Math.ceil(fraction * 7);
        return (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] text-muted-foreground">{d}</span>
            <div className={`h-2 w-2 rounded-full ${filled ? "bg-primary" : "bg-muted"}`} />
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MILESTONE CARD — Special visual treatment
   ═══════════════════════════════════════════════════════ */

const MILESTONE_CONFIG = {
  30: {
    icon: Shield,
    title: "30-Day Checkpoint",
    subtitle: "Foundation built",
    description: "You've established a consistent research routine. Patterns are forming.",
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    bgGlow: "bg-blue-500/10",
    accentBg: "bg-blue-500/10",
    accentText: "text-blue-400",
    badge: "🔬 Foundation",
  },
  60: {
    icon: Award,
    title: "60-Day Review",
    subtitle: "Momentum established",
    description: "Two months of dedicated research. Your data is telling a story now.",
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    bgGlow: "bg-purple-500/10",
    accentBg: "bg-purple-500/10",
    accentText: "text-purple-400",
    badge: "📊 Momentum",
  },
  90: {
    icon: Crown,
    title: "90-Day Complete",
    subtitle: "Protocol mastered",
    description: "Full cycle complete. Time to analyse your results and plan the next chapter.",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-400",
    bgGlow: "bg-amber-500/10",
    accentBg: "bg-amber-500/10",
    accentText: "text-amber-400",
    badge: "🏆 Complete",
  },
} as const;

const MilestoneCard = ({ week }: { week: WeekSummary }) => {
  const day = week.milestoneDay!;
  const config = MILESTONE_CONFIG[day];
  const Icon = config.icon;

  return (
    <motion.div
      className={`relative overflow-hidden bg-card rounded-2xl border ${config.borderColor} p-5 sm:p-6`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Background glow */}
      <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full ${config.bgGlow} blur-3xl`} />
      <div className={`absolute -bottom-12 -left-12 w-24 h-24 rounded-full ${config.bgGlow} blur-2xl`} />
      
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.div
              className={`h-12 w-12 rounded-xl ${config.accentBg} flex items-center justify-center`}
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-foreground text-base">{config.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{config.subtitle}</p>
            </div>
          </div>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${config.accentBg} ${config.accentText} whitespace-nowrap`}>
            {config.badge}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">{config.description}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`rounded-xl ${config.accentBg} p-3 text-center`}>
            <p className={`text-lg font-heading font-bold ${config.accentText}`}>
              {week.adherenceRate}%
            </p>
            <p className="text-[10px] text-muted-foreground">This Week</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="text-lg font-heading font-bold text-foreground">{week.completedDoses}</p>
            <p className="text-[10px] text-muted-foreground">Doses Done</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-center">
            <p className="text-lg font-heading font-bold text-foreground">{week.weekNumber}</p>
            <p className="text-[10px] text-muted-foreground">Weeks In</p>
          </div>
        </div>

        {/* 90-day special: big celebration */}
        {day === 90 && (
          <motion.div
            className="bg-gradient-to-r from-amber-500/10 to-primary/10 rounded-xl p-4 text-center border border-amber-500/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: 2, duration: 0.8, delay: 0.8 }}
            >
              <Crown className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            </motion.div>
            <p className="font-heading font-bold text-foreground">Protocol Complete!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Full 90-day cycle finished. Log your retest bloodwork to see the full picture.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   COMPLETED PROTOCOL RESULT (existing logic, refined)
   ═══════════════════════════════════════════════════════ */

const CompletedProtocolResult = ({
  record,
  protocolName,
  panels,
  whoopMetrics,
}: {
  record: any;
  protocolName: string;
  panels: BloodworkPanel[];
  whoopMetrics: any[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const outcomeMarkers = (record.outcome_markers ?? {}) as Record<
    string,
    { before: number; after: number; change: number; pct_change: number; direction: string }
  >;

  const deltas: MarkerDelta[] = useMemo(() => {
    return Object.entries(outcomeMarkers)
      .map(([key, m]) => {
        const biomarkerDef = BIOMARKERS.find((b) => b.key === key || b.name === key);
        return {
          name: key,
          displayName: biomarkerDef?.name ?? key.replace(/_/g, " "),
          before: m.before,
          after: m.after,
          unit: biomarkerDef?.unit ?? "",
          pctChange: m.pct_change,
          direction: m.direction as MarkerDelta["direction"],
        };
      })
      .sort((a, b) => {
        const order = { improved: 0, unchanged: 1, worsened: 2 };
        return (order[a.direction] ?? 1) - (order[b.direction] ?? 1);
      });
  }, [outcomeMarkers]);

  const improved = deltas.filter((d) => d.direction === "improved");
  const worsened = deltas.filter((d) => d.direction === "worsened");
  const unchanged = deltas.filter((d) => d.direction === "unchanged");

  const visibleDeltas = expanded ? deltas : deltas.slice(0, 6);
  const hasMore = deltas.length > 6;

  const hrvBaseline = record.avg_hrv_baseline != null ? Number(record.avg_hrv_baseline) : null;
  const hrvProtocol = record.avg_hrv_protocol != null ? Number(record.avg_hrv_protocol) : null;
  const recoveryBaseline = record.avg_recovery_baseline != null ? Number(record.avg_recovery_baseline) : null;
  const recoveryProtocol = record.avg_recovery_protocol != null ? Number(record.avg_recovery_protocol) : null;
  const sleepBaseline = record.avg_sleep_score_baseline != null ? Number(record.avg_sleep_score_baseline) : null;
  const sleepProtocol = record.avg_sleep_score_protocol != null ? Number(record.avg_sleep_score_protocol) : null;
  const hasWearableData = hrvBaseline != null || recoveryBaseline != null || sleepBaseline != null;

  const weeks = record.weeks_on_protocol ?? null;
  const adherence = record.adherence_percentage != null ? Number(record.adherence_percentage) : null;

  const responderLabel =
    record.overall_responder_status === "strong_responder"
      ? "Strong Responder"
      : record.overall_responder_status === "responder"
      ? "Responder"
      : record.overall_responder_status === "non_responder"
      ? "Non Responder"
      : null;

  const responderColor =
    record.overall_responder_status === "strong_responder"
      ? "bg-primary/20 text-primary border-primary/30"
      : record.overall_responder_status === "responder"
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-muted text-muted-foreground border-border";

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <h4 className="font-heading font-semibold text-foreground">{protocolName}</h4>
          {responderLabel && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${responderColor}`}>
              {responderLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {weeks != null && <span>{weeks} weeks</span>}
          {adherence != null && (
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />{adherence}% adherence
            </span>
          )}
        </div>
      </div>

      {deltas.length > 0 && (
        <div className="flex items-center gap-4 text-xs">
          {improved.length > 0 && (
            <span className="flex items-center gap-1 text-green-400">
              <TrendingDown className="h-3 w-3" />{improved.length} improved
            </span>
          )}
          {worsened.length > 0 && (
            <span className="flex items-center gap-1 text-red-400">
              <TrendingUp className="h-3 w-3" />{worsened.length} need attention
            </span>
          )}
          {unchanged.length > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Minus className="h-3 w-3" />{unchanged.length} stable
            </span>
          )}
        </div>
      )}

      {deltas.length > 0 ? (
        <div className="space-y-1">
          {visibleDeltas.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-sm py-1.5 border-b border-border/10 last:border-0">
              <span className="text-muted-foreground capitalize text-xs">{d.displayName}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{d.before} {d.unit}</span>
                <span className="text-muted-foreground/50">→</span>
                <span className="font-mono text-xs text-foreground">{d.after} {d.unit}</span>
                <DeltaBadge direction={d.direction} pctChange={d.pctChange} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          No bloodwork comparison available. Log baseline and retest panels to see changes.
        </p>
      )}

      {hasMore && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary flex items-center gap-1 hover:underline">
          {expanded ? (<>Show less <ChevronUp className="h-3 w-3" /></>) : (<>View all {deltas.length} markers <ChevronDown className="h-3 w-3" /></>)}
        </button>
      )}

      {hasWearableData && (
        <div className="border-t border-border/20 pt-4 space-y-2">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Wearable Changes</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {hrvBaseline != null && hrvProtocol != null && (
              <WearableStat icon={<Activity className="h-3.5 w-3.5" />} label="HRV" before={hrvBaseline} after={hrvProtocol} unit="ms" higherIsBetter />
            )}
            {recoveryBaseline != null && recoveryProtocol != null && (
              <WearableStat icon={<Heart className="h-3.5 w-3.5" />} label="Recovery" before={recoveryBaseline} after={recoveryProtocol} unit="%" higherIsBetter />
            )}
            {sleepBaseline != null && sleepProtocol != null && (
              <WearableStat icon={<Moon className="h-3.5 w-3.5" />} label="Sleep" before={sleepBaseline} after={sleepProtocol} unit="%" higherIsBetter />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SHARED MICRO COMPONENTS
   ═══════════════════════════════════════════════════════ */

const WearableStat = ({
  icon, label, before, after, unit, higherIsBetter,
}: {
  icon: React.ReactNode; label: string; before: number; after: number; unit: string; higherIsBetter: boolean;
}) => {
  const pctChange = before !== 0 ? ((after - before) / before) * 100 : 0;
  const isImproved = higherIsBetter ? after > before * 1.02 : after < before * 0.98;
  const isWorsened = higherIsBetter ? after < before * 0.98 : after > before * 1.02;

  return (
    <div className="bg-muted/50 rounded-lg px-3 py-2 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">{before.toFixed(0)}{unit}</span>
        <span className="text-muted-foreground/50">→</span>
        <span className="font-mono text-xs text-foreground">{after.toFixed(0)}{unit}</span>
        {Math.abs(pctChange) >= 2 && (
          <span className={`text-[10px] font-mono px-1 py-0.5 rounded ${
            isImproved ? "bg-green-500/10 text-green-400" : isWorsened ? "bg-red-500/10 text-red-400" : "bg-muted text-muted-foreground"
          }`}>
            {pctChange > 0 ? "+" : ""}{pctChange.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
};

const DeltaBadge = ({ direction, pctChange }: { direction: string; pctChange: number }) => {
  if (direction === "improved") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">
        <TrendingDown className="h-3 w-3" />{Math.abs(pctChange).toFixed(1)}%
      </span>
    );
  }
  if (direction === "worsened") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
        <TrendingUp className="h-3 w-3" />{Math.abs(pctChange).toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
      <Minus className="h-3 w-3" />
    </span>
  );
};

export default ResultsTab;
