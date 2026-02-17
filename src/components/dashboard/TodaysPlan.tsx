import { Check, SkipForward, Clock, FlaskConical, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTodayInjections, useUpdateInjectionStatus } from "@/hooks/use-injections";
import { useProtocols } from "@/hooks/use-protocols";
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { BIOMARKERS, getMarkerStatus } from "@/data/biomarker-ranges";
import { format } from "date-fns";
import DoseCalendar from "./InjectionCalendar";

interface TodaysPlanProps {
  onActivate?: () => void;
}

const TodaysPlan = ({ onActivate }: TodaysPlanProps) => {
  const { data: injections = [], isLoading } = useTodayInjections();
  const updateStatus = useUpdateInjectionStatus();
  const { data: protocols = [] } = useProtocols();
  const { data: panels = [] } = useBloodworkPanels();
  const hasActiveProtocol = protocols.some((p) => p.status === "active");

  // Build a map from peptide name → protocol goal for active protocols
  const peptideGoalMap = new Map<string, string>();
  for (const protocol of protocols.filter((p) => p.status === "active")) {
    for (const pep of protocol.peptides) {
      if (protocol.goal && !peptideGoalMap.has(pep.peptide_name.toLowerCase())) {
        peptideGoalMap.set(pep.peptide_name.toLowerCase(), protocol.goal);
      }
    }
  }

  // Detect issues from bloodwork
  const latestPanel = panels[0];
  const detectedIssues: string[] = [];
  if (latestPanel) {
    const markerMap = Object.fromEntries(latestPanel.markers.map((m) => [m.marker_name, m.value]));
    for (const biomarker of BIOMARKERS) {
      const val = markerMap[biomarker.key];
      if (val !== undefined) {
        const status = getMarkerStatus(biomarker, val);
        if (status !== "optimal") {
          detectedIssues.push(`${biomarker.name} (${status === "out_of_range" ? "out of range" : "suboptimal"})`);
        }
      }
    }
  }

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

  // No active protocol → activation CTA
  if (!hasActiveProtocol) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">What To Do Today</h2>
        </div>
        {detectedIssues.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We detected {detectedIssues.length} marker{detectedIssues.length > 1 ? "s" : ""} outside optimal range:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {detectedIssues.slice(0, 5).map((issue) => (
                <span key={issue} className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 font-medium">
                  {issue}
                </span>
              ))}
              {detectedIssues.length > 5 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  +{detectedIssues.length - 5} more
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Upload bloodwork or activate a protocol to get your personalised daily plan.
          </p>
        )}
        <Button className="w-full shadow-brand" onClick={onActivate}>
          Activate My Plan <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">What To Do Today</h2>
        </div>
        <div className="flex items-center gap-3">
          <DoseCalendar />
          <span className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMM d")}</span>
        </div>
      </div>

      {injections.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2 text-center">
          All doses completed or none scheduled today. Check your active plan below.
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
                  {peptideGoalMap.get(inj.peptide_name.toLowerCase()) && (
                    <span className="ml-1.5 text-primary/70">· {peptideGoalMap.get(inj.peptide_name.toLowerCase())}</span>
                  )}
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
              <div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-sm font-medium text-foreground line-through opacity-60">{inj.peptide_name}</span>
                  <span className="text-xs text-muted-foreground">{inj.dose_mcg}mcg</span>
                </div>
                {peptideGoalMap.get(inj.peptide_name.toLowerCase()) && (
                  <p className="text-[11px] text-muted-foreground ml-5.5 mt-0.5">
                    {peptideGoalMap.get(inj.peptide_name.toLowerCase())}
                  </p>
                )}
              </div>
              <span className="text-xs text-green-500">Completed</span>
            </div>
          ))}

          {skipped.map((inj) => (
            <div key={inj.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 opacity-50">
              <div>
                <div className="flex items-center gap-2">
                  <SkipForward className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground line-through">{inj.peptide_name}</span>
                </div>
                {peptideGoalMap.get(inj.peptide_name.toLowerCase()) && (
                  <p className="text-[11px] text-muted-foreground ml-5.5 mt-0.5">
                    {peptideGoalMap.get(inj.peptide_name.toLowerCase())}
                  </p>
                )}
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
