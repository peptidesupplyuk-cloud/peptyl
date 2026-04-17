import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Syringe, Pill, AlertTriangle, Loader2, Lock, Sparkles, Target, Clock } from "lucide-react";
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
        // Hydrate peptides with enrichment library so older plans show benefits/mechanism/etc.
        const peptides = (data.peptides as any[]) || [];
        const names = peptides.map((p: any) => p.peptide_name).filter(Boolean);
        if (names.length) {
          const { data: lib } = await supabase
            .from("peptides_enriched")
            .select("name, primary_effects, mechanism_of_action, side_effects_common, contraindications, drug_interactions, evidence_grade, category")
            .in("name", names);
          const libMap = new Map((lib || []).map((l: any) => [l.name, l]));
          data.peptides = peptides.map((p: any) => {
            const l: any = libMap.get(p.peptide_name) || {};
            return {
              ...p,
              benefits: p.benefits?.length ? p.benefits : l.primary_effects || [],
              mechanism: p.mechanism || l.mechanism_of_action || null,
              side_effects_common: p.side_effects_common?.length ? p.side_effects_common : l.side_effects_common || [],
              contraindications: p.contraindications?.length ? p.contraindications : l.contraindications || [],
              drug_interactions: p.drug_interactions?.length ? p.drug_interactions : l.drug_interactions || [],
              evidence_grade: p.evidence_grade || l.evidence_grade || null,
              category: p.category || l.category || null,
            };
          });
        }
        setPlan(data);
      }
      setLoading(false);
    })();
  }, [token]);

  // Round clicks for display: users can only take whole clicks (>=18.5 → 19)
  const displayClicks = (n: any) => {
    if (n === null || n === undefined || n === "") return "—";
    const num = Number(n);
    if (!isFinite(num)) return "—";
    return Math.round(num);
  };

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
      <SEO title={`${plan.client_name} — Bespoke Plan • Peptyl`} description="Your personalised peptide protocol." path={`/plan/${token}`} />

      {/* Top bar */}
      <header className="border-b border-border/50 bg-card/40 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Bespoke Plan</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Hero header */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-10">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold mb-3">Personalised Protocol</p>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight mb-4">{plan.client_name}</h1>
            {plan.goal && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-5">
                <Target className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-semibold text-primary">{plan.goal}</span>
              </div>
            )}
            {(plan.start_date || plan.end_date) && (
              <p className="text-base text-muted-foreground flex items-center gap-2.5">
                <Calendar className="h-4 w-4" />
                <span className="font-medium text-foreground">{plan.start_date || "—"}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium text-foreground">{plan.end_date || "ongoing"}</span>
              </p>
            )}
          </div>
        </section>

        {/* Peptides */}
        {(plan.peptides as any[])?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Syringe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold">Peptide Protocol</h2>
                <p className="text-sm text-muted-foreground">{(plan.peptides as any[]).length} compound{(plan.peptides as any[]).length > 1 ? "s" : ""} prescribed</p>
              </div>
            </div>

            <div className="space-y-5">
              {(plan.peptides as any[]).map((p, i) => (
                <Card key={i} className="overflow-hidden border-border/60">
                  {/* Peptide header */}
                  <div className="p-6 pb-5 border-b border-border/50">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="text-2xl font-heading font-bold tracking-tight">{p.peptide_name}</h3>
                        {p.category && (
                          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-1.5 font-medium">{p.category}</p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className="text-sm px-3 py-1 bg-primary text-primary-foreground hover:bg-primary">{p.frequency}</Badge>
                        {p.evidence_grade && (
                          <Badge variant="outline" className="text-xs px-3 py-1">Evidence: {p.evidence_grade}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hero metric: Clicks */}
                  <div className="px-6 py-6 bg-gradient-to-br from-primary/10 to-transparent border-b border-border/50">
                    <div className="flex items-center justify-between gap-6 flex-wrap">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-primary font-bold mb-1">Clicks per dose</p>
                        <div className="flex items-baseline gap-3">
                          <span className="text-6xl font-heading font-bold text-primary leading-none tabular-nums">{p.calc?.clicks ?? "—"}</span>
                          <span className="text-base text-muted-foreground">clicks</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-1">Doses per vial</p>
                        <span className="text-4xl font-heading font-bold tabular-nums">{p.calc?.dosesPerVial ?? "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dose & vial details */}
                  <div className="grid grid-cols-2 divide-x divide-border/50 border-b border-border/50">
                    <div className="p-5">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1.5">Dose</p>
                      <p className="text-xl font-bold tabular-nums">{p.dose_mg} <span className="text-base font-normal text-muted-foreground">mg</span></p>
                    </div>
                    <div className="p-5">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1.5">Vial</p>
                      <p className="text-xl font-bold tabular-nums">{p.vial_strength_mg} <span className="text-base font-normal text-muted-foreground">mg</span></p>
                      <p className="text-xs text-muted-foreground mt-0.5">+ {p.bac_water_ml} ml BAC water</p>
                    </div>
                  </div>

                  {/* Benefits + clinical content */}
                  <div className="p-6 space-y-5">
                    {p.benefits?.length > 0 && (
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2.5">Benefits</p>
                        <div className="flex flex-wrap gap-2">
                          {p.benefits.map((b: string, k: number) => (
                            <span key={k} className="text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {p.mechanism && (
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-2">Mechanism of Action</p>
                        <p className="text-base text-foreground/90 leading-relaxed">{p.mechanism}</p>
                      </div>
                    )}

                    {p.side_effects_common?.length > 0 && (
                      <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 font-bold mb-1.5">Common Side Effects</p>
                        <p className="text-sm text-foreground/85">{p.side_effects_common.join(" • ")}</p>
                      </div>
                    )}

                    {p.notes && (
                      <div className="pt-4 border-t border-border/50">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-1.5 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" /> Coach notes
                        </p>
                        <p className="text-sm text-foreground/85 italic leading-relaxed">{p.notes}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Supplements */}
        {(plan.supplements as any[])?.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-heading font-bold">Supplements</h2>
            </div>
            <Card className="p-6">
              <ul className="divide-y divide-border/50">
                {(plan.supplements as any[]).map((s: any, i: number) => (
                  <li key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 flex-wrap">
                    <span className="text-base font-semibold">{s.name}</span>
                    <span className="text-sm text-muted-foreground">{s.dose} • {s.frequency} • {s.timing}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        )}

        {/* Titration */}
        {(plan.titration_schedule as any[])?.length > 0 && (
          <section>
            <h2 className="text-2xl font-heading font-bold mb-5">Titration Schedule</h2>
            <Card className="p-6">
              <div className="space-y-3">
                {(plan.titration_schedule as any[]).map((t: any, i: number) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Badge variant="outline" className="w-24 justify-center text-sm py-1">Week {t.week}</Badge>
                    <span className="text-lg font-bold tabular-nums">{t.dose_mg} <span className="text-sm font-normal text-muted-foreground">mg</span></span>
                    {t.note && <span className="text-sm text-muted-foreground">— {t.note}</span>}
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        {plan.injection_sites?.length > 0 && (
          <section>
            <h2 className="text-2xl font-heading font-bold mb-5">Injection Sites</h2>
            <Card className="p-6">
              <div className="flex gap-2 flex-wrap">
                {plan.injection_sites.map((s: string) => (
                  <Badge key={s} variant="secondary" className="text-sm px-3 py-1.5">{s}</Badge>
                ))}
              </div>
            </Card>
          </section>
        )}

        {plan.timing_notes && (
          <section>
            <h2 className="text-2xl font-heading font-bold mb-5">Timing</h2>
            <Card className="p-6">
              <p className="text-base whitespace-pre-wrap leading-relaxed">{plan.timing_notes}</p>
            </Card>
          </section>
        )}

        {plan.safety_notes && (
          <section>
            <Card className="p-6 border-amber-500/40 bg-amber-500/5">
              <h2 className="text-xl font-heading font-bold mb-3 flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" /> Safety Notes
              </h2>
              <p className="text-base whitespace-pre-wrap leading-relaxed text-foreground/90">{plan.safety_notes}</p>
            </Card>
          </section>
        )}

        {plan.coach_rationale && (
          <section>
            <h2 className="text-2xl font-heading font-bold mb-5">Coach Rationale</h2>
            <Card className="p-6">
              <p className="text-base whitespace-pre-wrap leading-relaxed">{plan.coach_rationale}</p>
            </Card>
          </section>
        )}

        {plan.client_notes && (
          <section>
            <h2 className="text-2xl font-heading font-bold mb-5">Notes for You</h2>
            <Card className="p-6">
              <p className="text-base whitespace-pre-wrap leading-relaxed">{plan.client_notes}</p>
            </Card>
          </section>
        )}

        <p className="text-xs text-center text-muted-foreground pt-6 pb-12 leading-relaxed">
          For research and educational purposes only. Not medical advice.<br />
          Consult a qualified healthcare professional before commencing any protocol.
        </p>
      </main>
    </div>
  );
};

export default SharedCoachPlan;
