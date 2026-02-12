import { Check, SkipForward, Clock, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTodayInjections, useUpdateInjectionStatus } from "@/hooks/use-injections";
import { format } from "date-fns";
import InjectionCalendar from "./InjectionCalendar";

const TodaysPlan = () => {
  const { data: injections = [], isLoading } = useTodayInjections();
  const updateStatus = useUpdateInjectionStatus();

  const scheduled = injections.filter((i) => i.status === "scheduled");
  const completed = injections.filter((i) => i.status === "completed");
  const skipped = injections.filter((i) => i.status === "skipped");

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-16 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">Today's Protocol</h2>
        </div>
        <div className="flex items-center gap-3">
          <InjectionCalendar />
          <span className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMM d")}</span>
        </div>
      </div>

      {injections.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No doses scheduled for today. Activate a protocol to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {scheduled.map((inj) => (
            <div key={inj.id} className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{inj.peptide_name}</span>
                  <span className="text-xs text-muted-foreground">{inj.dose_mcg}mcg</span>
                </div>
                <p className="text-xs text-muted-foreground ml-5.5 mt-0.5">
                  {format(new Date(inj.scheduled_time), "h:mm a")}
                </p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => updateStatus.mutate({ id: inj.id, status: "skipped" })}
                >
                  <SkipForward className="h-3 w-3 mr-1" /> Skip
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs shadow-brand"
                  onClick={() => updateStatus.mutate({ id: inj.id, status: "completed" })}
                >
                  <Check className="h-3 w-3 mr-1" /> Done
                </Button>
              </div>
            </div>
          ))}

          {completed.map((inj) => (
            <div key={inj.id} className="flex items-center justify-between bg-green-500/5 border border-green-500/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-sm font-medium text-foreground line-through opacity-60">{inj.peptide_name}</span>
                <span className="text-xs text-muted-foreground">{inj.dose_mcg}mcg</span>
              </div>
              <span className="text-xs text-green-500">Completed</span>
            </div>
          ))}

          {skipped.map((inj) => (
            <div key={inj.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 opacity-50">
              <div className="flex items-center gap-2">
                <SkipForward className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground line-through">{inj.peptide_name}</span>
              </div>
              <span className="text-xs text-muted-foreground">Skipped</span>
            </div>
          ))}
        </div>
      )}

      {injections.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span>{completed.length}/{injections.length} completed</span>
          {scheduled.length > 0 && <span>{scheduled.length} remaining</span>}
        </div>
      )}
    </div>
  );
};

export default TodaysPlan;
