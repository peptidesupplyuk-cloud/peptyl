interface BiomarkerResult {
  name?: string;
  marker?: string;
  value: number;
  unit: string;
  status: string;
  range_normal?: string | { min?: number; max?: number };
  optimal_range?: string | { min?: number; max?: number };
  interpretation?: string;
  action?: string;
  gene_interaction?: string;
  trend?: string;
}

interface Props {
  biomarkers?: BiomarkerResult[];
}

const humanizeStatus = (s: string): string => {
  if (!s) return "Unknown";
  const map: Record<string, string> = {
    optimal: "Optimal",
    suboptimal: "Suboptimal",
    above_range: "Above Range",
    below_range: "Below Range",
    out_of_range: "Out of Range",
    action_required: "Needs Attention",
    action: "Needs Attention",
    critical: "Critical",
    deficient: "Deficient",
    borderline: "Borderline",
    normal: "Normal",
  };
  return map[s.toLowerCase()] ?? s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const statusColor = (s: string) => {
  const l = s?.toLowerCase();
  if (l === "optimal" || l === "normal") return "bg-primary text-primary-foreground";
  if (l === "suboptimal" || l === "borderline") return "bg-yellow-500 text-white";
  return "bg-destructive text-white";
};

const statusBg = (s: string) => {
  const l = s?.toLowerCase();
  if (l === "optimal" || l === "normal") return "bg-primary/10";
  if (l === "suboptimal" || l === "borderline") return "bg-yellow-500/10";
  return "bg-destructive/10";
};

const formatRange = (raw: unknown): string => {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const min = obj.min ?? obj.low ?? "?";
    const max = obj.max ?? obj.high ?? "?";
    return `${min} - ${max}`;
  }
  return String(raw);
};

const BiomarkerBars = ({ biomarkers }: Props) => {
  if (!biomarkers?.length) return null;

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Biomarker Results</h2>
      <div className="space-y-3">
        {biomarkers.map((b, i) => {
          const label = b.name || b.marker || "Unknown";
          const range = formatRange(b.range_normal || b.optimal_range);
          const detail = b.interpretation || b.action || "";
          const displayStatus = humanizeStatus(b.status);

          return (
            <div key={i} className={`rounded-xl p-4 border border-border ${statusBg(b.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-heading font-semibold text-foreground text-sm">{label}</span>
                  {range && <span className="text-xs text-muted-foreground ml-2">Optimal: {range}</span>}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(b.status)}`}>
                  {displayStatus}
                </span>
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
