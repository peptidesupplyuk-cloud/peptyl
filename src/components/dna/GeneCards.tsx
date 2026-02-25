interface GeneResult {
  gene: string;
  variant: string;
  rsid: string;
  risk_level: string;
  score: number;
  clinical_summary: string;
  action: string;
  peptyl_relevant?: boolean;
}

interface Props {
  genes?: GeneResult[];
}

const riskColor = (level: string) => {
  const l = level?.toLowerCase();
  if (l === "low" || l === "favourable" || l === "normal") return "bg-primary/10 text-primary";
  if (l === "moderate") return "bg-yellow-500/10 text-yellow-600";
  return "bg-destructive/10 text-destructive";
};

const GeneCards = ({ genes }: Props) => {
  if (!genes?.length) return null;

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Genetic Variants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {genes.map((g, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-heading font-semibold text-foreground">{g.gene}</h3>
                <p className="text-xs text-muted-foreground font-mono">{g.rsid} — {g.variant}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${riskColor(g.risk_level)}`}>
                {g.risk_level}
              </span>
            </div>

            {/* Score bar */}
            <div className="mb-3">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${g.score}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Score: {g.score}/100</p>
            </div>

            <p className="text-sm text-foreground mb-3">{g.clinical_summary}</p>

            <div className="bg-muted/50 rounded-lg px-3 py-2">
              <p className="text-xs font-medium text-foreground mb-1">Recommended Action</p>
              <p className="text-xs text-muted-foreground">{g.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneCards;
