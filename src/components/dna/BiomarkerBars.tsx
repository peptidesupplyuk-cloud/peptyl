interface BiomarkerResult {
  // New field names
  name?: string;
  marker?: string; // Legacy
  value: number;
  unit: string;
  status: string;
  range_normal?: string;
  optimal_range?: string; // Legacy
  interpretation?: string;
  action?: string; // Legacy
  gene_interaction?: string;
  trend?: string;
}

interface Props {
  biomarkers?: BiomarkerResult[];
}

const statusColor = (s: string) => {
  const l = s?.toLowerCase();
  if (l === "optimal") return "bg-primary text-primary-foreground";
  if (l === "suboptimal") return "bg-yellow-500 text-white";
  return "bg-destructive text-white";
};

const statusBg = (s: string) => {
  const l = s?.toLowerCase();
  if (l === "optimal") return "bg-primary/10";
  if (l === "suboptimal") return "bg-yellow-500/10";
  return "bg-destructive/10";
};

const BiomarkerBars = ({ biomarkers }: Props) => {
  if (!biomarkers?.length) return null;

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Biomarker Results</h2>
      <div className="space-y-3">
        {biomarkers.map((b, i) => {
          const label = b.name || b.marker || "Unknown";
          const rawRange = b.range_normal || b.optimal_range || "";
          const range = typeof rawRange === "object" && rawRange !== null
            ? `${(rawRange as any).min ?? "?"} – ${(rawRange as any).max ?? "?"}`
            : String(rawRange);
          const detail = b.interpretation || b.action || "";

          return (
            <div key={i} className={`rounded-xl p-4 border border-border ${statusBg(b.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-heading font-semibold text-foreground text-sm">{label}</span>
                  {range && <span className="text-xs text-muted-foreground ml-2">Optimal: {range}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {b.trend && (
                    <span className="text-[10px] text-muted-foreground">{b.trend}</span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(b.status)}`}>
                    {b.status}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-lg font-heading font-bold text-foreground tabular-nums">{b.value}</span>
                <span className="text-xs text-muted-foreground">{b.unit}</span>
              </div>

              {detail && <p className="text-xs text-foreground mb-1">{detail}</p>}

              {b.gene_interaction && (
                <p className="text-xs text-primary font-medium mt-1">🧬 {b.gene_interaction}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BiomarkerBars;
