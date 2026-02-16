import { AlertTriangle, ShieldAlert, ArrowUp } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { EscalationWarning } from "@/data/titration-rules";

interface Props {
  warnings: EscalationWarning[];
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DoseEscalationWarning = ({ warnings, open, onConfirm, onCancel }: Props) => {
  const hasDanger = warnings.some((w) => w.severity === "danger");

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {hasDanger ? (
              <ShieldAlert className="h-5 w-5 text-destructive" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-warm" />
            )}
            <span>{hasDanger ? "Heavy Dose Escalation Detected" : "Dose Increase Flagged"}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            The following compound{warnings.length > 1 ? "s" : ""} show a significant dose change that warrants review before proceeding.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 my-2">
          {warnings.map((w) => (
            <div
              key={w.compound}
              className={`rounded-xl p-4 space-y-2 border ${
                w.severity === "danger"
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-warm/5 border-warm/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-foreground text-sm">{w.compound}</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${
                  w.severity === "danger" ? "text-destructive" : "text-warm"
                }`}>
                  <ArrowUp className="h-3 w-3" />
                  {w.percentIncrease > 0 ? `+${w.percentIncrease}%` : "Over limit"}
                </span>
              </div>

              {w.currentWeeklyMcg > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Weekly load:</span>
                  <span className="font-medium text-foreground">
                    {(w.currentWeeklyMcg / 1000).toFixed(1)}mg
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className={`font-bold ${
                    w.severity === "danger" ? "text-destructive" : "text-warm"
                  }`}>
                    {(w.proposedWeeklyMcg / 1000).toFixed(1)}mg
                  </span>
                </div>
              )}

              <p className="text-xs text-muted-foreground leading-relaxed">{w.guidance}</p>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground italic">
          ⚠️ This is an educational safety check — not medical advice. Always consult your physician before changing dosages.
        </p>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Go back & adjust</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={hasDanger ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            I understand, proceed
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DoseEscalationWarning;
