import { useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { differenceInWeeks } from "date-fns";
import type { BloodworkPanel } from "@/hooks/use-bloodwork";
import { BIOMARKERS } from "@/data/biomarker-ranges";

interface ProtocolOutcomeCardProps {
  baselinePanel: BloodworkPanel;
  retestPanel: BloodworkPanel;
  protocolName: string;
}

interface MarkerDelta {
  name: string;
  baselineValue: number;
  retestValue: number;
  unit: string;
  pctChange: number;
  direction: "improved" | "worsened" | "unchanged";
}

const ProtocolOutcomeCard = ({ baselinePanel, retestPanel, protocolName }: ProtocolOutcomeCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const weeks = differenceInWeeks(new Date(retestPanel.test_date), new Date(baselinePanel.test_date));

  // Match markers present in both panels
  const deltas: MarkerDelta[] = [];
  for (const retestMarker of retestPanel.markers) {
    const baselineMarker = baselinePanel.markers.find((m) => m.marker_name === retestMarker.marker_name);
    if (!baselineMarker || baselineMarker.value == null || retestMarker.value == null) continue;

    const bv = Number(baselineMarker.value);
    const rv = Number(retestMarker.value);
    const pctChange = bv !== 0 ? Number((((rv - bv) / bv) * 100).toFixed(1)) : 0;

    let direction: MarkerDelta["direction"] = "unchanged";
    if (Math.abs(pctChange) >= 2) {
      const biomarkerDef = BIOMARKERS.find((b) => b.key === retestMarker.marker_name || b.name === retestMarker.marker_name);
      if (biomarkerDef) {
        const optimalMid = (biomarkerDef.optimalMin + biomarkerDef.optimalMax) / 2;
        const baselineDist = Math.abs(bv - optimalMid);
        const retestDist = Math.abs(rv - optimalMid);
        direction = retestDist < baselineDist ? "improved" : "worsened";
      } else {
        direction = pctChange > 0 ? "improved" : "worsened";
      }
    }

    deltas.push({
      name: retestMarker.marker_name,
      baselineValue: bv,
      retestValue: rv,
      unit: retestMarker.unit,
      pctChange,
      direction,
    });
  }

  // Sort: improved first, then unchanged, then worsened
  const sortOrder = { improved: 0, unchanged: 1, worsened: 2 };
  deltas.sort((a, b) => sortOrder[a.direction] - sortOrder[b.direction]);

  const visibleDeltas = expanded ? deltas : deltas.slice(0, 6);
  const hasMore = deltas.length > 6;

  return (
    <div className="rounded-xl border border-border/30 bg-card p-4 sm:p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <h4 className="font-heading font-semibold text-foreground text-sm">{protocolName}</h4>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
            Completed
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(baselinePanel.test_date).toLocaleDateString()} → {new Date(retestPanel.test_date).toLocaleDateString()} ({weeks} week{weeks !== 1 ? "s" : ""})
        </span>
      </div>

      {/* Marker rows */}
      <div className="space-y-1">
        {visibleDeltas.map((d) => {
          const displayName = BIOMARKERS.find((b) => b.key === d.name)?.name ?? d.name.replace(/_/g, " ");
          return (
            <div key={d.name} className="flex items-center justify-between text-sm py-1.5 border-b border-border/10 last:border-0">
              <span className="text-muted-foreground capitalize text-xs">{displayName}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {d.baselineValue} {d.unit}
                </span>
                <span className="text-muted-foreground/50">→</span>
                <span className="font-mono text-xs text-foreground">
                  {d.retestValue} {d.unit}
                </span>
                <DeltaBadge direction={d.direction} pctChange={d.pctChange} />
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary flex items-center gap-1 hover:underline"
        >
          {expanded ? (
            <>Show less <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>View all {deltas.length} markers <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      )}

      {/* Footer */}
      <div className="pt-1">
        <Link to="/dna/dashboard" className="text-xs text-primary hover:underline">
          View full analysis on your DNA report →
        </Link>
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

export default ProtocolOutcomeCard;
