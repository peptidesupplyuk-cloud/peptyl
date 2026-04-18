import { Link2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toStringArray, toText } from "@/lib/dna-normalise";

interface Props {
  data?: {
    reinforcements?: unknown;
    conflicts?: unknown;
    note?: unknown;
  };
}

const ProtocolCrossReference = ({ data }: Props) => {
  if (!data) return null;
  const reinforcements = toStringArray(data.reinforcements);
  const conflicts = toStringArray(data.conflicts);
  const note = toText(data.note);
  if (!reinforcements.length && !conflicts.length) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Link2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Protocol Cross-Reference</h2>
          {note && <p className="text-xs text-muted-foreground">{note}</p>}
        </div>
      </div>

      {reinforcements.length > 0 && (
        <div>
          <span className="text-sm font-heading font-semibold text-foreground mb-2 block">✅ Reinforced by Your Genetics</span>
          <ul className="space-y-2">
            {reinforcements.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {conflicts.length > 0 && (
        <div>
          <span className="text-sm font-heading font-semibold text-foreground mb-2 block">⚠️ Potential Conflicts</span>
          <ul className="space-y-2">
            {conflicts.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProtocolCrossReference;
