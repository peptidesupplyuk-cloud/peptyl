import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardList, Activity, TrendingUp, TrendingDown, Minus, Users, Clock } from "lucide-react";
import { differenceInWeeks } from "date-fns";

interface OutcomeInsightsProps {
  reportId: string;
  genotypeKey: string | null;
}

interface OutcomeMarker {
  before: number;
  after: number;
  change: number;
  pct_change: number;
  direction: string;
}

const OutcomeInsights = ({ reportId, genotypeKey }: OutcomeInsightsProps) => {
  const { user } = useAuth();

  const { data: outcomeRecords = [] } = useQuery({
    queryKey: ["outcome_records", reportId, user?.id],
    enabled: !!user && !!reportId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outcome_records")
        .select("*")
        .eq("dna_report_id", reportId)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: communityData } = useQuery({
    queryKey: ["outcome_aggregates", genotypeKey],
    enabled: !!genotypeKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outcome_aggregates")
        .select("*")
        .eq("aggregation_genotype_key", genotypeKey!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const record = outcomeRecords[0];

  // STATE 1: No outcome records
  if (!record) {
    return (
      <div className="rounded-xl border border-dashed border-border/50 p-6 text-center space-y-3">
        <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground/50" />
        <h3 className="font-heading font-semibold text-foreground text-lg">Track Your Results</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Complete your protocol and log a retest to see exactly what changed.
        </p>
        <Button variant="ghost" asChild className="text-primary">
          <Link to="/dashboard">View My Protocols</Link>
        </Button>
      </div>
    );
  }

  // STATE 2: In progress
  if (record.status === "in_progress" || record.status === "baseline_only") {
    const weeksActive = record.protocol_start_date
      ? differenceInWeeks(new Date(), new Date(record.protocol_start_date))
      : 0;
    const progressPct = Math.min((weeksActive / 10) * 100, 100);

    return (
      <div className="rounded-xl border border-border/30 bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="font-heading font-semibold text-foreground text-sm">
            Protocol in progress · Week {weeksActive}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {record.avg_hrv_baseline != null && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            Avg HRV: <span className="font-mono text-foreground">{Number(record.avg_hrv_baseline).toFixed(0)}</span> bpm
          </div>
        )}
        <p className="text-xs text-muted-foreground">Your week 10 retest reminder is scheduled</p>
        <Button variant="ghost" size="sm" asChild className="text-primary text-xs h-7">
          <Link to="/dashboard?tab=bloodwork&retest=true">Log retest early</Link>
        </Button>
      </div>
    );
  }

  // STATE 3: Completed
  const rawMarkers = record.outcome_markers;
  const outcomeMarkers: Record<string, OutcomeMarker> =
    rawMarkers && typeof rawMarkers === "object" && !Array.isArray(rawMarkers)
      ? (rawMarkers as unknown as Record<string, OutcomeMarker>)
      : {};
  const markerEntries = Object.entries(outcomeMarkers).filter(
    ([, m]) => m && typeof m === "object",
  );

  const responderLabel =
    record.overall_responder_status === "strong_responder"
      ? "Strong Responder"
      : record.overall_responder_status === "responder"
      ? "Responder"
      : "Non Responder";

  const responderColor =
    record.overall_responder_status === "strong_responder"
      ? "bg-primary/20 text-primary border-primary/30"
      : record.overall_responder_status === "responder"
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-muted text-muted-foreground border-border";

  const hrvImproved =
    record.avg_hrv_protocol != null &&
    record.avg_hrv_baseline != null &&
    Number(record.avg_hrv_protocol) > Number(record.avg_hrv_baseline) * 1.05;
  const hrvPctChange =
    hrvImproved && Number(record.avg_hrv_baseline) > 0
      ? (((Number(record.avg_hrv_protocol) - Number(record.avg_hrv_baseline)) / Number(record.avg_hrv_baseline)) * 100).toFixed(0)
      : null;

  const sampleSize = communityData?.sample_size ? Number(communityData.sample_size) : 0;

  const humanizeMarker = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-4">
      {/* Part A: Your Results */}
      <div className="rounded-xl border border-border/30 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-foreground">Your Results</h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${responderColor}`}>
            {responderLabel}
          </span>
        </div>

        <div className="space-y-1.5">
          {markerEntries.map(([key, m]) => (
            <div key={key} className="flex items-center justify-between text-sm py-1.5 border-b border-border/10 last:border-0">
              <span className="text-muted-foreground">{humanizeMarker(key)}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{m.before}</span>
                <span className="text-muted-foreground/50">→</span>
                <span className="font-mono text-xs text-foreground">{m.after}</span>
                <DeltaBadge direction={m.direction} pctChange={m.pct_change} />
              </div>
            </div>
          ))}
        </div>

        {hrvImproved && hrvPctChange && (
          <div className="flex items-center gap-2 text-xs bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground">HRV improved <span className="font-mono text-primary">{hrvPctChange}%</span></span>
            <span className="text-muted-foreground ml-auto text-[10px]">Whoop</span>
          </div>
        )}
      </div>

      {/* Part B: Community Insights */}
      {sampleSize >= 5 ? (
        <div className="rounded-xl border border-border/30 bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold text-foreground text-sm">
              {sampleSize} people with your genetic profile completed this protocol
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            {communityData?.avg_homocysteine_change != null && (
              <StatRow label="Avg homocysteine change" value={`${communityData.avg_homocysteine_change}%`} />
            )}
            {communityData?.responder_count != null && (
              <StatRow
                label="Responder rate"
                value={`${Math.round((Number(communityData.responder_count) / sampleSize) * 100)}%`}
              />
            )}
            {communityData?.avg_weeks != null && (
              <StatRow label="Average time" value={`${communityData.avg_weeks} weeks`} />
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/30 bg-card/50 p-5 opacity-50 space-y-2 text-center">
          <Users className="h-5 w-5 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {5 - sampleSize} more completion{5 - sampleSize !== 1 ? "s" : ""} needed to unlock community insights
          </p>
          <p className="text-xs text-muted-foreground/70">
            Your anonymised results will contribute to this data.
          </p>
        </div>
      )}
    </div>
  );
};

const DeltaBadge = ({ direction, pctChange }: { direction: string; pctChange: number }) => {
  if (direction === "improved") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">
        <TrendingDown className="h-3 w-3" />
        {Math.abs(pctChange).toFixed(1)}%
      </span>
    );
  }
  if (direction === "worsened") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
        <TrendingUp className="h-3 w-3" />
        {Math.abs(pctChange).toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
      <Minus className="h-3 w-3" />
    </span>
  );
};

const StatRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-mono text-foreground">{value}</span>
  </div>
);

export default OutcomeInsights;
