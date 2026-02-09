import { Pause, Play, CheckCircle2, Clock, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProtocols, useUpdateProtocolStatus, type Protocol } from "@/hooks/use-protocols";
import { differenceInDays } from "date-fns";

const ActiveProtocols = () => {
  const { data: protocols = [], isLoading } = useProtocols();
  const updateStatus = useUpdateProtocolStatus();

  const active = protocols.filter((p) => p.status === "active");
  const paused = protocols.filter((p) => p.status === "paused");
  const completed = protocols.filter((p) => p.status === "completed");

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-24 bg-muted rounded" />
      </div>
    );
  }

  const renderProtocol = (p: Protocol) => {
    const daysActive = differenceInDays(new Date(), new Date(p.start_date));
    const endDate = p.end_date ? new Date(p.end_date) : null;
    const totalDays = endDate ? differenceInDays(endDate, new Date(p.start_date)) : null;
    const progress = totalDays ? Math.min(100, Math.round((daysActive / totalDays) * 100)) : null;

    return (
      <div key={p.id} className="bg-muted/50 rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-heading font-semibold text-foreground text-sm">{p.name}</h4>
            {p.goal && <p className="text-xs text-muted-foreground mt-0.5">{p.goal}</p>}
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            p.status === "active" ? "bg-green-500/10 text-green-500" :
            p.status === "paused" ? "bg-yellow-500/10 text-yellow-500" :
            "bg-muted text-muted-foreground"
          }`}>
            {p.status}
          </span>
        </div>

        {p.peptides.length > 0 && (
          <div className="space-y-1">
            {p.peptides.map((pp) => (
              <div key={pp.id} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{pp.peptide_name}</span>
                <span className="text-muted-foreground">{pp.dose_mcg}mcg · {pp.frequency} · {pp.timing}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{daysActive}d active</span>
            {progress !== null && (
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span>{progress}%</span>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            {p.status === "active" && (
              <>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: p.id, status: "paused" })}>
                  <Pause className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: p.id, status: "completed" })}>
                  <CheckCircle2 className="h-3 w-3" />
                </Button>
              </>
            )}
            {p.status === "paused" && (
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: p.id, status: "active" })}>
                <Play className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-semibold text-foreground">My Protocols</h2>
      </div>

      {active.length === 0 && paused.length === 0 && completed.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No protocols yet. Upload bloodwork to get personalised recommendations.
        </p>
      ) : (
        <div className="space-y-3">
          {active.map(renderProtocol)}
          {paused.map(renderProtocol)}
          {completed.length > 0 && (
            <details className="group">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                {completed.length} completed protocol{completed.length > 1 ? "s" : ""}
              </summary>
              <div className="mt-2 space-y-2 opacity-60">
                {completed.map(renderProtocol)}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveProtocols;
