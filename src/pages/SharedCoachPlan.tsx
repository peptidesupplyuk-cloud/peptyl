import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Syringe, Pill, AlertTriangle, Loader2, Lock } from "lucide-react";
import Logo from "@/components/Logo";
import SEO from "@/components/SEO";

const SharedCoachPlan = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data, error } = await supabase
        .from("coach_plans")
        .select("client_name, goal, start_date, end_date, peptides, supplements, titration_schedule, injection_sites, timing_notes, safety_notes, coach_rationale, client_notes, share_expires_at")
        .eq("share_token", token)
        .eq("share_enabled", true)
        .maybeSingle();

      if (error || !data) {
        setError("This share link is invalid, has been revoked, or has expired.");
      } else if (data.share_expires_at && new Date(data.share_expires_at) < new Date()) {
        setError("This share link has expired. Please request a new link from your coach.");
      } else {
        setPlan(data);
      }
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-10 max-w-md text-center">
          <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-heading font-semibold mb-2">Link unavailable</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${plan.client_name} — Bespoke Plan • Peptyl`} description="Your personalised peptide protocol." noIndex />

      {/* Top bar */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Bespoke Plan</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-heading font-semibold">{plan.client_name}</h1>
              {plan.goal && <Badge className="mt-2">{plan.goal}</Badge>}
            </div>
          </div>
          {(plan.start_date || plan.end_date) && (
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-3">
              <Calendar className="h-4 w-4" />
              {plan.start_date || "—"} → {plan.end_date || "ongoing"}
            </p>
          )}
        </Card>

        {/* Peptides */}
        {(plan.peptides as any[])?.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Syringe className="h-4 w-4 text-primary" /> Peptide Protocol
            </h3>
            <div className="space-y-3">
              {(plan.peptides as any[]).map((p, i) => (
                <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-semibold">{p.peptide_name}</h4>
                      {p.category && (
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.category}</p>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge variant="outline">{p.frequency}</Badge>
                      {p.evidence_grade && (
                        <Badge variant="secondary" className="text-[10px]">Evidence: {p.evidence_grade}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><p className="text-muted-foreground">Dose</p><p className="font-semibold">{p.dose_mg} mg</p></div>
                    <div><p className="text-muted-foreground">Vial</p><p className="font-semibold">{p.vial_strength_mg} mg / {p.bac_water_ml} ml BAC</p></div>
                    <div><p className="text-muted-foreground">Clicks/dose</p><p className="font-semibold text-primary">{p.calc?.clicks ?? "—"}</p></div>
                    <div><p className="text-muted-foreground">Doses/vial</p><p className="font-semibold">{p.calc?.dosesPerVial ?? "—"}</p></div>
                  </div>
                  {p.benefits?.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Benefits</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.benefits.map((b: string, k: number) => (
                          <Badge key={k} variant="secondary" className="text-[11px] bg-primary/10 text-primary border-0">{b}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {p.mechanism && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Mechanism</p>
                      <p className="text-xs text-foreground/80">{p.mechanism}</p>
                    </div>
                  )}
                  {p.side_effects_common?.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Common Side Effects</p>
                      <p className="text-xs text-muted-foreground">{p.side_effects_common.join(" • ")}</p>
                    </div>
                  )}
                  {p.notes && (
                    <p className="text-xs text-muted-foreground italic pt-1 border-t border-border/50">{p.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Supplements */}
        {(plan.supplements as any[])?.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" /> Supplements
            </h3>
            <ul className="space-y-2">
              {(plan.supplements as any[]).map((s: any, i: number) => (
                <li key={i} className="text-sm flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground text-xs">{s.dose} • {s.frequency} • {s.timing}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Titration */}
        {(plan.titration_schedule as any[])?.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Titration Schedule</h3>
            <div className="space-y-2">
              {(plan.titration_schedule as any[]).map((t: any, i: number) => (
                <div key={i} className="text-sm flex gap-3 items-center">
                  <Badge variant="outline" className="w-20 justify-center">Week {t.week}</Badge>
                  <span className="font-medium">{t.dose_mg} mg</span>
                  {t.note && <span className="text-xs text-muted-foreground">— {t.note}</span>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {plan.injection_sites?.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Injection Sites</h3>
            <div className="flex gap-2 flex-wrap">
              {plan.injection_sites.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
            </div>
          </Card>
        )}

        {plan.timing_notes && (
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Timing</h3>
            <p className="text-sm whitespace-pre-wrap">{plan.timing_notes}</p>
          </Card>
        )}

        {plan.safety_notes && (
          <Card className="p-6 border-amber-500/30 bg-amber-500/5">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" /> Safety Notes
            </h3>
            <p className="text-sm whitespace-pre-wrap">{plan.safety_notes}</p>
          </Card>
        )}

        {plan.coach_rationale && (
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Coach Rationale</h3>
            <p className="text-sm whitespace-pre-wrap">{plan.coach_rationale}</p>
          </Card>
        )}

        {plan.client_notes && (
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Notes for You</h3>
            <p className="text-sm whitespace-pre-wrap">{plan.client_notes}</p>
          </Card>
        )}

        <p className="text-[10px] text-center text-muted-foreground pt-4 pb-8">
          For research and educational purposes only. Not medical advice.<br />
          Consult a qualified healthcare professional before commencing any protocol.
        </p>
      </main>
    </div>
  );
};

export default SharedCoachPlan;
