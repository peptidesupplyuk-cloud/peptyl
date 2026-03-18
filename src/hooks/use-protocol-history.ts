import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInCalendarDays, startOfDay, subDays, format } from "date-fns";

export interface ProtocolChangeLog {
  id: string;
  protocol_id: string;
  user_id: string;
  change_type: string;
  change_detail: Record<string, any>;
  day_number: number | null;
  created_at: string;
}

export interface ProtocolScorecard {
  id: string;
  protocol_id: string;
  user_id: string;
  milestone: string;
  day_number: number;
  adherence_percentage: number | null;
  streak_best: number | null;
  biomarker_improvements: any[];
  wearable_improvements: any[];
  protocol_snapshot: any[];
  changes_made: any[];
  summary_text: string | null;
  created_at: string;
}

/* ─── Change Log ─── */

export function useProtocolChangeLogs(protocolId: string | null) {
  return useQuery({
    queryKey: ["protocol_change_log", protocolId],
    enabled: !!protocolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("protocol_change_log")
        .select("*")
        .eq("protocol_id", protocolId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as ProtocolChangeLog[];
    },
  });
}

export function useAddProtocolChange() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (params: {
      protocol_id: string;
      change_type: string;
      change_detail: Record<string, any>;
      day_number: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("protocol_change_log").insert({
        ...params,
        user_id: user.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["protocol_change_log", vars.protocol_id] });
      qc.invalidateQueries({ queryKey: ["protocols"] });
    },
  });
}

/* ─── Scorecards ─── */

export function useProtocolScorecards(protocolId?: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["protocol_scorecards", protocolId ?? "all", user?.id],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from("protocol_scorecards")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (protocolId) q = q.eq("protocol_id", protocolId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as ProtocolScorecard[];
    },
  });
}

export function useGenerateScorecard() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      protocolId: string;
      milestone: string;
      dayNumber: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // 1. Get protocol + peptides
      const { data: protocol } = await supabase
        .from("protocols")
        .select("*")
        .eq("id", params.protocolId)
        .single();
      if (!protocol) throw new Error("Protocol not found");

      const { data: peptides } = await supabase
        .from("protocol_peptides")
        .select("*")
        .eq("protocol_id", params.protocolId);

      const pepIds = (peptides ?? []).map((p) => p.id);

      // 2. Adherence
      const now = new Date();
      const { count: totalLogs } = await supabase
        .from("injection_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("scheduled_time", now.toISOString())
        .in("protocol_peptide_id", pepIds);
      const { count: completedLogs } = await supabase
        .from("injection_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed")
        .in("protocol_peptide_id", pepIds);
      const adherence = totalLogs && totalLogs > 0
        ? Math.round(((completedLogs ?? 0) / totalLogs) * 100)
        : null;

      // 3. Streak metrics removed: adherence is the primary consistency metric
      const bestStreak = null;

      // 4. Wearable improvements
      const protocolStart = new Date(protocol.start_date);
      const baselineStart = format(subDays(protocolStart, 14), "yyyy-MM-dd");
      const baselineEnd = format(subDays(protocolStart, 1), "yyyy-MM-dd");
      const protocolEnd = format(now, "yyyy-MM-dd");

      const { data: whoopBaseline } = await supabase
        .from("whoop_daily_metrics")
        .select("hrv, recovery_score, sleep_score")
        .eq("user_id", user.id)
        .gte("date", baselineStart)
        .lte("date", baselineEnd);

      const { data: whoopProtocol } = await supabase
        .from("whoop_daily_metrics")
        .select("hrv, recovery_score, sleep_score")
        .eq("user_id", user.id)
        .gte("date", format(protocolStart, "yyyy-MM-dd"))
        .lte("date", protocolEnd);

      const avg = (arr: (number | null | undefined)[]): number | null => {
        const valid = arr.filter((v): v is number => v != null);
        return valid.length > 0 ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length * 10) / 10 : null;
      };

      const wearableImprovements: any[] = [];
      const metrics = ["hrv", "recovery_score", "sleep_score"] as const;
      const metricLabels = { hrv: "HRV", recovery_score: "Recovery", sleep_score: "Sleep" };
      for (const m of metrics) {
        const bAvg = avg(whoopBaseline?.map((w) => w[m] != null ? Number(w[m]) : null) ?? []);
        const pAvg = avg(whoopProtocol?.map((w) => w[m] != null ? Number(w[m]) : null) ?? []);
        if (bAvg != null && pAvg != null) {
          const delta = Math.round(((pAvg - bAvg) / bAvg) * 1000) / 10;
          wearableImprovements.push({
            metric: metricLabels[m],
            baseline_avg: bAvg,
            protocol_avg: pAvg,
            delta_pct: delta,
          });
        }
      }

      // 5. Biomarker improvements
      const { data: baselinePanel } = await (supabase
        .from("bloodwork_panels")
        .select("id, test_date") as any)
        .eq("protocol_id", params.protocolId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      const biomarkerImprovements: any[] = [];
      if (baselinePanel) {
        const { data: latestPanel } = await (supabase
          .from("bloodwork_panels")
          .select("id, test_date") as any)
          .eq("protocol_id", params.protocolId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestPanel && latestPanel.id !== baselinePanel.id) {
          const { data: baseMarkers } = await supabase
            .from("bloodwork_markers")
            .select("marker_name, value")
            .eq("panel_id", baselinePanel.id);
          const { data: latestMarkers } = await supabase
            .from("bloodwork_markers")
            .select("marker_name, value")
            .eq("panel_id", latestPanel.id);

          const baseMap = new Map((baseMarkers ?? []).map((m) => [m.marker_name, m.value]));
          for (const lm of latestMarkers ?? []) {
            const bv = baseMap.get(lm.marker_name);
            if (bv != null && lm.value != null) {
              const delta = Math.round(((Number(lm.value) - Number(bv)) / Number(bv)) * 1000) / 10;
              biomarkerImprovements.push({
                name: lm.marker_name,
                baseline: Number(bv),
                current: Number(lm.value),
                delta_pct: delta,
                improved: Math.abs(delta) > 2,
              });
            }
          }
        }
      }

      // 6. Changes made
      const { data: changes } = await supabase
        .from("protocol_change_log")
        .select("*")
        .eq("protocol_id", params.protocolId)
        .order("created_at", { ascending: true });

      // 7. Protocol snapshot
      const snapshot = (peptides ?? []).map((p) => ({
        peptide_name: p.peptide_name,
        dose_mcg: p.dose_mcg,
        frequency: p.frequency,
        route: p.route,
        timing: p.timing,
      }));
      const supps = protocol.supplements;
      if (Array.isArray(supps)) snapshot.push(...(supps as any));

      // 8. Generate summary text
      const improvementCount = biomarkerImprovements.filter((b) => b.improved).length;
      const wearableGains = wearableImprovements.filter((w) => w.delta_pct > 0);
      let summary = `${params.milestone.replace("_", " ")} scorecard for "${protocol.name}". `;
      summary += `Day ${params.dayNumber}. `;
      if (adherence != null) summary += `Adherence: ${adherence}%. `;
      if (improvementCount > 0) summary += `${improvementCount} biomarker(s) improved. `;
      if (wearableGains.length > 0) {
        summary += `Wearable gains: ${wearableGains.map((w) => `${w.metric} +${w.delta_pct}%`).join(", ")}. `;
      }
      if ((changes ?? []).length > 0) {
        summary += `${(changes ?? []).length} protocol adjustment(s) made. `;
      }

      // 9. Insert scorecard
      const { error } = await supabase.from("protocol_scorecards").insert({
        protocol_id: params.protocolId,
        user_id: user.id,
        milestone: params.milestone,
        day_number: params.dayNumber,
        adherence_percentage: adherence,
        streak_best: null,
        biomarker_improvements: biomarkerImprovements as any,
        wearable_improvements: wearableImprovements as any,
        protocol_snapshot: snapshot as any,
        changes_made: (changes ?? []).map((c: any) => c.change_detail) as any,
        summary_text: summary,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["protocol_scorecards"] });
    },
  });
}

/* ─── Adjust Protocol (add peptide/supplement mid-cycle) ─── */

export function useAddPeptideToProtocol() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      protocol_id: string;
      peptide_name: string;
      dose_mcg: number;
      frequency: string;
      timing: string;
      route: string;
      day_number: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Insert peptide
      const { error: pepErr } = await supabase.from("protocol_peptides").insert({
        protocol_id: params.protocol_id,
        peptide_name: params.peptide_name,
        dose_mcg: params.dose_mcg,
        frequency: params.frequency,
        timing: params.timing,
        route: params.route,
      });
      if (pepErr) throw pepErr;

      // Log the change
      await supabase.from("protocol_change_log").insert({
        protocol_id: params.protocol_id,
        user_id: user.id,
        change_type: "peptide_added",
        change_detail: {
          peptide_name: params.peptide_name,
          dose_mcg: params.dose_mcg,
          frequency: params.frequency,
        },
        day_number: params.day_number,
      } as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["protocols"] });
      qc.invalidateQueries({ queryKey: ["protocol_change_log"] });
    },
  });
}

export function useAddSupplementToProtocol() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      protocol_id: string;
      supplement: { name: string; dose: string; frequency: string; timing?: string };
      day_number: number;
      current_supplements: any[];
    }) => {
      if (!user) throw new Error("Not authenticated");

      const updated = [...params.current_supplements, params.supplement];
      const { error } = await supabase
        .from("protocols")
        .update({ supplements: updated as any })
        .eq("id", params.protocol_id);
      if (error) throw error;

      // Log the change
      await supabase.from("protocol_change_log").insert({
        protocol_id: params.protocol_id,
        user_id: user.id,
        change_type: "supplement_added",
        change_detail: {
          name: params.supplement.name,
          dose: params.supplement.dose,
          frequency: params.supplement.frequency,
        },
        day_number: params.day_number,
      } as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["protocols"] });
      qc.invalidateQueries({ queryKey: ["protocol_change_log"] });
    },
  });
}
