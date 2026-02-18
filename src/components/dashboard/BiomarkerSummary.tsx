import { BIOMARKERS, getMarkerStatus, getStatusColor, getStatusBg } from "@/data/biomarker-ranges";
import { cn } from "@/lib/utils";
import type { BloodworkPanel } from "@/hooks/use-bloodwork";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ArrowUp, ArrowDown, Minus, Clock } from "lucide-react";

const KEY_MARKERS = [
  "igf1", "total_testosterone", "hscrp", "hba1c", "vitamin_d", "fasting_glucose",
  "weight_kg", "bp_systolic", "bp_diastolic", "resting_hr", "waist_cm", "body_fat_pct",
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

/** Lower-is-better markers where a decrease = improvement */
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

  const daysSincePrevious = previous
    ? differenceInDays(new Date(latest.test_date), new Date(previous.test_date))
    : null;

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

      <div className="space-y-3">
        {Object.entries(grouped).map(([group, markers]) => (
          <div key={group} className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{group}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {markers.map((marker) => {
                const value = latestMarkerMap[marker.key]!;
                const status = getMarkerStatus(marker, value);
                const delta = getDelta(value, previousMarkerMap[marker.key], marker.key);

                return (
                  <div key={marker.key} className={cn("rounded-lg border px-3 py-2", getStatusBg(status))}>
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="text-[11px] text-muted-foreground truncate">{marker.name}</p>
                      <p className="text-[10px] text-muted-foreground whitespace-nowrap">{marker.unit}</p>
                    </div>
                    <p className={cn("text-lg font-heading font-bold leading-tight", getStatusColor(status))}>
                      {value}
                    </p>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className="text-[10px] text-muted-foreground">
                        {marker.optimalMin}–{marker.optimalMax}
                      </p>
                      {delta && delta.diff !== 0 && (
                        <span
                          className={cn(
                            "flex items-center gap-0.5 text-[10px] font-semibold",
                            delta.improving ? "text-green-500" : "text-red-500"
                          )}
                        >
                          {delta.diff > 0 ? (
                            <ArrowUp className="h-2.5 w-2.5" />
                          ) : (
                            <ArrowDown className="h-2.5 w-2.5" />
                          )}
                          {delta.label}
                        </span>
                      )}
                      {delta && delta.diff === 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Minus className="h-2.5 w-2.5" />
                          No change
                        </span>
                      )}
                    </div>
                  </div>
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
