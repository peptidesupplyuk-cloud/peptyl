import { AlertTriangle, Clock, PartyPopper, ArrowRight, FlaskConical, TrendingUp } from "lucide-react";
import { differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useProtocols } from "@/hooks/use-protocols";
import { useBloodworkPanels } from "@/hooks/use-bloodwork";
import { Button } from "@/components/ui/button";

interface Nudge {
  id: string;
  type: "baseline_missing" | "retest_due" | "ended" | "ending_soon" | "milestone";
  protocolName: string;
  protocolId?: string;
  message: string;
  daysLeft?: number;
}

const PRIORITY: Record<Nudge["type"], number> = {
  baseline_missing: 0,
  retest_due: 1,
  ended: 2,
  ending_soon: 3,
  milestone: 4,
};

const ProtocolNudges = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const { data: protocols = [] } = useProtocols();
  const { data: panels = [] } = useBloodworkPanels();
  const navigate = useNavigate();

  const nudges: Nudge[] = [];
  const today = new Date();

  for (const p of protocols) {
    if (p.status !== "active") {
      // Only check ended nudge for active protocols with past end_date
      if (p.status === "active" && p.end_date) {
        // handled below
      }
      continue;
    }

    const daysActive = differenceInDays(today, new Date(p.start_date));

    // Baseline-missing nudge (days 1-7)
    if (daysActive >= 1 && daysActive <= 7) {
      const hasBaseline = panels.some(panel => panel.protocol_id === p.id);
      if (!hasBaseline) {
        nudges.push({
          id: `baseline-${p.id}`,
          type: "baseline_missing",
          protocolName: p.name,
          protocolId: p.id,
          message: `Log baseline bloods for "${p.name}" to track your results`,
        });
      }
    }

    // Day 68-73 retest early warning
    if (daysActive >= 68 && daysActive <= 73) {
      const hasRetest = panels.some(
        panel => panel.protocol_id === p.id && panel.panel_type?.startsWith("retest")
      );
      if (!hasRetest) {
        nudges.push({
          id: `retest-week10-${p.id}`,
          type: "retest_due",
          protocolName: p.name,
          protocolId: p.id,
          message: `Week 10 — time to book your retest for "${p.name}"`,
        });
      }
    }

    if (p.end_date) {
      const daysLeft = differenceInDays(new Date(p.end_date), today);
      if (daysLeft <= 0) {
        nudges.push({
          id: `ended-${p.id}`,
          type: "ended",
          protocolName: p.name,
          protocolId: p.id,
          message: `Your "${p.name}" protocol has ended. How did it go?`,
        });
      } else if (daysLeft <= 3) {
        nudges.push({
          id: `ending-${p.id}`,
          type: "ending_soon",
          protocolName: p.name,
          protocolId: p.id,
          message: `"${p.name}" ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — plan your retest.`,
          daysLeft,
        });
      } else if (daysLeft <= 7) {
        nudges.push({
          id: `week-${p.id}`,
          type: "ending_soon",
          protocolName: p.name,
          protocolId: p.id,
          message: `"${p.name}" ends in ${daysLeft} days. Consider scheduling bloodwork.`,
          daysLeft,
        });
      }
    }

    // Milestone nudges
    if (daysActive === 30 || daysActive === 60 || daysActive === 90) {
      nudges.push({
        id: `milestone-${p.id}-${daysActive}`,
        type: "milestone",
        protocolName: p.name,
        protocolId: p.id,
        message: `🎯 ${daysActive} days on "${p.name}" — great consistency!`,
      });
    }
  }

  // Sort by priority
  nudges.sort((a, b) => PRIORITY[a.type] - PRIORITY[b.type]);

  if (nudges.length === 0) return null;

  const iconForType = (type: Nudge["type"]) => {
    switch (type) {
      case "baseline_missing": return <FlaskConical className="h-4 w-4 text-blue-500 shrink-0" />;
      case "retest_due": return <TrendingUp className="h-4 w-4 text-teal-500 shrink-0" />;
      case "ended": return <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />;
      case "ending_soon": return <Clock className="h-4 w-4 text-yellow-500 shrink-0" />;
      case "milestone": return <PartyPopper className="h-4 w-4 text-primary shrink-0" />;
    }
  };

  const styleForType = (type: Nudge["type"]) => {
    switch (type) {
      case "baseline_missing": return "bg-blue-500/5 border border-blue-500/20";
      case "retest_due": return "bg-teal-500/5 border border-teal-500/20";
      case "ended": return "bg-orange-500/5 border border-orange-500/20";
      case "ending_soon": return "bg-yellow-500/5 border border-yellow-500/20";
      case "milestone": return "bg-primary/5 border border-primary/20";
    }
  };

  return (
    <div className="space-y-2">
      {nudges.map((nudge) => (
        <div
          key={nudge.id}
          className={`rounded-xl px-4 py-3 flex items-center justify-between gap-3 ${styleForType(nudge.type)}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {iconForType(nudge.type)}
            <p className="text-sm text-foreground truncate">{nudge.message}</p>
          </div>

          {nudge.type === "baseline_missing" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs shrink-0"
              onClick={() => navigate(`/dashboard?tab=bloodwork&protocolId=${nudge.protocolId}`)}
            >
              Log Baseline <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}

          {nudge.type === "retest_due" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs shrink-0"
              onClick={() => navigate(`/dashboard?tab=bloodwork&retest=true&protocolId=${nudge.protocolId}`)}
            >
              Book Retest <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}

          {nudge.type === "ended" && onNavigate && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs shrink-0"
              onClick={() => onNavigate("journal")}
            >
              Log Experience <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}

          {nudge.type === "ending_soon" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs shrink-0"
              onClick={() => navigate(`/dashboard?tab=bloodwork&retest=true&protocolId=${nudge.protocolId}`)}
            >
              Schedule Retest <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProtocolNudges;
