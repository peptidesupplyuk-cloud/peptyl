import { AlertTriangle, Clock, PartyPopper, ArrowRight } from "lucide-react";
import { differenceInDays } from "date-fns";
import { useProtocols } from "@/hooks/use-protocols";
import { Button } from "@/components/ui/button";

interface Nudge {
  id: string;
  type: "ending_soon" | "ended" | "milestone";
  protocolName: string;
  message: string;
  daysLeft?: number;
}

const ProtocolNudges = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const { data: protocols = [] } = useProtocols();

  const nudges: Nudge[] = [];
  const today = new Date();

  for (const p of protocols) {
    if (p.status === "active" && p.end_date) {
      const daysLeft = differenceInDays(new Date(p.end_date), today);
      if (daysLeft <= 0) {
        nudges.push({
          id: `ended-${p.id}`,
          type: "ended",
          protocolName: p.name,
          message: `Your "${p.name}" protocol has ended. How did it go?`,
        });
      } else if (daysLeft <= 3) {
        nudges.push({
          id: `ending-${p.id}`,
          type: "ending_soon",
          protocolName: p.name,
          message: `"${p.name}" ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — plan your retest.`,
          daysLeft,
        });
      } else if (daysLeft <= 7) {
        nudges.push({
          id: `week-${p.id}`,
          type: "ending_soon",
          protocolName: p.name,
          message: `"${p.name}" ends in ${daysLeft} days. Consider scheduling bloodwork.`,
          daysLeft,
        });
      }
    }

    // Milestone nudge: 30 days active
    if (p.status === "active") {
      const daysActive = differenceInDays(today, new Date(p.start_date));
      if (daysActive === 30 || daysActive === 60 || daysActive === 90) {
        nudges.push({
          id: `milestone-${p.id}-${daysActive}`,
          type: "milestone",
          protocolName: p.name,
          message: `🎯 ${daysActive} days on "${p.name}" — great consistency!`,
        });
      }
    }
  }

  if (nudges.length === 0) return null;

  return (
    <div className="space-y-2">
      {nudges.map((nudge) => (
        <div
          key={nudge.id}
          className={`rounded-xl px-4 py-3 flex items-center justify-between gap-3 ${
            nudge.type === "ended"
              ? "bg-orange-500/5 border border-orange-500/20"
              : nudge.type === "ending_soon"
              ? "bg-yellow-500/5 border border-yellow-500/20"
              : "bg-primary/5 border border-primary/20"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {nudge.type === "ended" ? (
              <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
            ) : nudge.type === "ending_soon" ? (
              <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
            ) : (
              <PartyPopper className="h-4 w-4 text-primary shrink-0" />
            )}
            <p className="text-sm text-foreground truncate">{nudge.message}</p>
          </div>
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
          {nudge.type === "ending_soon" && onNavigate && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs shrink-0"
              onClick={() => onNavigate("bloodwork")}
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
