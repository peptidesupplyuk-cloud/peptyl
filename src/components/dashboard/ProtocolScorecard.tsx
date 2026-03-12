import { Trophy, TrendingUp, TrendingDown, Flame, Activity, Heart, Brain, Calendar, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { ProtocolScorecard as ScorecardType } from "@/hooks/use-protocol-history";

interface Props {
  scorecard: ScorecardType;
}

const ProtocolScorecard = ({ scorecard }: Props) => {
  const bioGains = scorecard.biomarker_improvements.filter((b: any) => b.delta_pct > 2);
  const bioDeclines = scorecard.biomarker_improvements.filter((b: any) => b.delta_pct < -2);
  const wearableGains = scorecard.wearable_improvements.filter((w: any) => w.delta_pct > 0);

  const milestoneLabel = scorecard.milestone
    .replace("_day", "-day")
    .replace("completion", "Completion")
    .replace("early_completion", "Early Completion")
    .replace("30-day", "30-Day Milestone")
    .replace("60-day", "60-Day Milestone")
    .replace("90-day", "90-Day Milestone");

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-sm font-heading font-semibold text-foreground">{milestoneLabel}</span>
        </div>
        <span className="text-xs text-muted-foreground">Day {scorecard.day_number}</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3">
          {scorecard.adherence_percentage != null && (
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{scorecard.adherence_percentage}%</p>
              <p className="text-[10px] text-muted-foreground">Adherence</p>
            </div>
          )}
          {scorecard.streak_best != null && scorecard.streak_best > 0 && (
            <div className="text-center">
              <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                <Flame className="h-4 w-4 text-amber-500" />{scorecard.streak_best}
              </p>
              <p className="text-[10px] text-muted-foreground">Best Streak</p>
            </div>
          )}
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{scorecard.day_number}</p>
            <p className="text-[10px] text-muted-foreground">Days Tracked</p>
          </div>
        </div>

        {/* Wearable improvements */}
        {wearableGains.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Activity className="h-3 w-3" /> Wearable Improvements
            </p>
            <div className="grid grid-cols-3 gap-2">
              {scorecard.wearable_improvements.map((w: any, i: number) => (
                <div key={i} className="bg-muted/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {w.delta_pct > 0 ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    ) : w.delta_pct < 0 ? (
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                    ) : (
                      <Minus className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={`text-sm font-semibold ${w.delta_pct > 0 ? "text-green-500" : w.delta_pct < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                      {w.delta_pct > 0 ? "+" : ""}{w.delta_pct}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{w.metric}</p>
                  <p className="text-[9px] text-muted-foreground">{w.baseline_avg} → {w.protocol_avg}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Biomarker improvements */}
        {scorecard.biomarker_improvements.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Heart className="h-3 w-3" /> Biomarker Changes
            </p>
            <div className="space-y-1">
              {scorecard.biomarker_improvements.slice(0, 6).map((b: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs bg-muted/30 rounded-lg px-3 py-1.5">
                  <span className="text-foreground">{b.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{b.baseline} → {b.current}</span>
                    <span className={`font-medium ${b.delta_pct > 0 ? "text-green-500" : b.delta_pct < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                      {b.delta_pct > 0 ? "+" : ""}{b.delta_pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Changes made */}
        {scorecard.changes_made.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Protocol Adjustments
            </p>
            {scorecard.changes_made.map((c: any, i: number) => (
              <p key={i} className="text-xs text-muted-foreground">
                • {c.peptide_name || c.name} {c.dose_mcg ? `${c.dose_mcg}mcg` : c.dose || ""} {c.frequency || ""}
              </p>
            ))}
          </div>
        )}

        {/* Summary */}
        {scorecard.summary_text && (
          <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
            {scorecard.summary_text}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProtocolScorecard;
