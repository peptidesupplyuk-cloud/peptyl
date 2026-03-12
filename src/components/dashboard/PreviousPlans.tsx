import { useState } from "react";
import { History, ChevronDown, ChevronUp, FlaskConical, Clock, Pill, Calendar, Trophy } from "lucide-react";
import { useProtocols } from "@/hooks/use-protocols";
import { useProtocolScorecards } from "@/hooks/use-protocol-history";
import { differenceInCalendarDays, format } from "date-fns";
import ProtocolScorecard from "./ProtocolScorecard";

const PreviousPlans = () => {
  const { data: protocols = [] } = useProtocols();
  const { data: allScorecards = [] } = useProtocolScorecards();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Show completed + archived protocols
  const previousProtocols = protocols.filter(
    (p) => p.status === "completed" || p.status === "archived"
  );

  if (previousProtocols.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-semibold text-foreground">Previous Plans</h2>
        <span className="text-xs text-muted-foreground ml-auto">
          {previousProtocols.length} plan{previousProtocols.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {previousProtocols.map((p) => {
          const closedAt = p.end_date ? new Date(p.end_date) : new Date(p.updated_at);
          const totalDays = Math.max(
            1,
            differenceInCalendarDays(closedAt, new Date(p.start_date)) + 1
          );
          const daysCompleted = totalDays;
          const isCompletedEarly = p.status === "archived";
          const isExpanded = expandedId === p.id;
          const scorecards = allScorecards.filter((s) => s.protocol_id === p.id);

          return (
            <div key={p.id} className="bg-muted/50 rounded-xl overflow-hidden">
              {/* Header row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : p.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FlaskConical className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-heading font-semibold text-foreground text-sm truncate">{p.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {format(new Date(p.start_date), "MMM d")} — {format(closedAt, "MMM d, yyyy")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {daysCompleted}/{totalDays} days
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isCompletedEarly ? "bg-primary/10 text-primary" : "bg-green-500/10 text-green-500"
                  }`}>
                    {isCompletedEarly ? "Completed early" : "Completed"}
                  </span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-border/50">
                  {/* Peptides */}
                  {p.peptides.length > 0 && (
                    <div className="space-y-1 pt-3">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Peptides</p>
                      {p.peptides.map((pp) => (
                        <div key={pp.id} className="flex items-center justify-between text-xs">
                          <span className="text-foreground">{pp.peptide_name}</span>
                          <span className="text-muted-foreground">{pp.dose_mcg}mcg · {pp.frequency} · {pp.timing}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Supplements */}
                  {p.supplements && p.supplements.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Pill className="h-3 w-3" /> Supplements
                      </p>
                      {p.supplements.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-foreground">{s.name}</span>
                          <span className="text-muted-foreground">{s.dose} · {s.frequency}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {p.notes && (
                    <p className="text-[10px] text-muted-foreground italic">{p.notes}</p>
                  )}

                  {isCompletedEarly && (
                    <div className="rounded-lg border border-border bg-card px-3 py-2">
                      <p className="text-xs text-muted-foreground">
                        Completed early. <a href="/dashboard?tab=protocols" className="text-primary hover:underline">Create a new protocol?</a>
                      </p>
                    </div>
                  )}

                  {/* Scorecards */}
                  {scorecards.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Trophy className="h-3 w-3" /> Scorecards
                      </p>
                      {scorecards.map((sc) => (
                        <ProtocolScorecard key={sc.id} scorecard={sc} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-2">
                      No scorecard generated for this plan. Future protocols will auto-generate scorecards at milestones.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PreviousPlans;
