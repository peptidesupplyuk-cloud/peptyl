import { BIOMARKERS, getMarkerStatus, type BiomarkerDef, type MarkerStatus } from "@/data/biomarker-ranges";
import { cn } from "@/lib/utils";
import type { BloodworkPanel } from "@/hooks/use-bloodwork";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, Minus, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY_MARKERS = [
  "igf1", "total_testosterone", "hscrp", "hba1c", "vitamin_d", "fasting_glucose",
];

const LOWER_IS_BETTER = new Set([
  "hscrp", "hba1c", "fasting_glucose", "alt", "ast", "triglycerides",
  "ldl", "homocysteine", "fasting_insulin", "tsh",
  "bp_systolic", "bp_diastolic", "resting_hr", "waist_cm", "body_fat_pct", "weight_kg",
]);

function getDelta(current: number, previous: number | undefined, key: string) {
  if (previous === undefined) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return { diff: 0, improving: true, label: "—" };
  const improving = LOWER_IS_BETTER.has(key) ? diff < 0 : diff > 0;
  const label = `${diff > 0 ? "+" : ""}${Number.isInteger(Math.abs(diff)) ? diff.toFixed(0) : diff.toFixed(1)}`;
  return { diff, improving, label };
}

function statusIcon(status: MarkerStatus) {
  switch (status) {
    case "optimal": return "✓";
    case "suboptimal": return "!";
    case "out_of_range": return "✗";
  }
}

const MarkerCard = ({
  marker,
  value,
  status,
  delta,
}: {
  marker: BiomarkerDef;
  value: number;
  status: MarkerStatus;
  delta: ReturnType<typeof getDelta>;
}) => {
  return (
    <div className={cn(
      "rounded-xl border p-3 space-y-1.5 transition-all",
      status === "optimal"
        ? "border-primary/30 bg-primary/5"
        : status === "suboptimal"
        ? "border-yellow-500/30 bg-yellow-500/5"
        : "border-destructive/30 bg-destructive/5"
    )}>
      {/* Top row: name + status dot */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-medium text-muted-foreground truncate">{marker.name}</span>
        <span className={cn(
          "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
          status === "optimal"
            ? "text-primary bg-primary/10"
            : status === "suboptimal"
            ? "text-yellow-600 bg-yellow-500/10"
            : "text-destructive bg-destructive/10"
        )}>
          {status === "optimal" ? "Good" : status === "suboptimal" ? "Low" : "Fix"}
        </span>
      </div>

      {/* Big value */}
      <div className="flex items-baseline gap-1.5">
        <span className={cn(
          "text-2xl font-heading font-bold tracking-tight",
          status === "optimal"
            ? "text-primary"
            : status === "suboptimal"
            ? "text-yellow-500"
            : "text-destructive"
        )}>
          {value}
        </span>
        <span className="text-[10px] text-muted-foreground">{marker.unit}</span>
      </div>

      {/* Optimal range + delta */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {marker.optimalMin}–{marker.optimalMax}
        </span>
        {delta && delta.diff !== 0 && (
          <span className={cn(
            "flex items-center gap-0.5 text-[10px] font-semibold",
            delta.improving ? "text-primary" : "text-destructive"
          )}>
            {delta.diff > 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
            {delta.label}
          </span>
        )}
        {delta && delta.diff === 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Minus className="h-2.5 w-2.5" /> —
          </span>
        )}
      </div>
    </div>
  );
};

interface BiomarkerSummaryProps {
  panels: BloodworkPanel[];
  onViewFullBloodwork?: () => void;
}

const BiomarkerSummary = ({ panels, onViewFullBloodwork }: BiomarkerSummaryProps) => {
  const latest = panels[0];
  if (!latest) return null;

  const previous = panels.length > 1 ? panels[1] : null;
  const previousMarkerMap = previous
    ? Object.fromEntries(previous.markers.map((m) => [m.marker_name, m.value]))
    : {};

  const latestMarkerMap = Object.fromEntries(latest.markers.map((m) => [m.marker_name, m.value]));

  const displayMarkers = BIOMARKERS.filter(
    (b) => KEY_MARKERS.includes(b.key) && latestMarkerMap[b.key] !== undefined
  );

  if (displayMarkers.length === 0) return null;

  const timeLabel = previous
    ? formatDistanceToNow(new Date(previous.test_date), { addSuffix: false })
    : null;

  // Count statuses for summary
  const statuses = displayMarkers.map(m => getMarkerStatus(m, latestMarkerMap[m.key]!));
  const optimalCount = statuses.filter(s => s === "optimal").length;

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-heading font-semibold text-foreground text-sm">What We're Fixing</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {optimalCount}/{displayMarkers.length} markers optimal
            {previous && <> · vs {timeLabel} ago</>}
          </p>
        </div>
        {previous && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
            <Clock className="h-2.5 w-2.5" />
            {panels.length} panels
          </span>
        )}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-2">
        {displayMarkers.map((marker) => {
          const value = latestMarkerMap[marker.key]!;
          const status = getMarkerStatus(marker, value);
          const delta = getDelta(value, previousMarkerMap[marker.key], marker.key);

          return (
            <MarkerCard
              key={marker.key}
              marker={marker}
              value={value}
              status={status}
              delta={delta}
            />
          );
        })}
      </div>

      {/* View full bloodwork button */}
      {onViewFullBloodwork && (
        <Button
          variant="outline"
          size="sm"
          onClick={onViewFullBloodwork}
          className="w-full text-xs gap-1.5 h-9 rounded-xl border-border hover:bg-muted/50"
        >
          View Full Bloodwork
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* Date footer */}
      <div className="text-[10px] text-muted-foreground text-center">
        Latest: {new Date(latest.test_date).toLocaleDateString()}
      </div>
    </div>
  );
};

export default BiomarkerSummary;
