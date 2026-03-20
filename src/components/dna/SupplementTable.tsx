import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Supplement {
  // New field names
  name?: string;
  supplement?: string; // Legacy
  dosage?: string;
  dose?: string; // Legacy
  timing: string;
  evidence_grade: string;
  driven_by?: string[];
  rationale?: string;
  notes?: string;
  caution?: string;
  peptyl_product_tag?: string;
  is_priority?: boolean;
  suggestion_note?: string;
}

interface Props {
  supplements?: Supplement[];
}

const gradeColor = (g: string) => {
  if (g === "A") return "bg-primary/10 text-primary";
  if (g === "B") return "bg-blue-500/10 text-blue-600";
  if (g === "C") return "bg-amber-500/10 text-amber-600";
  return "bg-muted text-muted-foreground";
};

const SupplementRow = ({ s }: { s: Supplement }) => {
  const label = s.name || s.supplement || "Unknown";
  const doseText = s.dosage || s.dose || "";
  const drivenBy = s.driven_by || [];

  return (
    <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
      <td className="py-3 px-3">
        <p className="font-medium text-foreground text-sm">{label}</p>
        {drivenBy.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {drivenBy.map((d) => (
              <span key={d} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {d}
              </span>
            ))}
          </div>
        )}
        {s.rationale && (
          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{s.rationale}</p>
        )}
      </td>
      <td className="py-3 px-3 text-sm text-muted-foreground whitespace-nowrap">
        <p>{doseText}</p>
        <p className="text-xs">{s.timing}</p>
      </td>
      <td className="py-3 px-3 text-center">
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${gradeColor(s.evidence_grade)}`}>
          {s.evidence_grade}
        </span>
        {(s.evidence_grade === "C" || s.evidence_grade === "D") && (
          <p className="text-[9px] text-muted-foreground mt-0.5">Preclinical</p>
        )}
      </td>
    </tr>
  );
};

const SupplementTable = ({ supplements }: Props) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (!supplements?.length) return null;

  const hasPriorityFlag = supplements.some(s => s.is_priority !== undefined);
  const priority = hasPriorityFlag ? supplements.filter(s => s.is_priority) : supplements.slice(0, 5);
  const suggestions = hasPriorityFlag ? supplements.filter(s => !s.is_priority) : supplements.slice(5);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-heading font-bold text-foreground">Supplement Protocol</h2>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">Supplement</th>
              <th className="text-left py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">Dose / Timing</th>
              <th className="text-center py-3 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">Grade</th>
            </tr>
          </thead>
          <tbody>
            {priority.map((s, i) => <SupplementRow key={i} s={s} />)}
          </tbody>
        </table>
      </div>

      {suggestions.length > 0 && (
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
          >
            <div>
              <span className="text-sm font-medium text-foreground">
                After your first 90 days — {suggestions.length} additional supplement{suggestions.length > 1 ? "s" : ""}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete your priority stack first before adding these
              </p>
            </div>
            {showSuggestions
              ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            }
          </button>

          {showSuggestions && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {suggestions.map((s, i) => <SupplementRow key={i} s={s} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupplementTable;
