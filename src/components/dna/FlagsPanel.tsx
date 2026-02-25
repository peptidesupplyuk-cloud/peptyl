import { AlertTriangle, Stethoscope, Eye } from "lucide-react";

interface Props {
  flags?: {
    urgent?: string[];
    discuss_with_gp?: string[];
    monitor?: string[];
  };
}

const FlagsPanel = ({ flags }: Props) => {
  if (!flags) return null;
  const hasAny = (flags.urgent?.length || 0) + (flags.discuss_with_gp?.length || 0) + (flags.monitor?.length || 0) > 0;
  if (!hasAny) return null;

  return (
    <div className="space-y-3">
      {flags.urgent?.length ? (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-heading font-semibold text-destructive">Urgent</span>
          </div>
          <ul className="space-y-1">
            {flags.urgent.map((f, i) => <li key={i} className="text-sm text-foreground">{f}</li>)}
          </ul>
        </div>
      ) : null}

      {flags.discuss_with_gp?.length ? (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-heading font-semibold text-yellow-600">Discuss with GP</span>
          </div>
          <ul className="space-y-1">
            {flags.discuss_with_gp.map((f, i) => <li key={i} className="text-sm text-foreground">{f}</li>)}
          </ul>
        </div>
      ) : null}

      {flags.monitor?.length ? (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-heading font-semibold text-blue-500">Monitor</span>
          </div>
          <ul className="space-y-1">
            {flags.monitor.map((f, i) => <li key={i} className="text-sm text-foreground">{f}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default FlagsPanel;
