import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BIOMARKERS, type BiomarkerDef } from "@/data/biomarker-ranges";
import type { BloodworkPanel } from "@/hooks/use-bloodwork";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";

interface Props {
  panels: BloodworkPanel[];
  filterCategories?: string[];
}

const BiomarkerTrendChart = ({ panels, filterCategories }: Props) => {
  const availableMarkers = BIOMARKERS.filter((b) => {
    if (filterCategories && !filterCategories.includes(b.category)) return false;
    return panels.some((p) => p.markers.some((m) => m.marker_name === b.key));
  });
  const [selectedKey, setSelectedKey] = useState(availableMarkers[0]?.key || "");

  if (availableMarkers.length === 0 || panels.length === 0) return null;

  const marker: BiomarkerDef = availableMarkers.find((m) => m.key === selectedKey) || availableMarkers[0];

  const data = [...panels]
    .reverse()
    .map((p) => {
      const found = p.markers.find((m) => m.marker_name === marker.key);
      return found
        ? { date: format(new Date(p.test_date), "MMM d, yy"), value: found.value, rawDate: p.test_date }
        : null;
    })
    .filter(Boolean) as { date: string; value: number; rawDate: string }[];

  if (data.length === 0) return null;

  const allValues = data.map((d) => d.value);
  const yMin = Math.min(marker.refMin * 0.8, ...allValues) * 0.9;
  const yMax = Math.max(marker.refMax * 1.1, ...allValues) * 1.1;

  const latestValue = data[data.length - 1]?.value;
  const previousValue = data.length > 1 ? data[data.length - 2]?.value : null;
  const trend = previousValue !== null ? latestValue - previousValue : null;
  const isImproving =
    trend !== null &&
    ((latestValue >= marker.optimalMin && latestValue <= marker.optimalMax) ||
      Math.abs(latestValue - (marker.optimalMin + marker.optimalMax) / 2) <
        Math.abs(previousValue! - (marker.optimalMin + marker.optimalMax) / 2));

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">Biomarker Trends</h2>
        </div>
        <Select value={selectedKey} onValueChange={setSelectedKey}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableMarkers.map((m) => (
              <SelectItem key={m.key} value={m.key}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/30" /> Optimal ({marker.optimalMin}–{marker.optimalMax} {marker.unit})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-yellow-500/20 border border-yellow-500/30" /> Reference ({marker.refMin}–{marker.refMax} {marker.unit})
        </span>
        {trend !== null && (
          <span className={`flex items-center gap-1 font-medium ${isImproving ? "text-green-500" : "text-red-500"}`}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)} {marker.unit} {isImproving ? "(improving)" : "(declining)"}
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.5} />

            {/* Out of range zones */}
            <ReferenceArea y1={yMin} y2={marker.refMin} fill="hsl(0, 72%, 51%)" fillOpacity={0.05} />
            <ReferenceArea y1={marker.refMax} y2={yMax} fill="hsl(0, 72%, 51%)" fillOpacity={0.05} />

            {/* Suboptimal zones */}
            <ReferenceArea y1={marker.refMin} y2={marker.optimalMin} fill="hsl(45, 93%, 47%)" fillOpacity={0.07} />
            <ReferenceArea y1={marker.optimalMax} y2={marker.refMax} fill="hsl(45, 93%, 47%)" fillOpacity={0.07} />

            {/* Optimal zone */}
            <ReferenceArea y1={marker.optimalMin} y2={marker.optimalMax} fill="hsl(142, 71%, 45%)" fillOpacity={0.1} />

            {/* Boundary lines */}
            <ReferenceLine y={marker.optimalMin} stroke="hsl(142, 71%, 45%)" strokeDasharray="4 4" strokeOpacity={0.6} />
            <ReferenceLine y={marker.optimalMax} stroke="hsl(142, 71%, 45%)" strokeDasharray="4 4" strokeOpacity={0.6} />
            <ReferenceLine y={marker.refMin} stroke="hsl(45, 93%, 47%)" strokeDasharray="2 4" strokeOpacity={0.4} />
            <ReferenceLine y={marker.refMax} stroke="hsl(45, 93%, 47%)" strokeDasharray="2 4" strokeOpacity={0.4} />

            <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis domain={[yMin, yMax]} tick={{ fontSize: 11 }} className="fill-muted-foreground" width={50} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                fontSize: "0.8rem",
              }}
              formatter={(value: number) => [`${value} ${marker.unit}`, marker.name]}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--card))" }}
              activeDot={{ r: 7, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current value callout */}
      {latestValue !== undefined && (
        <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">Latest: <span className="font-semibold text-foreground">{latestValue} {marker.unit}</span></span>
          <span className="text-muted-foreground">Target: <span className="font-medium text-green-500">{marker.optimalMin}–{marker.optimalMax}</span></span>
        </div>
      )}
    </div>
  );
};

export default BiomarkerTrendChart;
