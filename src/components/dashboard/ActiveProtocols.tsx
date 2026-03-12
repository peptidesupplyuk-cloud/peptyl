import { useState } from "react";
import { Pause, Play, CheckCircle2, Clock, FlaskConical, Trash2, Pill, CheckCircle, Info, Settings2 } from "lucide-react";
import PeptideInfoTooltip from "./PeptideInfoTooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useProtocols, useUpdateProtocolStatus, useDeleteProtocol, type Protocol } from "@/hooks/use-protocols";
import { useGenerateScorecard } from "@/hooks/use-protocol-history";
import AdjustProtocolDialog from "./AdjustProtocolDialog";
import { differenceInDays, subDays, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ActiveProtocols = () => {
  const { data: protocols = [], isLoading } = useProtocols();
  const updateStatus = useUpdateProtocolStatus();
  const deleteProtocol = useDeleteProtocol();
  const generateScorecard = useGenerateScorecard();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<Protocol | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Protocol | null>(null);
  const [completeStep, setCompleteStep] = useState<1 | 2>(1);
  const [consentChecked, setConsentChecked] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<Protocol | null>(null);
  const active = protocols.filter((p) => p.status === "active");
  const paused = protocols.filter((p) => p.status === "paused");
  const completed = protocols.filter((p) => p.status === "completed");

  const handleLogRetestNow = async (p: Protocol) => {
    // Mark complete, create outcome record, then navigate
    await handleFinalComplete(p, false);
    navigate(`/dashboard?tab=biomarkers&retest=true&protocolId=${p.id}`);
  };

  const handleFinalComplete = async (p: Protocol, consent: boolean) => {
    if (!user) return;
    setCompleting(true);
    try {
      // 1. Mark protocol complete
      await supabase.from("protocols").update({ status: "completed" }).eq("id", p.id);

      // 2. Build outcome record
      const protocolSnapshot = p.peptides.map((pp) => ({
        peptide_name: pp.peptide_name,
        dose_mcg: pp.dose_mcg,
        frequency: pp.frequency,
        route: pp.route,
      }));
      if (p.supplements?.length) {
        protocolSnapshot.push(...(p.supplements as any));
      }

      // Genotype signals from latest DNA report
      let dnaReportId: string | null = null;
      let genotypeSignals: Record<string, string> = {};
      let aggregationGenotypeKey: string | null = null;
      const { data: latestDna } = await supabase
        .from("dna_reports")
        .select("id, report_json")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latestDna) {
        dnaReportId = latestDna.id;
        const report = latestDna.report_json as any;
        const geneResults = report?.gene_results ?? report?.genes ?? [];
        if (Array.isArray(geneResults)) {
          for (const g of geneResults) {
            if (g.gene && g.genotype) {
              genotypeSignals[g.gene] = g.genotype;
            }
          }
          // Top 3 genes for aggregation key
          const top3 = geneResults.slice(0, 3).map((g: any) => `${g.gene}_${g.genotype}`);
          if (top3.length > 0) aggregationGenotypeKey = top3.join("+");
        }
      }

      // Baseline panel (earliest panel linked to this protocol)
      let baselinePanelId: string | null = null;
      let baselineDate: string | null = null;
      let baselineMarkers: Record<string, number> = {};
      const { data: baselinePanel } = await (supabase
        .from("bloodwork_panels")
        .select("id, test_date, protocol_id") as any)
        .eq("protocol_id", p.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (baselinePanel) {
        baselinePanelId = baselinePanel.id;
        baselineDate = baselinePanel.test_date;
        const { data: markers } = await supabase
          .from("bloodwork_markers")
          .select("marker_name, value")
          .eq("panel_id", baselinePanel.id);
        for (const m of markers ?? []) {
          if (m.value != null) baselineMarkers[m.marker_name] = Number(m.value);
        }
      }

      // Adherence: completed / total past-due injection logs
      const { count: totalLogs } = await supabase
        .from("injection_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("scheduled_time", new Date().toISOString())
        .in("protocol_peptide_id", p.peptides.map((pp) => pp.id));
      const { count: completedLogs } = await supabase
        .from("injection_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "done")
        .in("protocol_peptide_id", p.peptides.map((pp) => pp.id));
      const adherence = totalLogs && totalLogs > 0 ? Math.round(((completedLogs ?? 0) / totalLogs) * 100) : null;

      // Whoop baseline: 14 days before protocol start
      const protocolStart = new Date(p.start_date);
      const baselineStart = format(subDays(protocolStart, 14), "yyyy-MM-dd");
      const baselineEnd = format(subDays(protocolStart, 1), "yyyy-MM-dd");
      const { data: whoopBaseline } = await supabase
        .from("whoop_daily_metrics")
        .select("hrv, recovery_score, sleep_score")
        .eq("user_id", user.id)
        .gte("date", baselineStart)
        .lte("date", baselineEnd);

      const avg = (arr: (number | null)[]): number | null => {
        const valid = arr.filter((v): v is number => v != null);
        return valid.length > 0 ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length * 10) / 10 : null;
      };

      const avgHrvBaseline = avg(whoopBaseline?.map((w) => w.hrv != null ? Number(w.hrv) : null) ?? []);
      const avgRecoveryBaseline = avg(whoopBaseline?.map((w) => w.recovery_score != null ? Number(w.recovery_score) : null) ?? []);
      const avgSleepBaseline = avg(whoopBaseline?.map((w) => w.sleep_score != null ? Number(w.sleep_score) : null) ?? []);

      const weeksOnProtocol = Math.round(differenceInDays(new Date(), protocolStart) / 7);

      // Insert outcome record
      await supabase.from("outcome_records").insert({
        user_id: user.id,
        protocol_id: p.id,
        protocol_start_date: p.start_date,
        protocol_snapshot: protocolSnapshot as any,
        genotype_signals: genotypeSignals as any,
        dna_report_id: dnaReportId,
        baseline_panel_id: baselinePanelId,
        baseline_date: baselineDate,
        baseline_markers: baselineMarkers as any,
        adherence_percentage: adherence,
        avg_hrv_baseline: avgHrvBaseline,
        avg_recovery_baseline: avgRecoveryBaseline,
        avg_sleep_score_baseline: avgSleepBaseline,
        aggregation_genotype_key: aggregationGenotypeKey,
        consented_to_aggregate: consent,
        weeks_on_protocol: weeksOnProtocol,
        status: "in_progress",
      } as any);

      // Generate scorecard on completion
      const dayNum = Math.max(1, Math.round((new Date().getTime() - new Date(p.start_date).getTime()) / 86400000) + 1);
      try {
        await generateScorecard.mutateAsync({
          protocolId: p.id,
          milestone: dayNum >= 90 ? "completion" : "early_completion",
          dayNumber: dayNum,
        });
      } catch (e) {
        // Non-critical — scorecard generation failure shouldn't block completion
        console.warn("Scorecard generation failed:", e);
      }

      // Invalidate queries
      updateStatus.mutate({ id: p.id, status: "completed" });

      toast({ title: "Protocol completed", description: `${p.name} has been marked as complete. Your scorecard has been generated.` });
    } catch (err: any) {
      toast({ title: "Error completing protocol", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setCompleting(false);
      setCompleteTarget(null);
      setCompleteStep(1);
      setConsentChecked(false);
    }
  };

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
                <span className="text-foreground flex items-center gap-1.5">{pp.peptide_name} <PeptideInfoTooltip peptideName={pp.peptide_name} /></span>
                <span className="text-muted-foreground">{pp.dose_mcg}mcg · {pp.frequency} · {pp.timing}</span>
              </div>
            ))}
          </div>
        )}

        {p.supplements && p.supplements.length > 0 && (
          <div className="space-y-1 border-t border-border/50 pt-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Pill className="h-3 w-3" /> Suggested Supplements
            </p>
            {p.supplements.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{s.name}</span>
                <span className="text-muted-foreground">{s.dose} · {s.frequency}</span>
              </div>
            ))}
          </div>
        )}

        {p.notes && (
          <p className="text-[10px] text-muted-foreground italic border-t border-border/50 pt-2">{p.notes}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Day {daysActive + 1}</span>
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
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setCompleteTarget(p); setCompleteStep(1); }}>
                  <CheckCircle2 className="h-3 w-3" />
                  Complete Early
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: p.id, status: "paused" })}>
                  <Pause className="h-3 w-3" />
                </Button>
              </>
            )}
            {p.status === "paused" && (
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateStatus.mutate({ id: p.id, status: "active" })}>
                <Play className="h-3 w-3" />
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => setDeleteTarget(p)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-primary" />
        <h2 className="font-heading font-semibold text-foreground">Your Active Plan</h2>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Protocol</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This will permanently remove the protocol and all its peptide entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteProtocol.mutate(deleteTarget.id, {
                    onSuccess: () => {
                      toast({ title: "Protocol deleted", description: `${deleteTarget.name} has been removed.` });
                      setDeleteTarget(null);
                    },
                    onError: (err: any) => {
                      toast({ title: "Error", description: err?.message || "Failed to delete.", variant: "destructive" });
                    },
                  });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Protocol Completion Modal */}
      <Dialog open={!!completeTarget} onOpenChange={(open) => { if (!open && !completing) { setCompleteTarget(null); setCompleteStep(1); setConsentChecked(false); } }}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CheckCircle className="h-5 w-5 text-primary" />
              Great work! Protocol complete
            </DialogTitle>
          </DialogHeader>

          {completeStep === 1 && (
            <div className="space-y-4">
              <div className="border-l-2 border-primary pl-4 py-2 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Log your results</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Have you retested your bloods since starting this protocol? Comparing your results is the most powerful thing you can do.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 shadow-brand"
                  disabled={completing}
                  onClick={() => completeTarget && handleLogRetestNow(completeTarget)}
                >
                  {completing ? "Saving..." : "Log retest now"}
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  disabled={completing}
                  onClick={() => setCompleteStep(2)}
                >
                  I'll do it later
                </Button>
              </div>
            </div>
          )}

          {completeStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consent-aggregate"
                    checked={consentChecked}
                    onCheckedChange={(checked) => setConsentChecked(checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="consent-aggregate" className="text-sm text-foreground cursor-pointer leading-snug">
                    Share my anonymised results to help the community
                  </label>
                </div>
                <div className="flex items-start gap-2 pl-6">
                  <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your results are never shown individually. Data only appears when 5 or more people with the same genetic profile complete the same protocol. Your name, email and raw genetic data are never included.
                  </p>
                </div>
              </div>

              <Button
                className="w-full shadow-brand"
                disabled={completing}
                onClick={() => completeTarget && handleFinalComplete(completeTarget, consentChecked)}
              >
                {completing ? "Completing..." : "Complete Protocol"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveProtocols;