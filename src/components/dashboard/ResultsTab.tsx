import { useMemo } from "react";
import { useProtocols } from "@/hooks/use-protocols";
import { useBloodworkPanels, type BloodworkPanel } from "@/hooks/use-bloodwork";
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
} from "lucide-react";
import { differenceInWeeks } from "date-fns";
import { useState } from "react";

interface MarkerDelta {
  name: string;
  displayName: string;
  before: number;
  after: number;
  unit: string;
  pctChange: number;
  direction: "improved" | "worsened" | "unchanged";
}

const ResultsTab = () => {
  const { user } = useAuth();
  const { data: protocols = [] } = useProtocols();
  const { data: panels = [] } = useBloodworkPanels();

  // Fetch all outcome records for completed protocols
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

  // Fetch wearable data for protocol periods
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

  const completedProtocols = protocols.filter((p) => p.status === "completed");
  const completedRecords = outcomeRecords.filter((r) => r.status === "completed");

  // No completed protocols at all
  if (completedProtocols.length === 0 && completedRecords.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
        <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/50" />
        <h3 className="font-heading font-semibold text-foreground text-lg">No Results Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Complete a protocol and log your retest bloodwork to see your past vs now comparison here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {completedRecords.map((record) => {
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

      {/* Completed protocols WITHOUT outcome records (no retest yet) */}
      {completedProtocols
        .filter((p) => !outcomeRecords.some((r) => r.protocol_id === p.id))
        .map((p) => (
          <div key={p.id} className="bg-card rounded-2xl border border-border/30 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-heading font-semibold text-foreground text-sm">{p.name}</h4>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Awaiting retest
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Log your retest bloods in the Results tab to see your before vs after comparison.
            </p>
          </div>
        ))}
    </div>
  );
};

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

  // Wearable deltas
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
      {/* Header */}
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
              <BarChart3 className="h-3 w-3" />
              {adherence}% adherence
            </span>
          )}
        </div>
      </div>

      {/* Summary strip */}
      {deltas.length > 0 && (
        <div className="flex items-center gap-4 text-xs">
          {improved.length > 0 && (
            <span className="flex items-center gap-1 text-green-400">
              <TrendingDown className="h-3 w-3" />
              {improved.length} improved
            </span>
          )}
          {worsened.length > 0 && (
            <span className="flex items-center gap-1 text-red-400">
              <TrendingUp className="h-3 w-3" />
              {worsened.length} need attention
            </span>
          )}
          {unchanged.length > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Minus className="h-3 w-3" />
              {unchanged.length} stable
            </span>
          )}
        </div>
      )}

      {/* Bloodwork markers */}
      {deltas.length > 0 ? (
        <div className="space-y-1">
          {visibleDeltas.map((d) => (
            <div
              key={d.name}
              className="flex items-center justify-between text-sm py-1.5 border-b border-border/10 last:border-0"
            >
              <span className="text-muted-foreground capitalize text-xs">{d.displayName}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {d.before} {d.unit}
                </span>
                <span className="text-muted-foreground/50">→</span>
                <span className="font-mono text-xs text-foreground">
                  {d.after} {d.unit}
                </span>
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
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary flex items-center gap-1 hover:underline"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              View all {deltas.length} markers <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}

      {/* Wearable data */}
      {hasWearableData && (
        <div className="border-t border-border/20 pt-4 space-y-2">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Wearable Changes
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {hrvBaseline != null && hrvProtocol != null && (
              <WearableStat
                icon={<Activity className="h-3.5 w-3.5" />}
                label="HRV"
                before={hrvBaseline}
                after={hrvProtocol}
                unit="ms"
                higherIsBetter
              />
            )}
            {recoveryBaseline != null && recoveryProtocol != null && (
              <WearableStat
                icon={<Heart className="h-3.5 w-3.5" />}
                label="Recovery"
                before={recoveryBaseline}
                after={recoveryProtocol}
                unit="%"
                higherIsBetter
              />
            )}
            {sleepBaseline != null && sleepProtocol != null && (
              <WearableStat
                icon={<Moon className="h-3.5 w-3.5" />}
                label="Sleep"
                before={sleepBaseline}
                after={sleepProtocol}
                unit="%"
                higherIsBetter
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const WearableStat = ({
  icon,
  label,
  before,
  after,
  unit,
  higherIsBetter,
}: {
  icon: React.ReactNode;
  label: string;
  before: number;
  after: number;
  unit: string;
  higherIsBetter: boolean;
}) => {
  const pctChange = before !== 0 ? ((after - before) / before) * 100 : 0;
  const isImproved = higherIsBetter ? after > before * 1.02 : after < before * 0.98;
  const isWorsened = higherIsBetter ? after < before * 0.98 : after > before * 1.02;

  return (
    <div className="bg-muted/50 rounded-lg px-3 py-2 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {before.toFixed(0)}{unit}
        </span>
        <span className="text-muted-foreground/50">→</span>
        <span className="font-mono text-xs text-foreground">
          {after.toFixed(0)}{unit}
        </span>
        {Math.abs(pctChange) >= 2 && (
          <span
            className={`text-[10px] font-mono px-1 py-0.5 rounded ${
              isImproved
                ? "bg-green-500/10 text-green-400"
                : isWorsened
                ? "bg-red-500/10 text-red-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {pctChange > 0 ? "+" : ""}
            {pctChange.toFixed(0)}%
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

export default ResultsTab;
