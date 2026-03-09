import { useState } from "react";
import { BIOMARKERS, getMarkerStatus, type BiomarkerDef, type MarkerStatus } from "@/data/biomarker-ranges";
import { cn } from "@/lib/utils";
import type { BloodworkPanel } from "@/hooks/use-bloodwork";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, ChevronRight, Info } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import BiomarkerTrendChart from "./BiomarkerTrendChart";

/* ── config ─────────────────────────────────────────────── */

const KEY_MARKERS = [
  "igf1", "total_testosterone", "hscrp", "hba1c", "vitamin_d", "fasting_glucose",
];

const ALL_TRACKED = [
  "igf1", "total_testosterone", "hscrp", "hba1c", "vitamin_d", "fasting_glucose",
  "weight_kg", "bp_systolic", "bp_diastolic", "resting_hr", "waist_cm", "body_fat_pct",
  "total_cholesterol", "ldl", "hdl", "triglycerides", "alt", "ast",
  "creatinine", "egfr", "fasting_insulin", "tsh", "free_t3", "free_t4",
  "free_testosterone", "shbg", "estradiol", "cortisol_am", "dhea_s",
  "homocysteine", "ferritin",
];

const LOWER_IS_BETTER = new Set([
  "hscrp", "hba1c", "fasting_glucose", "alt", "ast", "triglycerides",
  "ldl", "homocysteine", "fasting_insulin", "tsh",
  "bp_systolic", "bp_diastolic", "resting_hr", "waist_cm", "body_fat_pct", "weight_kg",
]);

const CATEGORY_GROUP: Record<string, string> = {
  Hormones: "Hormones", Inflammation: "Inflammation", Metabolic: "Metabolic",
  Lipids: "Lipids", Liver: "Liver", Kidney: "Kidney", Vitamins: "Vitamins",
  Thyroid: "Thyroid", "Body Composition": "Body", Cardiovascular: "Cardio",
};

/* ── helpers ────────────────────────────────────────────── */

function getDelta(current: number, previous: number | undefined, key: string) {
  if (previous === undefined) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return { diff: 0, improving: true, label: "—" };
  const improving = LOWER_IS_BETTER.has(key) ? diff < 0 : diff > 0;
  const label = `${diff > 0 ? "+" : ""}${Number.isInteger(Math.abs(diff)) ? diff.toFixed(0) : diff.toFixed(1)}`;
  return { diff, improving, label };
}

function rangePosition(value: number, marker: BiomarkerDef): number {
  const range = marker.refMax - marker.refMin;
  if (range <= 0) return 50;
  return Math.max(0, Math.min(100, ((value - marker.refMin) / range) * 100));
}

/* ── SVG ring score ─────────────────────────────────────── */

const ScoreRing = ({ score, total, improving }: { score: number; total: number; improving: number }) => {
  const pct = total > 0 ? score / total : 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="130" height="130" viewBox="0 0 120 120" className="transform -rotate-90">
        {/* track */}
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        {/* progress */}
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-heading font-bold text-foreground tracking-tight">
          {score}/{total}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium">optimal</span>
      </div>
    </div>
  );
};

/* ── marker descriptions ─────────────────────────────────── */

const MARKER_DESCRIPTIONS: Record<string, string> = {
  igf1: "Measures growth hormone activity. Affects metabolism, recovery and muscle growth.",
  total_testosterone: "Key hormone for energy, mood, muscle mass and overall vitality.",
  hscrp: "Measures systemic inflammation. Lower is better for heart and metabolic health.",
  hba1c: "Average blood sugar over ~3 months. Key indicator of metabolic health.",
  vitamin_d: "Essential for immunity, bone health and mood. Most people are deficient.",
  fasting_glucose: "Blood sugar after fasting. Indicates how well your body manages energy.",
  weight_kg: "Body weight. Tracked over time to monitor composition changes.",
  bp_systolic: "Top blood pressure number. Reflects arterial pressure when heart beats.",
  bp_diastolic: "Bottom blood pressure number. Reflects arterial pressure between beats.",
  resting_hr: "Heart rate at rest. Lower generally indicates better cardiovascular fitness.",
  waist_cm: "Waist circumference. A key indicator of visceral fat and metabolic risk.",
  body_fat_pct: "Percentage of body weight that is fat tissue.",
  total_cholesterol: "Total blood cholesterol. Context matters more than the raw number.",
  ldl: "Often called 'bad' cholesterol. High levels increase cardiovascular risk.",
  hdl: "Often called 'good' cholesterol. Higher levels are protective.",
  triglycerides: "Blood fats linked to diet. High levels increase heart disease risk.",
  alt: "Liver enzyme. Elevated levels may indicate liver stress or damage.",
  ast: "Liver enzyme. Often checked alongside ALT for liver health.",
  creatinine: "Waste product filtered by kidneys. Indicates kidney function.",
  egfr: "Estimated kidney filtration rate. Higher is better.",
  fasting_insulin: "Insulin after fasting. High levels suggest insulin resistance.",
  tsh: "Thyroid-stimulating hormone. Indicates how well your thyroid is functioning.",
  free_t3: "Active thyroid hormone. Drives metabolism and energy levels.",
  free_t4: "Thyroid hormone precursor. Converted to active T3 in the body.",
  free_testosterone: "Unbound testosterone available for use. More relevant than total.",
  shbg: "Binds sex hormones. High levels reduce free testosterone availability.",
  estradiol: "Primary estrogen. Important for bone health, mood and hormonal balance.",
  cortisol_am: "Morning stress hormone. Should be highest in the AM, then taper.",
  dhea_s: "Precursor to sex hormones. Declines with age, linked to vitality.",
  homocysteine: "Amino acid linked to inflammation. High levels increase heart risk.",
  ferritin: "Iron storage marker. Low = fatigue; very high = inflammation risk.",
};

function getStatusLabel(status: MarkerStatus, value: number, marker: BiomarkerDef): string {
  if (status === "optimal") return "Good";
  if (status === "suboptimal") {
    return value < marker.optimalMin ? "Low" : "High";
  }
  return value < marker.refMin ? "Low" : "High";
}

/* ── compact marker pill (summary card) ─────────────────── */

const MarkerPill = ({
  marker, value, status, delta,
}: {
  marker: BiomarkerDef; value: number; status: MarkerStatus;
  delta: ReturnType<typeof getDelta>;
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const pos = rangePosition(value, marker);
  const optLeft = ((marker.optimalMin - marker.refMin) / (marker.refMax - marker.refMin)) * 100;
  const optWidth = ((marker.optimalMax - marker.optimalMin) / (marker.refMax - marker.refMin)) * 100;
  const statusLabel = getStatusLabel(status, value, marker);

  return (
    <div className="py-3.5 border-b border-border/50 last:border-b-0 space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-foreground truncate">{marker.name}</span>
          {MARKER_DESCRIPTIONS[marker.key] && (
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Info about ${marker.name}`}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className={cn(
              "text-base font-heading font-bold leading-none",
              status === "optimal" ? "text-primary" : status === "suboptimal" ? "text-[hsl(var(--warm))]" : "text-destructive"
            )}>
              {value}
            </span>
            <span className="text-[9px] text-muted-foreground/70 ml-1">{marker.unit}</span>
          </div>
          {/* Status badge */}
          <span className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
            status === "optimal"
              ? "bg-primary/15 text-primary"
              : status === "suboptimal"
                ? "bg-[hsl(var(--warm))]/15 text-[hsl(var(--warm))]"
                : "bg-destructive/15 text-destructive"
          )}>
            {statusLabel}
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
        </div>
      </div>

      {/* Info tooltip */}
      {showInfo && MARKER_DESCRIPTIONS[marker.key] && (
        <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 leading-relaxed">
          {MARKER_DESCRIPTIONS[marker.key]}
        </p>
      )}

      {/* Range bar */}
      <div className="relative h-2.5 bg-muted/40 rounded-full overflow-hidden">
        {/* Optimal zone — bright & glowing */}
        <div
          className="absolute top-0 h-full rounded-full bg-primary/30"
          style={{
            left: `${optLeft}%`,
            width: `${optWidth}%`,
            boxShadow: "0 0 8px hsl(var(--primary) / 0.2)",
          }}
        />
        {/* Value dot */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-card shadow-md transition-all",
            status === "optimal" ? "bg-primary" : status === "suboptimal" ? "bg-[hsl(var(--warm))]" : "bg-destructive"
          )}
          style={{
            left: `calc(${pos}% - 7px)`,
            boxShadow: `0 0 6px ${status === "optimal" ? "hsl(var(--primary) / 0.5)" : status === "suboptimal" ? "hsl(var(--warm) / 0.5)" : "hsl(var(--destructive) / 0.5)"}`,
          }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10px] text-muted-foreground/80 font-medium">{marker.refMin}</span>
        <span className="text-[10px] text-primary font-semibold">{marker.optimalMin}–{marker.optimalMax} optimal</span>
        <span className="text-[10px] text-muted-foreground/80 font-medium">{marker.refMax}</span>
      </div>
    </div>
  );
};

/* ── full bloodwork row inside drawer ───────────────────── */

const FullMarkerRow = ({
  marker, value, status, delta,
}: {
  marker: BiomarkerDef; value: number; status: MarkerStatus;
  delta: ReturnType<typeof getDelta>;
}) => {
  const pos = rangePosition(value, marker);
  const optLeft = ((marker.optimalMin - marker.refMin) / (marker.refMax - marker.refMin)) * 100;
  const optWidth = ((marker.optimalMax - marker.optimalMin) / (marker.refMax - marker.refMin)) * 100;

  return (
    <div className="space-y-1.5 py-3 border-b border-border/40 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "h-2 w-2 rounded-full shrink-0",
            status === "optimal" ? "bg-primary" : status === "suboptimal" ? "bg-[hsl(var(--warm))]" : "bg-destructive"
          )} />
          <span className="text-xs font-medium text-foreground truncate">{marker.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            "text-sm font-heading font-bold",
            status === "optimal" ? "text-primary" : status === "suboptimal" ? "text-[hsl(var(--warm))]" : "text-destructive"
          )}>
            {value}
          </span>
          <span className="text-[10px] text-muted-foreground">{marker.unit}</span>
          {delta && delta.diff !== 0 && (
            <span className={cn(
              "flex items-center gap-0.5 text-[10px] font-semibold",
              delta.improving ? "text-primary" : "text-destructive"
            )}>
              {delta.diff > 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
              {delta.label}
            </span>
          )}
        </div>
      </div>
      {/* Range bar */}
      <div className="relative h-2 bg-muted/60 rounded-full overflow-hidden">
        <div
          className="absolute top-0 h-full rounded-full bg-primary/15"
          style={{ left: `${optLeft}%`, width: `${optWidth}%` }}
        />
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-card shadow-sm",
            status === "optimal" ? "bg-primary" : status === "suboptimal" ? "bg-[hsl(var(--warm))]" : "bg-destructive"
          )}
          style={{ left: `calc(${pos}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground px-0.5">
        <span>{marker.refMin}</span>
        <span className="text-primary/70">{marker.optimalMin}–{marker.optimalMax}</span>
        <span>{marker.refMax}</span>
      </div>
    </div>
  );
};

/* ── main component ─────────────────────────────────────── */

interface BiomarkerSummaryProps {
  panels: BloodworkPanel[];
  onViewFullBloodwork?: () => void;
}

const BiomarkerSummary = ({ panels }: BiomarkerSummaryProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const latest = panels[0];
  if (!latest) return null;

  const previous = panels.length > 1 ? panels[1] : null;
  const prevMap = previous
    ? Object.fromEntries(previous.markers.map((m) => [m.marker_name, m.value]))
    : {};
  const latestMap = Object.fromEntries(latest.markers.map((m) => [m.marker_name, m.value]));

  // Summary markers (hero card)
  const summaryMarkers = BIOMARKERS.filter(
    (b) => KEY_MARKERS.includes(b.key) && latestMap[b.key] !== undefined
  );
  if (summaryMarkers.length === 0) return null;

  const statuses = summaryMarkers.map(m => getMarkerStatus(m, latestMap[m.key]!));
  const optimalCount = statuses.filter(s => s === "optimal").length;
  const improvingCount = summaryMarkers.filter(m => {
    const d = getDelta(latestMap[m.key]!, prevMap[m.key], m.key);
    return d && d.improving && d.diff !== 0;
  }).length;

  // All available markers (drawer)
  const allMarkers = BIOMARKERS.filter(
    (b) => ALL_TRACKED.includes(b.key) && latestMap[b.key] !== undefined
  );
  const grouped: Record<string, typeof allMarkers> = {};
  for (const m of allMarkers) {
    const g = CATEGORY_GROUP[m.category] || m.category;
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(m);
  }

  const timeLabel = previous
    ? formatDistanceToNow(new Date(previous.test_date), { addSuffix: false })
    : null;

  return (
    <>
      {/* ── HERO SUMMARY CARD ── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Top section: ring + stats */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-5">
            {/* Score ring */}
            <ScoreRing score={optimalCount} total={summaryMarkers.length} improving={improvingCount} />

            {/* Right side info */}
            <div className="flex-1 space-y-2">
              <h2 className="font-heading font-semibold text-foreground text-sm">Biomarker Status</h2>
              {previous && (
                <p className="text-[10px] text-muted-foreground">
                  vs {timeLabel} ago · {improvingCount} improving
                </p>
              )}
              
            </div>
          </div>
        </div>

        {/* Marker list */}
        <div className="px-5 pb-2">
          {summaryMarkers.map((marker) => {
            const value = latestMap[marker.key]!;
            const status = getMarkerStatus(marker, value);
            const delta = getDelta(value, prevMap[marker.key], marker.key);
            return <MarkerPill key={marker.key} marker={marker} value={value} status={status} delta={delta} />;
          })}
        </div>

        {/* CTA button */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-primary hover:bg-muted/40 transition-colors border-t border-border">
              View Full Bloodwork
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[92vh]">
            <div className="overflow-y-auto px-5 pb-8 pt-2">
              <DrawerTitle className="font-heading font-semibold text-foreground text-base mb-1">
                Full Bloodwork
              </DrawerTitle>
              <p className="text-[11px] text-muted-foreground mb-4">
                {new Date(latest.test_date).toLocaleDateString()} · {allMarkers.length} markers tracked
                {previous && ` · vs ${timeLabel} ago`}
              </p>

              {/* Grouped markers with range bars */}
              {Object.entries(grouped).map(([group, markers]) => (
                <div key={group} className="mb-4">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{group}</p>
                  {markers.map((marker) => {
                    const value = latestMap[marker.key]!;
                    const status = getMarkerStatus(marker, value);
                    const delta = getDelta(value, prevMap[marker.key], marker.key);
                    return <FullMarkerRow key={marker.key} marker={marker} value={value} status={status} delta={delta} />;
                  })}
                </div>
              ))}

              {/* Trend chart */}
              {panels.length > 1 && (
                <div className="mt-4">
                  <BiomarkerTrendChart panels={panels} />
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};

export default BiomarkerSummary;
