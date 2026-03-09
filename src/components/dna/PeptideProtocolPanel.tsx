import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Shield, Info, Sparkles } from "lucide-react";

interface PeptideItem {
  peptide: string;
  dose: string;
  route: string;
  duration: string;
  evidence_grade: string;
  evidence_basis: string;
  driven_by: string[];
  use_case: string;
  caution?: string;
  interactions?: string;
  peptyl_product_tag?: string;
  research_only_disclaimer?: boolean;
  is_priority?: boolean;
  suggestion_note?: string;
}

interface Props {
  peptides: PeptideItem[] | undefined;
}

const gradeStyle: Record<string, string> = {
  A: "bg-primary/10 text-primary",
  B: "bg-blue-500/10 text-blue-500",
  C: "bg-amber-500/10 text-amber-600",
  D: "bg-red-500/10 text-red-500",
};

const PeptideCard = ({
  peptide: p,
  suggestion = false,
}: {
  peptide: PeptideItem;
  suggestion?: boolean;
}) => {
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className={`bg-card border rounded-2xl p-5 space-y-4 ${
      suggestion ? "border-border/50 opacity-90" : "border-border"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-heading font-semibold text-primary">{p.peptide}</h3>
          {suggestion && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              After cycle 1
            </span>
          )}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${gradeStyle[p.evidence_grade] ?? gradeStyle.D}`}>
          Grade {p.evidence_grade}
        </span>
      </div>

      {/* Use case */}
      <p className="text-sm text-muted-foreground">{p.use_case}</p>

      {/* Driven by chips */}
      {p.driven_by?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {p.driven_by.map((d, i) => (
            <span key={i} className="bg-muted rounded-md px-2 py-0.5 text-xs text-muted-foreground">
              {d}
            </span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Dose", value: p.dose },
          { label: "Route", value: p.route },
          { label: "Duration", value: p.duration },
        ].map(({ label, value }) => (
          <div key={label}>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
            <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Evidence toggle */}
      <button
        onClick={() => setShowEvidence(!showEvidence)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showEvidence ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        See evidence
      </button>
      {showEvidence && (
        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3">
          {p.evidence_basis}
        </p>
      )}

      {/* Caution */}
      {p.caution && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-foreground">{p.caution}</p>
        </div>
      )}

      {/* Interactions */}
      {p.interactions && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-foreground">{p.interactions}</p>
        </div>
      )}

      {/* Research disclaimer */}
      <div className="bg-muted/40 rounded-lg p-3 flex items-start gap-2">
        <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          For research and educational purposes only. Not approved for human use by MHRA or FDA. Consult a qualified healthcare practitioner before considering any peptide compound.
        </p>
      </div>
    </div>
  );
};

const PeptideProtocolPanel = ({ peptides }: Props) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (!peptides || peptides.length === 0) return null;

  const hasPriorityFlag = peptides.some(p => p.is_priority !== undefined);
  const priority = hasPriorityFlag ? peptides.filter(p => p.is_priority) : peptides.slice(0, 3);
  const suggestions = hasPriorityFlag ? peptides.filter(p => !p.is_priority) : peptides.slice(3);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-heading font-bold text-foreground">Research Peptide Protocol</h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600">
          Research Use Only
        </span>
      </div>

      {/* Priority peptides */}
      {priority.map((p, i) => (
        <PeptideCard key={i} peptide={p} suggestion={false} />
      ))}

      {/* Suggestions — collapsible */}
      {suggestions.length > 0 && (
        <div className="border border-border/50 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="w-full flex items-center justify-between px-5 py-4 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="text-sm font-medium text-foreground">
                  After your first cycle — {suggestions.length} further compound{suggestions.length > 1 ? "s" : ""} to consider
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Run your priority stack for one full cycle before adding these
                </p>
              </div>
            </div>
            {showSuggestions
              ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            }
          </button>

          {showSuggestions && (
            <div className="p-4 space-y-4 border-t border-border/50">
              {suggestions.map((p, i) => (
                <PeptideCard key={i} peptide={p} suggestion={true} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section disclaimer */}
      <div className="bg-muted/40 rounded-xl p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Grade C/D evidence means current data is primarily from animal studies and small human case series. Peptyl tracks emerging literature and updates recommendations as evidence evolves.
        </p>
      </div>
    </div>
  );
};

export default PeptideProtocolPanel;