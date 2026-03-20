import { AlertTriangle } from "lucide-react";

interface DrugInteraction {
  // New fields
  compound?: string;
  drug?: string;
  mechanism?: string;
  recommendation?: string;
  // Legacy fields
  gene?: string;
  drug_class?: string;
  status?: string;
  affected_drugs?: string[];
  interaction?: string;
}

interface Props {
  interactions?: DrugInteraction[];
}

const DrugInteractionPanel = ({ interactions }: Props) => {
  if (!Array.isArray(interactions) || interactions.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Drug Interactions</h2>
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5 space-y-4">
        {interactions.map((d, i) => {
          const label = d.compound || d.drug_class || d.gene || "Unknown";
          const drugName = d.drug || "";
          const detail = d.mechanism || d.interaction || d.recommendation || "";
          const rec = d.recommendation && d.recommendation !== detail ? d.recommendation : "";
          const drugs = Array.isArray(d.affected_drugs) ? d.affected_drugs : (drugName ? [drugName] : []);

          return (
            <div key={i} className={i > 0 ? "pt-4 border-t border-yellow-500/10" : ""}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="font-heading font-semibold text-foreground text-sm">
                  {label}{d.status ? ` — ${d.status}` : ""}
                </span>
              </div>
              {drugs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {drugs.map((drug) => (
                    <span key={drug} className="text-xs bg-yellow-500/10 text-yellow-700 px-2 py-0.5 rounded-md">{drug}</span>
                  ))}
                </div>
              )}
              {detail && <p className="text-xs text-foreground">{detail}</p>}
              {rec && <p className="text-xs text-muted-foreground mt-1">{rec}</p>}
            </div>
          );
        })}
        <div className="pt-3 border-t border-yellow-500/10">
          <p className="text-xs font-medium text-yellow-700">⚠️ Flag these findings to your GP and pharmacist before any new prescriptions.</p>
        </div>
      </div>
    </div>
  );
};

export default DrugInteractionPanel;
