import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BIOMARKERS } from "@/data/biomarker-ranges";

export interface BloodworkPanel {
  id: string;
  user_id: string;
  test_date: string;
  panel_type: string;
  created_at: string;
  protocol_id: string | null;
  dna_report_id: string | null;
  markers: { marker_name: string; value: number; unit: string }[];
}

export function useBloodworkPanels() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bloodwork_panels", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: panels, error } = await supabase
        .from("bloodwork_panels")
        .select("*")
        .order("test_date", { ascending: false });
      if (error) throw error;

      const results: BloodworkPanel[] = [];
      for (const p of panels ?? []) {
        const { data: markers } = await supabase
          .from("bloodwork_markers")
          .select("marker_name, value, unit")
          .eq("panel_id", p.id);
        results.push({ ...p, markers: markers ?? [] });
      }
      return results;
    },
  });
}

export function useSaveBloodwork() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      testDate,
      panelType,
      markers,
      protocolId,
      dnaReportId,
    }: {
      testDate: string;
      panelType: string;
      markers: { marker_name: string; value: number; unit: string }[];
      protocolId?: string | null;
      dnaReportId?: string | null;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const insertPayload: { user_id: string; test_date: string; panel_type: string; protocol_id?: string; dna_report_id?: string } = {
        user_id: user.id,
        test_date: testDate,
        panel_type: panelType,
      };
      if (protocolId) insertPayload.protocol_id = protocolId;
      if (dnaReportId) insertPayload.dna_report_id = dnaReportId;

      const { data: panel, error: pErr } = await supabase
        .from("bloodwork_panels")
        .insert(insertPayload)
        .select()
        .single();
      if (pErr) throw pErr;

      // Auto-link latest DNA report if none explicitly provided
      if (!dnaReportId) {
        const { data: latestDna } = await supabase
          .from("dna_reports")
          .select("id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestDna) {
          await supabase
            .from("bloodwork_panels")
            .update({ dna_report_id: latestDna.id })
            .eq("id", panel.id);
        }
      }

      const rows = markers
        .filter((m) => m.value !== null && m.value !== undefined && !isNaN(m.value))
        .map((m) => ({ panel_id: panel.id, marker_name: m.marker_name, value: m.value, unit: m.unit }));

      if (rows.length > 0) {
        const { error: mErr } = await supabase.from("bloodwork_markers").insert(rows);
        if (mErr) throw mErr;
      }

      // --- Outcome delta calculation for retest panels ---
      if (panelType.startsWith("retest") && protocolId) {
        try {
          const { data: outcomeRecord } = await supabase
            .from("outcome_records")
            .select("*")
            .eq("protocol_id", protocolId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (outcomeRecord && outcomeRecord.baseline_markers && Object.keys(outcomeRecord.baseline_markers as Record<string, unknown>).length > 0) {
            const baselineMarkers = outcomeRecord.baseline_markers as Record<string, number>;
            const retestMarkers: Record<string, number> = {};
            for (const m of rows) {
              retestMarkers[m.marker_name] = m.value;
            }

            const outcomeMarkers: Record<string, { before: number; after: number; change: number; pct_change: number; direction: string }> = {};
            let improvedCount = 0;
            let totalCompared = 0;

            for (const [markerName, retestValue] of Object.entries(retestMarkers)) {
              if (baselineMarkers[markerName] == null) continue;
              const baselineValue = baselineMarkers[markerName];
              const biomarkerDef = BIOMARKERS.find((b) => b.key === markerName || b.name === markerName);

              const change = Number((retestValue - baselineValue).toFixed(2));
              const pctChange = baselineValue !== 0 ? Number((((retestValue - baselineValue) / baselineValue) * 100).toFixed(1)) : 0;

              let direction = "unchanged";
              if (Math.abs(pctChange) >= 2 && biomarkerDef) {
                const optimalMid = (biomarkerDef.optimalMin + biomarkerDef.optimalMax) / 2;
                const baselineDist = Math.abs(baselineValue - optimalMid);
                const retestDist = Math.abs(retestValue - optimalMid);
                direction = retestDist < baselineDist ? "improved" : "worsened";
              } else if (Math.abs(pctChange) >= 2) {
                direction = change > 0 ? "improved" : "worsened";
              }

              outcomeMarkers[markerName] = { before: baselineValue, after: retestValue, change, pct_change: pctChange, direction };
              totalCompared++;
              if (direction === "improved") improvedCount++;
            }

            let overallResponderStatus = "non_responder";
            if (totalCompared > 0) {
              const pct = improvedCount / totalCompared;
              if (pct >= 0.6) overallResponderStatus = "strong_responder";
              else if (pct >= 0.3) overallResponderStatus = "responder";
            }

            // Whoop averages during protocol
            let avgHrvProtocol: number | null = null;
            let avgRecoveryProtocol: number | null = null;
            let avgSleepScoreProtocol: number | null = null;

            if (outcomeRecord.protocol_start_date) {
              const { data: whoopData } = await supabase
                .from("whoop_daily_metrics")
                .select("hrv, recovery_score, sleep_score")
                .eq("user_id", user.id)
                .gte("date", outcomeRecord.protocol_start_date)
                .lte("date", testDate);

              if (whoopData && whoopData.length > 0) {
                const hrvVals = whoopData.filter((w) => w.hrv != null).map((w) => Number(w.hrv));
                const recVals = whoopData.filter((w) => w.recovery_score != null).map((w) => Number(w.recovery_score));
                const sleepVals = whoopData.filter((w) => w.sleep_score != null).map((w) => Number(w.sleep_score));
                if (hrvVals.length) avgHrvProtocol = Number((hrvVals.reduce((a, b) => a + b, 0) / hrvVals.length).toFixed(1));
                if (recVals.length) avgRecoveryProtocol = Number((recVals.reduce((a, b) => a + b, 0) / recVals.length).toFixed(1));
                if (sleepVals.length) avgSleepScoreProtocol = Number((sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length).toFixed(1));
              }
            }

            const baselineDate = outcomeRecord.baseline_date;
            const weeksOnProtocol = baselineDate ? Math.round((new Date(testDate).getTime() - new Date(baselineDate).getTime()) / (7 * 86400000)) : null;

            await supabase
              .from("outcome_records")
              .update({
                retest_panel_id: panel.id,
                retest_date: testDate,
                retest_markers: retestMarkers,
                outcome_markers: outcomeMarkers,
                overall_responder_status: overallResponderStatus,
                avg_hrv_protocol: avgHrvProtocol,
                avg_recovery_protocol: avgRecoveryProtocol,
                avg_sleep_score_protocol: avgSleepScoreProtocol,
                weeks_on_protocol: weeksOnProtocol,
                status: "completed",
              })
              .eq("id", outcomeRecord.id);
          }
        } catch (deltaErr) {
          console.error("Outcome delta calculation failed (non-blocking):", deltaErr);
        }
      }

      return panel;
    },
    onSuccess: (_, __, ___) => {
      qc.invalidateQueries({ queryKey: ["bloodwork_panels"] });
      qc.invalidateQueries({ queryKey: ["outcome_records"] });
    },
  });
}
