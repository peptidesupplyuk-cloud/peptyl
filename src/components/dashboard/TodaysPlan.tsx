import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, SkipForward, Clock, FlaskConical, ArrowRight, Target, Pill, CheckCheck, Dna, X, CalendarIcon, CalendarClock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTodayInjections, useDateInjections, useUpdateInjectionStatus, type InjectionLog } from "@/hooks/use-injections";
import { useProtocols, type ProtocolSupplement } from "@/hooks/use-protocols";
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { useTodaySupplementLogs, useDateSupplementLogs, useToggleSupplement, useBatchCompleteSupplement } from "@/hooks/use-supplement-logs";
import { BIOMARKERS, getMarkerStatus } from "@/data/biomarker-ranges";
import { format, differenceInDays, differenceInCalendarDays } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import DoseCalendar from "./InjectionCalendar";

interface TodaysPlanProps {
  onActivate?: () => void;
  slim?: boolean;
  selectedDate?: Date;
}

/** Map a protocol goal string to a user-friendly label */
function formatGoalLabel(goal: string): string {
  const lower = goal.toLowerCase();
  if (lower.includes("recovery") || lower.includes("injury") || lower.includes("heal") || lower.includes("repair")) return "Injury Recovery";
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
  timing: string; // "AM" | "PM" | "AM+PM"
  protocolName: string;
  protocolId: string;
  goal: string;
  drivenBy?: string[];
}

/** Derive timing window for a supplement from its explicit timing or frequency hint */
function resolveSupplementTiming(supp: { timing?: string; frequency?: string }): string {
  if (supp.timing) return supp.timing.toUpperCase();
  // Infer from frequency keywords
  const freq = (supp.frequency || "").toLowerCase();
  if (freq.includes("morning") || freq.includes("fasted")) return "AM";
  if (freq.includes("bed") || freq.includes("evening") || freq.includes("night")) return "PM";
  if (freq.includes("twice") || freq.includes("2x") || freq.includes("with meals")) return "AM+PM";
  return "AM"; // sensible default
}

/** Derive timing window for a peptide injection */
function resolveInjectionTiming(scheduledTime: string): "AM" | "PM" {
  const hour = new Date(scheduledTime).getUTCHours();
  return hour < 14 ? "AM" : "PM";
}

/** Frequency badge helper */
function frequencyLabel(freq: string): { label: string; color: string } {
  const f = freq.toLowerCase();
  if (f === "daily" || f.includes("daily")) return { label: "Daily", color: "bg-primary/10 text-primary" };
  if (f === "eod" || f.includes("every other")) return { label: "Every other day", color: "bg-info/10 text-info" };
  if (f.includes("2x")) return { label: "Mon · Thu", color: "bg-warm/10 text-warm" };
  if (f.includes("3x")) return { label: "Mon · Wed · Fri", color: "bg-warm/10 text-warm" };
  if (f === "weekly" || f.includes("1x")) return { label: "Weekly", color: "bg-accent/50 text-accent-foreground" };
  return { label: freq, color: "bg-muted text-muted-foreground" };
}

/** Get the frequency for a peptide from its protocol, using protocol_peptide_id for exact match */
function getPeptideFrequency(peptideName: string, protocols: any[], protocolPeptideId?: string | null): string {
  if (protocolPeptideId) {
    for (const p of protocols.filter((pr: any) => pr.status === "active")) {
      const pep = p.peptides.find((pp: any) => pp.id === protocolPeptideId);
      if (pep) return pep.frequency;
    }
  }
  for (const p of protocols.filter((pr: any) => pr.status === "active")) {
    const pep = p.peptides.find((pp: any) => pp.peptide_name.toLowerCase() === peptideName.toLowerCase());
    if (pep) return pep.frequency;
  }
  return "daily";
}

/** Grouped dose list by protocol */
const ProtocolGroupedDoses = ({
  injections,
  todaySupplements,
  completedSupplements,
  skippedSupplements,
  peptideProtocolMap,
  protocolPeptideMap,
  peptideGoalMap,
  protocols,
  isToday,
  isFutureDate,
  updateStatus,
  toggleSupplement,
}: {
  injections: InjectionLog[];
  todaySupplements: SupplementItem[];
  completedSupplements: Set<string>;
  skippedSupplements: Set<string>;
  peptideProtocolMap: Map<string, { protocolName: string; protocolId: string; goal: string }>;
  protocolPeptideMap: Map<string, { protocolName: string; protocolId: string; goal: string }>;
  peptideGoalMap: Map<string, string>;
  protocols: any[];
  isToday: boolean;
  isFutureDate: boolean;
  updateStatus: any;
  toggleSupplement: any;
}) => {
  // Group injections + supplements by protocol
  interface GroupedProtocol {
    protocolName: string;
    goal: string;
    scheduled: InjectionLog[];
    completed: InjectionLog[];
    skipped: InjectionLog[];
    pendingSupps: SupplementItem[];
    doneSupps: SupplementItem[];
    skippedSupps: SupplementItem[];
  }

  const groupMap = new Map<string, GroupedProtocol>();

  const getOrCreate = (key: string, name: string, goal: string): GroupedProtocol => {
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        protocolName: name,
        goal,
        scheduled: [],
        completed: [],
        skipped: [],
        pendingSupps: [],
        doneSupps: [],
        skippedSupps: [],
      });
    }
    return groupMap.get(key)!;
  };

  // Group injections — use protocol_peptide_id to correctly assign to protocol
  for (const inj of injections) {
    // First try exact match via protocol_peptide_id
    const infoById = inj.protocol_peptide_id ? protocolPeptideMap.get(inj.protocol_peptide_id) : null;
    const info = infoById || peptideProtocolMap.get(inj.peptide_name.toLowerCase());
    const key = info?.protocolId || "ungrouped";
    const name = info?.protocolName || "Other";
    const goal = info?.goal || "";
    const group = getOrCreate(key, name, goal);
    if (inj.status === "completed") group.completed.push(inj);
    else if (inj.status === "skipped") group.skipped.push(inj);
    else group.scheduled.push(inj);
  }

  // Group supplements
  for (const supp of todaySupplements) {
    // Find which protocol this supplement belongs to
    const protocol = protocols.find((p: any) => p.status === "active" && p.name === supp.protocolName);
    const key = protocol?.id || "ungrouped";
    const name = supp.protocolName || "Other";
    const goal = supp.goal || "";
    const group = getOrCreate(key, name, goal);
    if (completedSupplements.has(supp.name)) group.doneSupps.push(supp);
    else if (skippedSupplements.has(supp.name)) group.skippedSupps.push(supp);
    else group.pendingSupps.push(supp);
  }

  const groups = Array.from(groupMap.entries());
  // Default: collapse completed groups, expand groups with pending items
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const [key, g] of groups) {
      if (g.scheduled.length > 0 || g.pendingSupps.length > 0) initial.add(key);
    }
    return initial;
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {groups.map(([key, group]) => {
        const totalInGroup = group.scheduled.length + group.completed.length + group.skipped.length + group.pendingSupps.length + group.doneSupps.length + group.skippedSupps.length;
        const completedInGroup = group.completed.length + group.doneSupps.length;
        const pendingInGroup = group.scheduled.length + group.pendingSupps.length;
        const isExpanded = expandedGroups.has(key);
        const allDone = pendingInGroup === 0 && totalInGroup > 0;

        return (
          <div key={key} className={`rounded-xl border transition-colors ${allDone ? "border-primary/20 bg-primary/[0.02]" : "border-border bg-card"}`}>
            {/* Collapsed summary header */}
            <button
              onClick={() => toggleGroup(key)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/20 transition-colors rounded-xl"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {allDone ? (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <FlaskConical className="h-4 w-4 text-primary shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="text-sm font-heading font-semibold text-foreground block truncate">
                    {group.goal || group.protocolName}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {completedInGroup}/{totalInGroup} done
                    {group.scheduled.length > 0 && <> · {group.scheduled.length} peptide{group.scheduled.length !== 1 ? "s" : ""} pending</>}
                    {group.pendingSupps.length > 0 && <> · {group.pendingSupps.length} supp{group.pendingSupps.length !== 1 ? "s" : ""} pending</>}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-muted-foreground">{totalInGroup} items</span>
                {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="px-3 pb-3 space-y-1.5">
                {/* Scheduled peptide doses */}
                {group.scheduled.map((inj) => {
                  const freq = getPeptideFrequency(inj.peptide_name, protocols, inj.protocol_peptide_id);
                  const badge = frequencyLabel(freq);
                  return (
                    <div key={inj.id} className="flex flex-wrap items-center justify-between gap-2 bg-muted/50 rounded-lg px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-sm font-medium text-foreground truncate">{inj.peptide_name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">{inj.dose_mcg}mcg</span>
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground ml-5.5 mt-0.5">
                          {format(new Date(inj.scheduled_time), "h:mm a")}
                        </p>
                      </div>
                      {isToday ? (
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => updateStatus.mutate({ id: inj.id, status: "skipped" })}>
                            <SkipForward className="h-3 w-3 mr-1" /> Skip
                          </Button>
                          <Button size="sm" className="h-7 text-xs px-2 shadow-brand" onClick={() => updateStatus.mutate({ id: inj.id, status: "completed" })}>
                            <Check className="h-3 w-3 mr-1" /> Done
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{isFutureDate ? "Planned" : "Missed"}</span>
                      )}
                    </div>
                  );
                })}

                {/* Pending supplements */}
                {group.pendingSupps.map((supp) => {
                  const badge = frequencyLabel(supp.frequency);
                  return (
                    <div key={`supp-${supp.name}`} className="flex flex-wrap items-center justify-between gap-2 bg-muted/50 rounded-lg px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Pill className="h-3.5 w-3.5 text-accent-foreground/70 shrink-0" />
                          <span className="text-sm font-medium text-foreground truncate">{supp.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">{supp.dose}</span>
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                        </div>
                        {supp.drivenBy && supp.drivenBy.length > 0 && (
                          <span className="text-[10px] text-primary/70 flex items-center gap-1 ml-5.5 mt-0.5">
                            <Dna className="h-2.5 w-2.5" /> {supp.drivenBy[0]}
                          </span>
                        )}
                      </div>
                      {isToday ? (
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => toggleSupplement.mutate({ item: supp.name, completed: false })}>
                            <SkipForward className="h-3 w-3 mr-1" /> Skip
                          </Button>
                          <Button size="sm" className="h-7 text-xs px-2 shadow-brand" onClick={() => toggleSupplement.mutate({ item: supp.name, completed: true })}>
                            <Check className="h-3 w-3 mr-1" /> Done
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{isFutureDate ? "Planned" : "Missed"}</span>
                      )}
                    </div>
                  );
                })}

                {/* Completed peptide doses */}
                {group.completed.map((inj) => {
                  const freq = getPeptideFrequency(inj.peptide_name, protocols, inj.protocol_peptide_id);
                  const badge = frequencyLabel(freq);
                  return (
                    <div key={inj.id} className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-medium text-foreground line-through opacity-60">{inj.peptide_name}</span>
                        <span className="text-xs text-muted-foreground">{inj.dose_mcg}mcg</span>
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                      </div>
                      <span className="text-xs text-primary">✓</span>
                    </div>
                  );
                })}

                {/* Completed supplements */}
                {group.doneSupps.map((supp) => {
                  const badge = frequencyLabel(supp.frequency);
                  return (
                    <div key={`supp-done-${supp.name}`} className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-medium text-foreground line-through opacity-60">{supp.name}</span>
                        <span className="text-xs text-muted-foreground">{supp.dose}</span>
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                      </div>
                      <span className="text-xs text-primary">✓</span>
                    </div>
                  );
                })}

                {/* Skipped */}
                {group.skipped.map((inj) => (
                  <div key={inj.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 opacity-50">
                    <div className="flex items-center gap-2">
                      <SkipForward className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground line-through">{inj.peptide_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Skipped</span>
                  </div>
                ))}
                {group.skippedSupps.map((supp) => (
                  <div key={`supp-skip-${supp.name}`} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 opacity-50">
                    <div className="flex items-center gap-2">
                      <SkipForward className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground line-through">{supp.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Skipped</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const TodaysPlan = ({ onActivate, slim = false, selectedDate }: TodaysPlanProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const effectiveDate = selectedDate || new Date();
  const isToday = format(effectiveDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const isFutureDate = effectiveDate > new Date() && !isToday;
  const isPastDate = !isToday && !isFutureDate;

  const handleActivatePlan = () => {
    if (onActivate) {
      onActivate();
      return;
    }
    navigate("/dashboard?tab=protocols");
  };

  // Use date-aware hooks
  const { data: dateInjections = [], isLoading: dateLoading } = useDateInjections(effectiveDate);
  const { data: todayInjectionsDefault = [], isLoading: todayLoading } = useTodayInjections();
  const injections = selectedDate ? dateInjections : todayInjectionsDefault;
  const isLoading = selectedDate ? dateLoading : todayLoading;
  
  const updateStatus = useUpdateInjectionStatus();
  const { data: protocols = [] } = useProtocols();
  const { data: panels = [] } = useBloodworkPanels();
  const hasActiveProtocol = protocols.some((p) => p.status === "active");

  // Supplement logs - date aware
  const { data: dateSupplementLogs = [] } = useDateSupplementLogs(effectiveDate);
  const { data: todaySupplementLogsDefault = [] } = useTodaySupplementLogs();
  const supplementLogs = selectedDate ? dateSupplementLogs : todaySupplementLogsDefault;
  const toggleSupplement = useToggleSupplement();
  const batchComplete = useBatchCompleteSupplement();
  const completedSupplements = new Set(supplementLogs.filter((l) => l.completed).map((l) => l.item));
  const skippedSupplements = new Set(supplementLogs.filter((l) => !l.completed).map((l) => l.item));

  // --- J2: Fetch active outcome record + DNA report for 90-day progress ---
  const { data: outcomeRecord } = useQuery({
    queryKey: ["active-outcome", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("outcome_records")
        .select("id, dna_report_id, protocol_id, protocol_start_date, status")
        .eq("user_id", user!.id)
        .in("status", ["baseline_only", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const dnaReportId = outcomeRecord?.dna_report_id;

  const { data: dnaReport } = useQuery({
    queryKey: ["dna-report-plan", dnaReportId],
    enabled: !!dnaReportId,
    queryFn: async () => {
      const { data } = await supabase
        .from("dna_reports")
        .select("id, report_json")
        .eq("id", dnaReportId!)
        .maybeSingle();
      return data;
    },
  });

  // Compute active protocol progress
  const activeProtocol = protocols.find(
    (p) => p.status === "active" && outcomeRecord?.protocol_id === p.id
  ) || protocols.find((p) => p.status === "active");

  const protocolStartDate = outcomeRecord?.protocol_start_date || activeProtocol?.start_date;
  const protocolEndDate = activeProtocol?.end_date;

  const daysActive = protocolStartDate
    ? Math.max(0, differenceInCalendarDays(new Date(), new Date(protocolStartDate)))
    : 0;
  const totalDays = protocolStartDate && protocolEndDate
    ? Math.max(1, differenceInCalendarDays(new Date(protocolEndDate), new Date(protocolStartDate)))
    : 90;
  const progressPct = Math.min(100, Math.round((daysActive / totalDays) * 100));

  // Fetch the user's latest DNA report (independent of outcome record)
  const { data: latestDnaReport } = useQuery({
    queryKey: ["latest-dna-report", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("dna_reports")
        .select("id, report_json, created_at, assessment_tier, plan_start_date")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  // Handle updating plan start date
  const handleSetPlanStartDate = async (date: Date | undefined) => {
    if (!latestDnaReport?.id || !date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    const { error } = await supabase
      .from("dna_reports")
      .update({ plan_start_date: dateStr } as any)
      .eq("id", latestDnaReport.id);
    if (error) {
      toast({ title: "Error", description: "Could not update start date.", variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Plan starts ${format(date, "d MMM yyyy")}` });
      queryClient.invalidateQueries({ queryKey: ["latest-dna-report"] });
    }
  };
  const reportForPlan = latestDnaReport || dnaReport;
  const actionPlan = (reportForPlan?.report_json as any)?.action_plan as
    | { immediate?: string[]; "30_days"?: string[]; "90_days"?: string[] }
    | undefined;

  // Milestone label
  let milestoneLabel = "";
  let milestonePrefix = "";
  let milestoneAmber = false;
  if (daysActive >= 70) {
    milestoneLabel = "Retest due soon";
    milestonePrefix = "";
    milestoneAmber = true;
  } else if (actionPlan) {
    if (daysActive <= 7 && actionPlan.immediate?.[0]) {
      milestonePrefix = "This week:";
      milestoneLabel = actionPlan.immediate[0];
    } else if (daysActive <= 30 && actionPlan["30_days"]?.[0]) {
      milestonePrefix = "30-day goal:";
      milestoneLabel = actionPlan["30_days"][0];
    } else if (actionPlan["90_days"]?.[0]) {
      milestonePrefix = "90-day goal:";
      milestoneLabel = actionPlan["90_days"][0];
    }
  }

  const showProgressStrip = hasActiveProtocol && protocolStartDate && (dnaReportId || protocolEndDate);

  // Milestone celebration banners (day 30 and 90)
  const [dismissed30, setDismissed30] = useState(() =>
    activeProtocol ? sessionStorage.getItem(`milestone_30_dismissed_${activeProtocol.id}`) === "true" : false
  );
  const [dismissed90, setDismissed90] = useState(() =>
    activeProtocol ? sessionStorage.getItem(`milestone_90_dismissed_${activeProtocol.id}`) === "true" : false
  );

  const showMilestone30 = daysActive === 30 && !dismissed30 && actionPlan?.["30_days"]?.[0];
  const showMilestone90 = daysActive === 90 && !dismissed90 && actionPlan?.["90_days"]?.[0];

  // Build maps from peptide name → goal + protocol info for active protocols
  const peptideGoalMap = new Map<string, string>();
  const peptideProtocolMap = new Map<string, { protocolName: string; protocolId: string; goal: string }>();
  // Map protocol_peptide_id → protocol info for exact matching
  const protocolPeptideMap = new Map<string, { protocolName: string; protocolId: string; goal: string }>();
  for (const protocol of protocols.filter((p) => p.status === "active")) {
    for (const pep of protocol.peptides) {
      const key = pep.peptide_name.toLowerCase();
      if (!peptideGoalMap.has(key)) {
        peptideGoalMap.set(key, protocol.goal ? formatGoalLabel(protocol.goal) : "");
      }
      if (!peptideProtocolMap.has(key)) {
        peptideProtocolMap.set(key, {
          protocolName: protocol.name,
          protocolId: protocol.id,
          goal: protocol.goal ? formatGoalLabel(protocol.goal) : "",
        });
      }
      // Always map protocol_peptide_id (unique per protocol)
      protocolPeptideMap.set(pep.id, {
        protocolName: protocol.name,
        protocolId: protocol.id,
        goal: protocol.goal ? formatGoalLabel(protocol.goal) : "",
      });
    }
  }

  // Collect supplements from active protocols
  const supplements: SupplementItem[] = [];
  for (const protocol of protocols.filter((p) => p.status === "active")) {
    if (protocol.supplements && protocol.supplements.length > 0) {
      for (const supp of protocol.supplements) {
        if (!supplements.find((s) => s.name === supp.name)) {
          const isDnaGoal = protocol.goal && /dna/i.test(protocol.goal);
          supplements.push({
            name: supp.name,
            dose: supp.dose,
            frequency: supp.frequency,
            timing: resolveSupplementTiming(supp),
            protocolName: protocol.name,
            protocolId: protocol.id,
            goal: protocol.goal && !isDnaGoal ? formatGoalLabel(protocol.goal) : "",
            drivenBy: (supp as any).drivenBy || [],
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

  const totalItems = injections.length + todaySupplements.length;
  const completedItems = completed.length + doneSupplements.length;
  const remainingScheduled = scheduled.length + pendingSupplements.length;

  const handleCompleteAll = () => {
    for (const inj of scheduled) {
      updateStatus.mutate({ id: inj.id, status: "completed" });
    }
    const pendingItems = pendingSupplements.map((s) => ({ item: s.name, protocolId: s.protocolId }));
    if (pendingItems.length > 0) {
      batchComplete.mutate(pendingItems);
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

  // Compute 90-day progress from plan_start_date or created_at
  const planStartStr = (latestDnaReport as any)?.plan_start_date;
  const dnaStartDate = planStartStr
    ? new Date(planStartStr + "T00:00:00")
    : latestDnaReport?.created_at ? new Date(latestDnaReport.created_at) : null;
  const dna90DaysElapsed = dnaStartDate ? Math.max(0, differenceInCalendarDays(new Date(), dnaStartDate)) : 0;
  const dna90ProgressPct = Math.min(100, Math.round((dna90DaysElapsed / 90) * 100));
  const dna90EndDate = dnaStartDate ? new Date(dnaStartDate.getTime() + 90 * 24 * 60 * 60 * 1000) : null;
  const hasStarted = dnaStartDate ? dnaStartDate <= new Date() : true;

  // No active protocol — if slim mode, render nothing (Zone A handles CTA)
  if (!hasActiveProtocol) {
    if (slim) return null;
    return (
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">What To Do Today</h2>
        </div>

        {/* 90-Day Plan from latest DNA report even without active protocol */}
        {actionPlan?.["90_days"] && actionPlan["90_days"].length > 0 && reportForPlan && (
          <div className="bg-muted/30 rounded-xl px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dna className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">90-Day Plan</span>
                {(reportForPlan as any).assessment_tier === "advanced" ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium">Advanced</span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium">Standard</span>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{dnaStartDate ? format(dnaStartDate, "d MMM yyyy") : "Set start"}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dnaStartDate || undefined}
                    onSelect={handleSetPlanStartDate}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Progress bar */}
            {dnaStartDate && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{hasStarted ? `Day ${dna90DaysElapsed + 1} of 90` : `Starts ${format(dnaStartDate, "d MMM")}`}</span>
                  <span>{dna90EndDate ? format(dna90EndDate, "d MMM yyyy") : ""}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${dna90DaysElapsed >= 90 ? "bg-primary" : "bg-primary/70"}`}
                    style={{ width: `${dna90ProgressPct}%` }}
                  />
                </div>
              </div>
            )}
            <ul className="space-y-1">
              {actionPlan["90_days"].map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">&#8226;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

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
        <Button className="w-full shadow-brand" onClick={handleActivatePlan}>
          Activate My Plan <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  }

  const hasAnyItems = injections.length > 0 || todaySupplements.length > 0;

  return (
    <>
      {/* Milestone celebration banners — only in full mode */}
      {!slim && showMilestone30 && activeProtocol && (
        <div className="bg-card rounded-2xl border border-[#00D4AA]/30 p-4 flex items-start gap-3 mb-4">
          <span className="text-lg">🎯</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              30-day milestone — your protocol said: <span className="text-primary">{actionPlan?.["30_days"]?.[0]}</span>
            </p>
          </div>
          <button
            className="p-1 rounded hover:bg-muted transition-colors shrink-0"
            onClick={() => {
              sessionStorage.setItem(`milestone_30_dismissed_${activeProtocol.id}`, "true");
              setDismissed30(true);
            }}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
      {!slim && showMilestone90 && activeProtocol && (
        <div className="bg-card rounded-2xl border border-[#00D4AA]/30 p-4 flex items-start gap-3 mb-4">
          <span className="text-lg">🎯</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              90-day milestone — your protocol said: <span className="text-primary">{actionPlan?.["90_days"]?.[0]}</span>
            </p>
          </div>
          <button
            className="p-1 rounded hover:bg-muted transition-colors shrink-0"
            onClick={() => {
              sessionStorage.setItem(`milestone_90_dismissed_${activeProtocol.id}`, "true");
              setDismissed90(true);
            }}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        {/* Header — only in full mode */}
        {!slim && (
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
        )}

        {/* Slim mode header */}
        {slim && (
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {isToday ? "Today's doses" : isFutureDate ? "Planned doses" : format(effectiveDate, "EEEE, MMM d")}
            </p>
            {isPastDate && injections.length === 0 && (
              <span className="text-[10px] text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">No data</span>
            )}
            {isFutureDate && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
                <CalendarClock className="h-3 w-3" /> Scheduled
              </span>
            )}
          </div>
        )}

        {/* J2: Day X of N progress strip — only in full mode */}
        {!slim && showProgressStrip && (
          <button
            onClick={() => dnaReportId && navigate(`/dna/report/${dnaReportId}`)}
            className="w-full bg-muted/30 rounded-xl px-4 py-3 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-sm text-foreground">
                Day {daysActive + 1} of {totalDays}
              </p>
              <div className="w-full h-1 bg-muted rounded-full mt-1.5">
                <div
                  className="h-1 bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            {milestoneLabel && (
              <div className="max-w-[180px] shrink-0 text-right">
                {milestonePrefix && (
                  <p className="text-[10px] text-muted-foreground">{milestonePrefix}</p>
                )}
                <p className={`text-xs truncate ${milestoneAmber ? "text-amber-400 font-medium" : "text-muted-foreground"}`}>
                  {milestoneLabel}
                </p>
              </div>
            )}
          </button>
        )}

        {/* Active goal summary + detected issues — only in full mode */}
        {!slim && (activeGoals.length > 0 || detectedIssues.length > 0) && (
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

        {/* 90-Day Action Plan from latest DNA report */}
        {!slim && actionPlan?.["90_days"] && actionPlan["90_days"].length > 0 && reportForPlan && (
          <div className="bg-muted/30 rounded-xl px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dna className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">90-Day Plan</span>
                {(reportForPlan as any).assessment_tier === "advanced" ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium">Advanced</span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium">Standard</span>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{dnaStartDate ? format(dnaStartDate, "d MMM yyyy") : "Set start"}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dnaStartDate || undefined}
                    onSelect={handleSetPlanStartDate}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Progress bar */}
            {dnaStartDate && !hasActiveProtocol && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{hasStarted ? `Day ${dna90DaysElapsed + 1} of 90` : `Starts ${format(dnaStartDate, "d MMM")}`}</span>
                  <span>{dna90EndDate ? format(dna90EndDate, "d MMM yyyy") : ""}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${dna90DaysElapsed >= 90 ? "bg-primary" : "bg-primary/70"}`}
                    style={{ width: `${dna90ProgressPct}%` }}
                  />
                </div>
              </div>
            )}
            <ul className="space-y-1">
              {actionPlan["90_days"].map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">&#8226;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}


        {remainingScheduled > 1 && isToday && (
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
            {isFutureDate
              ? "No doses scheduled yet for this date."
              : isPastDate
              ? "No dose records for this date."
              : "All doses completed or none scheduled today."}
          </p>
        ) : (
          <ProtocolGroupedDoses
            injections={injections}
            todaySupplements={todaySupplements}
            completedSupplements={completedSupplements}
            skippedSupplements={skippedSupplements}
            peptideProtocolMap={peptideProtocolMap}
            protocolPeptideMap={protocolPeptideMap}
            peptideGoalMap={peptideGoalMap}
            protocols={protocols}
            isToday={isToday}
            isFutureDate={isFutureDate}
            updateStatus={updateStatus}
            toggleSupplement={toggleSupplement}
          />
        )}

        {totalItems > 0 && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span>{completedItems}/{totalItems} completed</span>
            {remainingScheduled > 0 && <span>{remainingScheduled} remaining</span>}
          </div>
        )}
      </div>
    </>
  );
};

export default TodaysPlan;