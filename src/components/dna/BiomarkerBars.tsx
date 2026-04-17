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

          const valueStr =
            b.value !== undefined && b.value !== null && b.value !== ""
              ? String(b.value)
              : "—";

          return (
            <div key={i} className={`rounded-2xl p-4 md:p-5 border border-border ${statusBg(b.status)}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-semibold text-foreground text-base">{label}</h3>
                  {range && <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Optimal: {range}</p>}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusColor(b.status)}`}>
                  {displayStatus}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl md:text-3xl font-heading font-bold text-foreground tabular-nums">{valueStr}</span>
                {b.unit && <span className="text-sm text-muted-foreground">{b.unit}</span>}
              </div>

              {detail && <p className="text-sm text-foreground/90 leading-relaxed">{detail}</p>}

              {b.gene_interaction && (
                <p className="text-sm text-primary font-medium mt-2">🧬 {b.gene_interaction}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BiomarkerBars;
