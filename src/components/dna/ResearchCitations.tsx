import { BookOpen } from "lucide-react";

interface Citation {
  pmid?: string;
  title: string;
  gene?: string;
  year?: number;
  evidence_grade?: string;
}

interface Props {
  citations?: Citation[];
}

const gradeColor = (g?: string) => {
  if (g === "A") return "bg-primary/10 text-primary";
  if (g === "B") return "bg-blue-500/10 text-blue-600";
  if (g === "C") return "bg-amber-500/10 text-amber-600";
  return "bg-muted text-muted-foreground";
};

const ResearchCitations = ({ citations }: Props) => {
  if (!citations?.length) return null;

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5" />
        Research Citations
      </h2>
      <div className="space-y-2">
        {citations.map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-lg px-4 py-3 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{c.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {c.gene && <span className="font-mono">{c.gene}</span>}
                {c.year && <span>{c.year}</span>}
                {c.pmid && (
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${c.pmid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    PMID: {c.pmid}
                  </a>
                )}
              </div>
            </div>
            {c.evidence_grade && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${gradeColor(c.evidence_grade)}`}>
                {c.evidence_grade}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchCitations;
