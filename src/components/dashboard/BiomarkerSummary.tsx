import { BIOMARKERS, getMarkerStatus, getStatusColor, getStatusBg } from "@/data/biomarker-ranges";
import { cn } from "@/lib/utils";
import type { BloodworkPanel } from "@/hooks/use-bloodwork";

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

const BiomarkerSummary = ({ panels }: { panels: BloodworkPanel[] }) => {
  const latest = panels[0];
  if (!latest) return null;

  const markerMap = Object.fromEntries(latest.markers.map((m) => [m.marker_name, m.value]));

  const displayMarkers = BIOMARKERS.filter(
    (b) => KEY_MARKERS.includes(b.key) && markerMap[b.key] !== undefined
  );

  if (displayMarkers.length === 0) return null;

  const grouped: Record<string, typeof displayMarkers> = {};
  for (const marker of displayMarkers) {
    const group = CATEGORY_GROUP[marker.category] || marker.category;
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(marker);
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
      <h2 className="font-heading font-semibold text-foreground">What We're Fixing</h2>
      <div className="space-y-3">
        {Object.entries(grouped).map(([group, markers]) => (
          <div key={group} className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{group}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {markers.map((marker) => {
                const value = markerMap[marker.key]!;
                const status = getMarkerStatus(marker, value);
                return (
                  <div key={marker.key} className={cn("rounded-lg border px-3 py-2", getStatusBg(status))}>
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="text-[11px] text-muted-foreground truncate">{marker.name}</p>
                      <p className="text-[10px] text-muted-foreground whitespace-nowrap">{marker.unit}</p>
                    </div>
                    <p className={cn("text-lg font-heading font-bold leading-tight", getStatusColor(status))}>
                      {value}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {marker.optimalMin}–{marker.optimalMax}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">
        From test on {new Date(latest.test_date).toLocaleDateString()}
      </p>
    </div>
  );
};

export default BiomarkerSummary;
