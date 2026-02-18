import { Check, SkipForward, Clock, FlaskConical, ArrowRight, Target, Pill, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTodayInjections, useUpdateInjectionStatus } from "@/hooks/use-injections";
import { useProtocols, type ProtocolSupplement } from "@/hooks/use-protocols";
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { useTodaySupplementLogs, useToggleSupplement, useBatchCompleteSupplement } from "@/hooks/use-supplement-logs";
import { BIOMARKERS, getMarkerStatus } from "@/data/biomarker-ranges";
import { format } from "date-fns";
import DoseCalendar from "./InjectionCalendar";

interface TodaysPlanProps {
  onActivate?: () => void;
}

/** Map a protocol goal string to a user-friendly label */
function formatGoalLabel(goal: string): string {
  const lower = goal.toLowerCase();
  if (lower.includes("recovery") || lower.includes("injury") || lower.includes("heal")) return "Injury Recovery";
  if (lower.includes("weight") || lower.includes("fat") || lower.includes("glp") || lower.includes("lean")) return "Weight Management";
  if (lower.includes("growth") || lower.includes("muscle") || lower.includes("anabolic")) return "Growth & Performance";
  if (lower.includes("longevity") || lower.includes("anti-aging") || lower.includes("aging")) return "Longevity";
  if (lower.includes("skin") || lower.includes("glow") || lower.includes("hair") || lower.includes("collagen")) return "Skin & Appearance";
  if (lower.includes("sleep") || lower.includes("cognitive") || lower.includes("brain") || lower.includes("neuro")) return "Cognitive & Sleep";
  if (lower.includes("immune") || lower.includes("gut")) return "Immune & Gut Health";
  if (lower.includes("inflammation")) return "Inflammation Control";
  return goal.charAt(0).toUpperCase() + goal.slice(1);
}

interface SupplementItem {
  name: string;
  dose: string;
  frequency: string;
  protocolName: string;
  goal: string;
}

const TodaysPlan = ({ onActivate }: TodaysPlanProps) => {
  const { data: injections = [], isLoading } = useTodayInjections();
  const updateStatus = useUpdateInjectionStatus();
  const { data: protocols = [] } = useProtocols();
  const { data: panels = [] } = useBloodworkPanels();
  const hasActiveProtocol = protocols.some((p) => p.status === "active");

  // Persist supplement completion to DB
  const { data: supplementLogs = [] } = useTodaySupplementLogs();
  const toggleSupplement = useToggleSupplement();
  const batchComplete = useBatchCompleteSupplement();
  const completedSupplements = new Set(supplementLogs.filter((l) => l.completed).map((l) => l.item));
  const skippedSupplements = new Set(supplementLogs.filter((l) => !l.completed).map((l) => l.item));

  // Build a map from peptide name → formatted protocol goal for active protocols
  const peptideGoalMap = new Map<string, string>();
  for (const protocol of protocols.filter((p) => p.status === "active")) {
    for (const pep of protocol.peptides) {
      if (protocol.goal && !peptideGoalMap.has(pep.peptide_name.toLowerCase())) {
        peptideGoalMap.set(pep.peptide_name.toLowerCase(), formatGoalLabel(protocol.goal));
      }
    }
  }

  // Collect supplements from active protocols
  const supplements: SupplementItem[] = [];
  for (const protocol of protocols.filter((p) => p.status === "active")) {
    if (protocol.supplements && protocol.supplements.length > 0) {
      for (const supp of protocol.supplements) {
        // Avoid duplicates by name
        if (!supplements.find((s) => s.name === supp.name)) {
          supplements.push({
            name: supp.name,
            dose: supp.dose,
            frequency: supp.frequency,
            protocolName: protocol.name,
            goal: protocol.goal ? formatGoalLabel(protocol.goal) : "",
          });
        }
      }
    }
  }

  // Filter supplements that are due today based on frequency
  const todaySupplements = supplements.filter((s) => {
    const freq = s.frequency.toLowerCase();
    if (freq.includes("daily") || freq.includes("day")) return true;
    if (freq.includes("2x") || freq.includes("twice")) return true;
    // Default: show it
    return true;
  });

  const pendingSupplements = todaySupplements.filter(
    (s) => !completedSupplements.has(s.name) && !skippedSupplements.has(s.name)
  );
  const doneSupplements = todaySupplements.filter((s) => completedSupplements.has(s.name));
  const skippedSuppList = todaySupplements.filter((s) => skippedSupplements.has(s.name));

  // Collect unique active goals for summary display
  const activeGoals = [...new Set(
    protocols
      .filter((p) => p.status === "active" && p.goal)
      .map((p) => formatGoalLabel(p.goal!))
  )];

  // Detect issues from bloodwork (secondary context)
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

  // Total counts for progress
  const totalItems = injections.length + todaySupplements.length;
  const completedItems = completed.length + doneSupplements.length;
  const remainingScheduled = scheduled.length + pendingSupplements.length;

  // Complete All handler
  const handleCompleteAll = () => {
    // Complete all scheduled injections
    for (const inj of scheduled) {
      updateStatus.mutate({ id: inj.id, status: "completed" });
    }
    // Complete all pending supplements in DB
    const pendingNames = pendingSupplements.map((s) => s.name);
    if (pendingNames.length > 0) {
      batchComplete.mutate(pendingNames);
    }
  };

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
        <p className="text-sm text-muted-foreground">
          Tell us your goal — injury recovery, weight management, longevity, or something else — and we'll build your personalised daily plan.
        </p>
        {detectedIssues.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              We also detected {detectedIssues.length} marker{detectedIssues.length > 1 ? "s" : ""} outside optimal range:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {detectedIssues.slice(0, 4).map((issue) => (
                <span key={issue} className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                  {issue}
                </span>
              ))}
              {detectedIssues.length > 4 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  +{detectedIssues.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
        <Button className="w-full shadow-brand" onClick={onActivate}>
          Activate My Plan <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  const hasAnyItems = injections.length > 0 || todaySupplements.length > 0;

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

      {/* Active goal summary + detected issues */}
      {(activeGoals.length > 0 || detectedIssues.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeGoals.length > 0 && <Target className="h-3.5 w-3.5 text-primary/60" />}
          {activeGoals.map((goal) => (
            <span key={goal} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {goal}
            </span>
          ))}
          {detectedIssues.slice(0, 3).map((issue) => (
            <span key={issue} className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium">
              {issue}
            </span>
          ))}
          {detectedIssues.length > 3 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              +{detectedIssues.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Complete All button */}
      {remainingScheduled > 1 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-8 border-primary/20 text-primary hover:bg-primary/5"
          onClick={handleCompleteAll}
        >
          <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
          Complete All ({remainingScheduled} remaining)
        </Button>
      )}

      {!hasAnyItems ? (
        <p className="text-sm text-muted-foreground py-2 text-center">
          All doses completed or none scheduled today. Check your active plan below.
        </p>
      ) : (
        <div className="space-y-2">
          {/* Scheduled peptide doses */}
          {scheduled.map((inj) => {
            const goal = peptideGoalMap.get(inj.peptide_name.toLowerCase());
            return (
              <div key={inj.id} className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{inj.peptide_name}</span>
                    <span className="text-xs text-muted-foreground">{inj.dose_mcg}mcg</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-5.5 mt-0.5">
                    {format(new Date(inj.scheduled_time), "h:mm a")}
                    {goal && (
                      <span className="ml-1.5 text-primary/70">· {goal}</span>
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
            );
          })}

          {/* Pending supplements */}
          {pendingSupplements.map((supp) => (
            <div key={`supp-${supp.name}`} className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <Pill className="h-3.5 w-3.5 text-accent-foreground/70" />
                  <span className="text-sm font-medium text-foreground">{supp.name}</span>
                  <span className="text-xs text-muted-foreground">{supp.dose}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-5.5 mt-0.5">
                  {supp.frequency}
                  {supp.goal && (
                    <span className="ml-1.5 text-primary/70">· {supp.goal}</span>
                  )}
                </p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => toggleSupplement.mutate({ item: supp.name, completed: false })}
                >
                  <SkipForward className="h-3 w-3 mr-1" /> Skip
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs shadow-brand"
                  onClick={() => toggleSupplement.mutate({ item: supp.name, completed: true })}
                >
                  <Check className="h-3 w-3 mr-1" /> Done
                </Button>
              </div>
            </div>
          ))}

          {/* Completed peptide doses */}
          {completed.map((inj) => {
            const goal = peptideGoalMap.get(inj.peptide_name.toLowerCase());
            return (
              <div key={inj.id} className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium text-foreground line-through opacity-60">{inj.peptide_name}</span>
                    <span className="text-xs text-muted-foreground">{inj.dose_mcg}mcg</span>
                  </div>
                  {goal && (
                    <p className="text-[11px] text-muted-foreground ml-5.5 mt-0.5">{goal}</p>
                  )}
                </div>
                <span className="text-xs text-primary">Completed</span>
              </div>
            );
          })}

          {/* Completed supplements */}
          {doneSupplements.map((supp) => (
            <div key={`supp-done-${supp.name}`} className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-medium text-foreground line-through opacity-60">{supp.name}</span>
                  <span className="text-xs text-muted-foreground">{supp.dose}</span>
                </div>
                {supp.goal && (
                  <p className="text-[11px] text-muted-foreground ml-5.5 mt-0.5">{supp.goal}</p>
                )}
              </div>
              <span className="text-xs text-primary">Completed</span>
            </div>
          ))}

          {/* Skipped peptide doses */}
          {skipped.map((inj) => {
            const goal = peptideGoalMap.get(inj.peptide_name.toLowerCase());
            return (
              <div key={inj.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 opacity-50">
                <div>
                  <div className="flex items-center gap-2">
                    <SkipForward className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground line-through">{inj.peptide_name}</span>
                  </div>
                  {goal && (
                    <p className="text-[11px] text-muted-foreground ml-5.5 mt-0.5">{goal}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">Skipped</span>
              </div>
            );
          })}

          {/* Skipped supplements */}
          {skippedSuppList.map((supp) => (
            <div key={`supp-skip-${supp.name}`} className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 opacity-50">
              <div>
                <div className="flex items-center gap-2">
                  <SkipForward className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground line-through">{supp.name}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Skipped</span>
            </div>
          ))}
        </div>
      )}

      {totalItems > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span>{completedItems}/{totalItems} completed</span>
          {remainingScheduled > 0 && <span>{remainingScheduled} remaining</span>}
        </div>
      )}
    </div>
  );
};

export default TodaysPlan;
