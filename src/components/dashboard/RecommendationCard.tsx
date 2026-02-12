import { useState } from "react";
import { AlertTriangle, Play, Clock, FlaskConical, Pill, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Recommendation } from "@/data/recommendation-rules";
import PeptideInfoTooltip from "./PeptideInfoTooltip";

interface Props {
  recommendation: Recommendation;
  isActivating?: boolean;
  onActivate: (rec: Recommendation) => void;
  badge?: string;
}

const FREQUENCIES = ["daily", "EOD", "2x/week", "3x/week", "5on/2off", "weekly"];
const TIMINGS = ["AM", "PM", "AM+PM", "Pre-bed"];
const ROUTES = ["SubQ", "IM", "Oral", "Nasal"];

const RecommendationCard = ({ recommendation: initialRec, onActivate, isActivating, badge }: Props) => {
  const [editing, setEditing] = useState(false);
  const [rec, setRec] = useState<Recommendation>(initialRec);

  const updatePeptide = (index: number, field: string, value: string | number) => {
    setRec((prev) => ({
      ...prev,
      peptides: prev.peptides.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-semibold text-foreground">{rec.protocolName}</h3>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{rec.goal}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(!editing)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={editing ? "Done editing" : "Customise dosages"}
          >
            {editing ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Pencil className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <div className="p-2 rounded-lg bg-warm/10">
            <FlaskConical className="h-4 w-4 text-warm" />
          </div>
        </div>
      </div>

      {'triggerDescription' in rec && rec.triggerDescription && (
        <div className="text-xs bg-warm/5 border border-warm/10 rounded-lg px-3 py-2 text-warm flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          Triggered: {rec.triggerDescription}
        </div>
      )}

      {rec.peptides.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Peptides</p>
          {rec.peptides.map((p, i) =>
            editing ? (
              <div key={i} className="space-y-1.5 bg-muted/30 rounded-lg p-2.5">
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5">{p.name} <PeptideInfoTooltip peptideName={p.name} /></span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="text-[9px] text-muted-foreground uppercase">Dose (mcg)</label>
                    <Input
                      type="number"
                      value={p.dose_mcg}
                      onChange={(e) => updatePeptide(i, "dose_mcg", Number(e.target.value))}
                      className="text-xs h-7 px-2"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-muted-foreground uppercase">Frequency</label>
                    <Select value={p.frequency} onValueChange={(v) => updatePeptide(i, "frequency", v)}>
                      <SelectTrigger className="text-[10px] h-7 px-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((f) => (
                          <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[9px] text-muted-foreground uppercase">Timing</label>
                    <Select value={p.timing} onValueChange={(v) => updatePeptide(i, "timing", v)}>
                      <SelectTrigger className="text-[10px] h-7 px-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIMINGS.map((t) => (
                          <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[9px] text-muted-foreground uppercase">Route</label>
                    <Select value={p.route} onValueChange={(v) => updatePeptide(i, "route", v)}>
                      <SelectTrigger className="text-[10px] h-7 px-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROUTES.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                <span className="font-medium text-foreground flex items-center gap-1.5">{p.name} <PeptideInfoTooltip peptideName={p.name} /></span>
                <span className="text-muted-foreground text-xs">
                  {p.dose_mcg}mcg · {p.frequency} · {p.timing} · {p.route}
                </span>
              </div>
            )
          )}
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
        <Button size="sm" onClick={() => { setEditing(false); onActivate(rec); }} disabled={isActivating} className="shadow-brand">
          <Play className="h-3 w-3 mr-1" /> {isActivating ? "Starting…" : "Start Protocol"}
        </Button>
        {!editing && (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="text-xs">
            <Pencil className="h-3 w-3 mr-1" /> Customise
          </Button>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground italic">
        ⚠️ Educational purposes only — not medical advice. Consult your physician before starting any protocol.
      </p>
    </div>
  );
};

export default RecommendationCard;
