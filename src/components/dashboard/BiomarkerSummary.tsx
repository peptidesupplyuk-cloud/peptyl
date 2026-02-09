import { BIOMARKERS, getMarkerStatus, getStatusColor, getStatusBg } from "@/data/biomarker-ranges";
import { cn } from "@/lib/utils";
import type { BloodworkPanel } from "@/hooks/use-bloodwork";

const KEY_MARKERS = ["igf1", "total_testosterone", "hscrp", "hba1c", "vitamin_d", "fasting_glucose"];

const BiomarkerSummary = ({ panels }: { panels: BloodworkPanel[] }) => {
  const latest = panels[0];
  if (!latest) return null;

  const markerMap = Object.fromEntries(latest.markers.map((m) => [m.marker_name, m.value]));

  const displayMarkers = BIOMARKERS.filter(
    (b) => KEY_MARKERS.includes(b.key) && markerMap[b.key] !== undefined
  );

  if (displayMarkers.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <h2 className="font-heading font-semibold text-foreground">Latest Biomarkers</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayMarkers.map((marker) => {
          const value = markerMap[marker.key]!;
          const status = getMarkerStatus(marker, value);
          return (
            <div key={marker.key} className={cn("rounded-xl border p-3", getStatusBg(status))}>
              <p className="text-xs text-muted-foreground">{marker.name}</p>
              <p className={cn("text-xl font-heading font-bold mt-1", getStatusColor(status))}>
                {value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Optimal: {marker.optimalMin}–{marker.optimalMax} {marker.unit}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground">
        From test on {new Date(latest.test_date).toLocaleDateString()}
      </p>
    </div>
  );
};

export default BiomarkerSummary;
