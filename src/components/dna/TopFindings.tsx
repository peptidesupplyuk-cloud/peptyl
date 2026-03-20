import { AlertTriangle, Info } from "lucide-react";

interface Finding {
  category: string;
  title: string;
  summary: string;
  severity?: string;
  driven_by?: string[];
}

interface Props {
  findings?: Finding[];
}

const severityStyle = (s?: string) => {
  const l = s?.toLowerCase();
  if (l === "high" || l === "urgent") return "border-destructive/30 bg-destructive/5";
  if (l === "moderate") return "border-yellow-500/30 bg-yellow-500/5";
  return "border-border bg-card";
};

const TopFindings = ({ findings }: Props) => {
  if (!findings?.length) return null;

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Top Findings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {findings.slice(0, 3).map((f, i) => (
          <div key={i} className={`border rounded-xl p-5 space-y-3 ${severityStyle(f.severity)}`}>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              {f.category}
            </span>
            <h3 className="font-heading font-semibold text-foreground text-sm">{f.title}</h3>
            <p className="text-xs text-foreground leading-relaxed">{f.summary}</p>
            {f.driven_by && f.driven_by.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {f.driven_by.map((d) => (
                  <span key={d} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopFindings;
