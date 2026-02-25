interface BiomarkerResult {
  marker: string;
  value: number;
  unit: string;
  status: string;
  optimal_range: string;
  action: string;
  gene_interaction?: string;
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
        {biomarkers.map((b, i) => (
          <div key={i} className={`rounded-xl p-4 border border-border ${statusBg(b.status)}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-heading font-semibold text-foreground text-sm">{b.marker}</span>
                <span className="text-xs text-muted-foreground ml-2">Optimal: {b.optimal_range}</span>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(b.status)}`}>
                {b.status}
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-lg font-heading font-bold text-foreground">{b.value}</span>
              <span className="text-xs text-muted-foreground">{b.unit}</span>
            </div>

            <p className="text-xs text-foreground mb-1">{b.action}</p>
            {b.gene_interaction && (
              <p className="text-xs text-primary font-medium">🧬 {b.gene_interaction}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BiomarkerBars;
