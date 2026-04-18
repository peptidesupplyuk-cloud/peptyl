import { AlertTriangle, Stethoscope, Eye, Shield } from "lucide-react";
import { toStringArray } from "@/lib/dna-normalise";

interface Props {
  flags?: {
    urgent?: unknown;
    discuss_with_gp?: unknown;
    monitor?: unknown;
    peptide_cautions?: unknown;
  };
}

const FlagsPanel = ({ flags }: Props) => {
  if (!flags) return null;
  const urgent = toStringArray(flags.urgent);
  const discussWithGp = toStringArray(flags.discuss_with_gp);
  const monitor = toStringArray(flags.monitor);
  const peptideCautions = toStringArray(flags.peptide_cautions);
  const hasAny = urgent.length + discussWithGp.length + monitor.length + peptideCautions.length > 0;
  if (!hasAny) return null;

  return (
    <div className="space-y-3">
      {urgent.length ? (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-heading font-semibold text-destructive">Urgent</span>
          </div>
          <ul className="space-y-1">
            {urgent.map((f, i) => <li key={i} className="text-sm text-foreground">{f}</li>)}
          </ul>
        </div>
      ) : null}

      {discussWithGp.length ? (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-heading font-semibold text-yellow-600">Discuss with GP</span>
          </div>
          <ul className="space-y-1">
            {discussWithGp.map((f, i) => <li key={i} className="text-sm text-foreground">{f}</li>)}
          </ul>
        </div>
      ) : null}

      {monitor.length ? (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-heading font-semibold text-blue-500">Monitor</span>
          </div>
          <ul className="space-y-1">
            {monitor.map((f, i) => <li key={i} className="text-sm text-foreground">{f}</li>)}
          </ul>
        </div>
      ) : null}

      {peptideCautions.length ? (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-heading font-semibold text-amber-500">Peptide Cautions</span>
          </div>
          <ul className="space-y-1">
            {peptideCautions.map((f, i) => <li key={i} className="text-sm text-foreground">{f}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default FlagsPanel;
