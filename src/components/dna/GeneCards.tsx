import { useState } from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GeneResult {
  gene: string;
  variant?: string;
  genotype?: string;
  rsid: string;
  risk_level: string;
  score?: number;
  category?: string;
  clinical_summary: string;
  personalisation?: string;
  biomarker_impact?: string;
  evidence_grade?: string;
  action?: string;
  peptyl_relevant?: boolean;
}

interface Props {
  genes?: GeneResult[];
}

const riskLabel = (level: string) => {
  const l = level?.toLowerCase();
  if (l === "low" || l === "favourable" || l === "normal") return "Low Risk";
  if (l === "moderate") return "Moderate";
  return "Elevated";
};

const riskColor = (level: string) => {
  const l = level?.toLowerCase();
  if (l === "low" || l === "favourable" || l === "normal") return "bg-primary/10 text-primary";
  if (l === "moderate") return "bg-yellow-500/10 text-yellow-600";
  return "bg-destructive/10 text-destructive";
};

const gradeColor = (g?: string) => {
  if (g === "A") return "bg-primary/10 text-primary";
  if (g === "B") return "bg-blue-500/10 text-blue-600";
  if (g === "C") return "bg-amber-500/10 text-amber-600";
  return "bg-muted text-muted-foreground";
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
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-semibold text-foreground">{g.gene}</h3>
                  {g.evidence_grade && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${gradeColor(g.evidence_grade)}`}>
                      {g.evidence_grade}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {g.rsid} {g.genotype ? `· ${g.genotype}` : g.variant ? `· ${g.variant}` : ""}
                </p>
                {g.category && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">
                    {g.category}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${riskColor(g.risk_level)}`}>
                {riskLabel(g.risk_level)}
              </span>
            </div>

            {g.score != null && (
              <div className="mb-3">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${g.score}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Score: {g.score}/100</p>
              </div>
            )}

            <p className="text-sm text-foreground mb-3">{g.clinical_summary}</p>

            {g.personalisation && (
              <p className="text-xs text-primary mb-3">{g.personalisation}</p>
            )}

            {g.biomarker_impact && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3">
                      <Info className="h-3 w-3" />
                      Biomarker impact
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs">{g.biomarker_impact}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {(g.evidence_grade === "C" || g.evidence_grade === "D") && (
              <p className="text-[10px] text-muted-foreground italic mb-3">Preclinical evidence</p>
            )}

            {g.action && (
              <div className="bg-muted/50 rounded-lg px-3 py-2">
                <p className="text-xs font-medium text-foreground mb-1">Recommended Action</p>
                <p className="text-xs text-muted-foreground">{g.action}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneCards;
