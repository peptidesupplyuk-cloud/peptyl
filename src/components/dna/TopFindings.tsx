import { AlertTriangle, Activity, Dna } from "lucide-react";

interface Finding {
  type: "urgent" | "biomarker" | "gene";
  name: string;
  summary: string;
  severity: "high" | "moderate" | "low";
}

interface Props {
  geneResults?: any[];
  biomarkerResults?: any[];
  flags?: any;
}

const severityBadge = (s: string) => {
  if (s === "high") return "bg-destructive/10 text-destructive";
  if (s === "moderate") return "bg-yellow-500/10 text-yellow-600";
  return "bg-primary/10 text-primary";
};

const severityLabel = (s: string) => {
  if (s === "high") return "High Priority";
  if (s === "moderate") return "Monitor";
  return "Low";
};

const iconMap = {
  urgent: AlertTriangle,
  biomarker: Activity,
  gene: Dna,
};

const typeLabel = (t: string) => {
  if (t === "urgent") return "Urgent Flag";
  if (t === "biomarker") return "Biomarker";
  return "Genetic Variant";
};

const cleanText = (s: string): string =>
  s.replace(/\s*[—–]\s*/g, " - ").replace(/_/g, " ");

const TopFindings = ({ geneResults, biomarkerResults, flags }: Props) => {
  const findings: Finding[] = [];

  if (flags?.urgent?.length) {
    for (const f of flags.urgent) {
      findings.push({ type: "urgent", name: "Urgent Flag", summary: cleanText(f), severity: "high" });
    }
  }

  if (biomarkerResults?.length) {
    for (const b of biomarkerResults) {
      const s = b.status?.toLowerCase();
      if (s === "action" || s === "action_required" || s === "deficient" || s === "critical") {
        findings.push({
          type: "biomarker",
          name: b.name || b.marker || "Biomarker",
          summary: cleanText(b.interpretation || b.action || b.clinical_summary || `${b.value} ${b.unit}`),
          severity: "high",
        });
      }
    }
  }

  if (geneResults?.length) {
    for (const g of geneResults) {
      const r = g.risk_level?.toLowerCase();
      if (r === "high" || r === "elevated" || r === "significant") {
        findings.push({
          type: "gene",
          name: g.gene || g.rsid || "Variant",
          summary: cleanText(g.clinical_summary || `${g.rsid} - ${g.risk_level}`),
          severity: "high",
        });
      }
    }
  }

  if (biomarkerResults?.length) {
    for (const b of biomarkerResults) {
      const s = b.status?.toLowerCase();
      if (s === "suboptimal" || s === "borderline" || s === "above_range" || s === "below_range") {
        findings.push({
          type: "biomarker",
          name: b.name || b.marker || "Biomarker",
          summary: cleanText(b.interpretation || b.action || `${b.value} ${b.unit}`),
          severity: "moderate",
        });
      }
    }
  }

  if (geneResults?.length) {
    for (const g of geneResults) {
      if (g.risk_level?.toLowerCase() === "moderate") {
        findings.push({
          type: "gene",
          name: g.gene || g.rsid || "Variant",
          summary: cleanText(g.clinical_summary || `${g.rsid} - ${g.risk_level}`),
          severity: "moderate",
        });
      }
    }
  }

  const top3 = findings.slice(0, 3);
  if (!top3.length) return null;

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Top Findings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3.map((f, i) => {
          const Icon = iconMap[f.type];
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{typeLabel(f.type)}</span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${severityBadge(f.severity)}`}>
                  {severityLabel(f.severity)}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-foreground text-sm">{f.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{f.summary}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopFindings;
