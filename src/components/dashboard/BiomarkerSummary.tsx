import { BIOMARKERS, getMarkerStatus, type BiomarkerDef, type MarkerStatus } from "@/data/biomarker-ranges";
import { cn } from "@/lib/utils";
import type { BloodworkPanel } from "@/hooks/use-bloodwork";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ArrowUp, ArrowDown, Minus, Clock } from "lucide-react";

const KEY_MARKERS = [
  "igf1", "total_testosterone", "hscrp", "hba1c", "vitamin_d", "fasting_glucose",
  "weight_kg", "bp_systolic", "bp_diastolic", "resting_hr", "waist_cm", "body_fat_pct",
  "age", "height_cm",
];

const CATEGORY_GROUP: Record<string, string> = {
  Hormones: "Growth",
  Inflammation: "Inflammation",
  Metabolic: "Metabolic",
  Lipids: "Metabolic",
  Liver: "Metabolic",
  Kidney: "Metabolic",
  Vitamins: "Recovery",
  Thyroid: "Metabolic",
  "Body Composition": "Body",
  Cardiovascular: "Heart",
};

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
  const abs = Math.abs(diff);
  const label = `${diff > 0 ? "+" : ""}${Number.isInteger(abs) ? diff.toFixed(0) : diff.toFixed(1)}`;
  return { diff, improving, label };
}

/** Compute position % within the full reference range */
function rangePosition(value: number, marker: BiomarkerDef): number {
  const range = marker.refMax - marker.refMin;
  if (range <= 0) return 50;
  return Math.max(0, Math.min(100, ((value - marker.refMin) / range) * 100));
}

/** Compute the optimal zone left/width % within the full reference range */
function optimalZone(marker: BiomarkerDef): { left: number; width: number } {
  const range = marker.refMax - marker.refMin;
  if (range <= 0) return { left: 0, width: 100 };
  const left = ((marker.optimalMin - marker.refMin) / range) * 100;
  const width = ((marker.optimalMax - marker.optimalMin) / range) * 100;
  return { left, width };
}

function statusDotColor(status: MarkerStatus): string {
  switch (status) {
    case "optimal": return "bg-green-500";
    case "suboptimal": return "bg-yellow-500";
    case "out_of_range": return "bg-red-500";
  }
}

const MarkerBar = ({
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
  const pos = rangePosition(value, marker);
  const zone = optimalZone(marker);

  return (
    <div className="rounded-xl border border-border bg-card/60 px-4 py-3 space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("h-2 w-2 rounded-full shrink-0", statusDotColor(status))} />
          <span className="text-xs font-medium text-foreground truncate">{marker.name}</span>
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{marker.unit}</span>
      </div>

      {/* Range bar */}
      <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
        {/* Optimal zone highlight */}
        <div
          className="absolute top-0 h-full rounded-full bg-primary/20"
          style={{ left: `${zone.left}%`, width: `${zone.width}%` }}
        />
        {/* Current value marker */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-card shadow-md transition-all",
            status === "optimal" ? "bg-green-500" : status === "suboptimal" ? "bg-yellow-500" : "bg-red-500"
          )}
          style={{ left: `calc(${pos}% - 7px)` }}
        />
      </div>

      {/* Value + range labels */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className={cn(
            "text-base font-heading font-bold",
            status === "optimal" ? "text-green-500" : status === "suboptimal" ? "text-yellow-500" : "text-red-500"
          )}>
            {value}
          </span>
          <span className="text-[10px] text-muted-foreground">
            optimal {marker.optimalMin}–{marker.optimalMax}
          </span>
        </div>
        {delta && delta.diff !== 0 && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[10px] font-semibold",
              delta.improving ? "text-green-500" : "text-red-500"
            )}
          >
            {delta.diff > 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
            {delta.label}
          </span>
        )}
        {delta && delta.diff === 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <Minus className="h-2.5 w-2.5" /> No change
          </span>
        )}
      </div>
    </div>
  );
};

const BiomarkerSummary = ({ panels }: { panels: BloodworkPanel[] }) => {
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

  const grouped: Record<string, typeof displayMarkers> = {};
  for (const marker of displayMarkers) {
    const group = CATEGORY_GROUP[marker.category] || marker.category;
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(marker);
  }

  const timeLabel = previous
    ? formatDistanceToNow(new Date(previous.test_date), { addSuffix: false })
    : null;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-heading font-semibold text-foreground">What We're Fixing</h2>
        {previous && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 rounded-full px-2.5 py-1">
            <Clock className="h-3 w-3" />
            vs {timeLabel} ago
          </span>
        )}
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([group, markers]) => (
          <div key={group} className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{group}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {markers.map((marker) => {
                const value = latestMarkerMap[marker.key]!;
                const status = getMarkerStatus(marker, value);
                const delta = getDelta(value, previousMarkerMap[marker.key], marker.key);

                return (
                  <MarkerBar
                    key={marker.key}
                    marker={marker}
                    value={value}
                    status={status}
                    delta={delta}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground flex-wrap gap-1">
        <span>Latest: {new Date(latest.test_date).toLocaleDateString()}</span>
        {previous && (
          <span>Previous: {new Date(previous.test_date).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

export default BiomarkerSummary;
