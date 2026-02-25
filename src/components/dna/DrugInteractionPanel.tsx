import { AlertTriangle } from "lucide-react";

interface DrugInteraction {
  gene: string;
  status: string;
  affected_drugs: string[];
  recommendation: string;
}

interface Props {
  interactions?: DrugInteraction[];
}

const DrugInteractionPanel = ({ interactions }: Props) => {
  if (!interactions?.length) return null;

  return (
    <div>
      <h2 className="text-xl font-heading font-bold text-foreground mb-4">Drug Interactions</h2>
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5 space-y-4">
        {interactions.map((d, i) => (
          <div key={i} className={i > 0 ? "pt-4 border-t border-yellow-500/10" : ""}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-heading font-semibold text-foreground text-sm">{d.gene} — {d.status}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {d.affected_drugs.map((drug) => (
                <span key={drug} className="text-xs bg-yellow-500/10 text-yellow-700 px-2 py-0.5 rounded-md">{drug}</span>
              ))}
            </div>
            <p className="text-xs text-foreground">{d.recommendation}</p>
          </div>
        ))}
        <div className="pt-3 border-t border-yellow-500/10">
          <p className="text-xs font-medium text-yellow-700">⚠️ Flag these findings to your GP and pharmacist before any new prescriptions.</p>
        </div>
      </div>
    </div>
  );
};

export default DrugInteractionPanel;
