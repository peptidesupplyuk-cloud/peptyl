import { AlertTriangle, Play, Clock, FlaskConical, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Recommendation } from "@/data/recommendation-rules";

interface Props {
  recommendation: Recommendation;
  isActivating?: boolean;
  onActivate: (rec: Recommendation) => void;
}

const RecommendationCard = ({ recommendation: rec, onActivate, isActivating }: Props) => (
  <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="font-heading font-semibold text-foreground">{rec.protocolName}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{rec.goal}</p>
      </div>
      <div className="p-2 rounded-lg bg-warm/10">
        <FlaskConical className="h-4 w-4 text-warm" />
      </div>
    </div>

    <div className="text-xs bg-warm/5 border border-warm/10 rounded-lg px-3 py-2 text-warm flex items-center gap-2">
      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
      Triggered: {rec.triggerDescription}
    </div>

    {rec.peptides.length > 0 && (
      <div className="space-y-2">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Peptides</p>
        {rec.peptides.map((p, i) => (
          <div key={i} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
            <span className="font-medium text-foreground">{p.name}</span>
            <span className="text-muted-foreground text-xs">
              {p.dose_mcg}mcg · {p.frequency} · {p.timing} · {p.route}
            </span>
          </div>
        ))}
      </div>
    )}

    {rec.supplements && rec.supplements.length > 0 && (
      <div className="space-y-2">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Pill className="h-3 w-3" /> Suggested Supplements
        </p>
        {rec.supplements.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-sm bg-accent/30 rounded-lg px-3 py-2">
            <span className="font-medium text-foreground">{s.name}</span>
            <span className="text-muted-foreground text-xs">{s.dose} · {s.frequency}</span>
          </div>
        ))}
      </div>
    )}

    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rec.durationWeeks} weeks</span>
      <span>Retest at {rec.retestWeeks} weeks</span>
      {rec.source && <span className="italic">Source: {rec.source}</span>}
    </div>

    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => onActivate(rec)} disabled={isActivating} className="shadow-brand">
        <Play className="h-3 w-3 mr-1" /> {isActivating ? "Starting…" : "Start Protocol"}
      </Button>
    </div>

    <p className="text-[10px] text-muted-foreground italic">
      ⚠️ Educational purposes only — not medical advice. Consult your physician before starting any protocol.
    </p>
  </div>
);

export default RecommendationCard;
