import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  const secret = Deno.env.get("DNA_PIPELINE_SECRET");
  if (secret && authHeader !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json();
    const { action } = body;
    let result: any = { ok: true };

    switch (action) {
      case "update_status": {
        const { reportId, status, progress } = body;
        await supabase.from("dna_reports").update({
          pipeline_status: status,
          pipeline_progress: progress,
          pipeline_updated_at: new Date().toISOString(),
        }).eq("id", reportId);
        break;
      }

      case "update_error": {
        const { reportId, error, durationMs } = body;
        await supabase.from("dna_reports").update({
          pipeline_status: "failed",
          pipeline_error: error,
          pipeline_duration_ms: durationMs || null,
          pipeline_updated_at: new Date().toISOString(),
        }).eq("id", reportId);
        break;
      }

      case "read_internal": {
        const { userId, detectedGenes } = body;
        const [peptides, supplements, protocols, wearable, outcomes, bloodwork] =
          await Promise.all([
            supabase.from("peptides_enriched").select("*").limit(50),
            supabase.from("supplements_enriched").select("*").limit(50),
            supabase.from("active_protocols")
              .select("compound_name, dose, frequency, start_date, day_count, adherence_percentage")
              .eq("user_id", userId).eq("status", "active"),
            supabase.from("whoop_daily_metrics")
              .select("recovery_score, hrv, resting_hr, sleep_score, strain")
              .eq("user_id", userId).order("date", { ascending: false }).limit(30),
            supabase.from("outcome_records")
              .select("compound_name, gene_profile, biomarker_deltas, duration_weeks, user_rating")
              .eq("consented_to_aggregate", true).limit(100),
            supabase.from("bloodwork_panels")
              .select("panel_date, results")
              .eq("user_id", userId).order("panel_date", { ascending: false }).limit(5),
          ]);

        let wearableTrends = null;
        const metrics = wearable.data || [];
        if (metrics.length > 0) {
          const avg = (arr: number[]) =>
            arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
          wearableTrends = {
            period: "30 days",
            avgRecovery: avg(metrics.map((m: any) => m.recovery_score).filter(Boolean)),
            avgHRV: avg(metrics.map((m: any) => m.hrv).filter(Boolean)),
            avgRestingHR: avg(metrics.map((m: any) => m.resting_hr).filter(Boolean)),
            avgSleepScore: avg(metrics.map((m: any) => m.sleep_score).filter(Boolean)),
            avgStrain: avg(metrics.map((m: any) => m.strain).filter(Boolean)),
            dataPoints: metrics.length,
          };
        }

        const allOutcomes = outcomes.data || [];
        const matchingOutcomes = allOutcomes.filter((o: any) => {
          const profile = JSON.stringify(o.gene_profile || {}).toLowerCase();
          return (detectedGenes || []).some((g: string) => profile.includes(g.toLowerCase()));
        }).slice(0, 20);

        result = {
          data: {
            peptides: peptides.data || [],
            supplements: supplements.data || [],
            activeProtocols: protocols.data || [],
            wearableTrends,
            communityOutcomes: matchingOutcomes,
            userBloodworkHistory: bloodwork.data || [],
          },
        };
        break;
      }

      case "save_report": {
        const { reportId, ...reportData } = body;
        delete reportData.action;
        await supabase.from("dna_reports").update({
          ...reportData,
          pipeline_status: "complete",
          pipeline_progress: 100,
          pipeline_updated_at: new Date().toISOString(),
        }).eq("id", reportId);
        break;
      }

      case "consume_credit": {
        const { userId, tier } = body;
        const col = tier === "advanced" ? "dna_advanced_unlocked" : "dna_standard_unlocked";
        await supabase.from("profiles").update({ [col]: false }).eq("user_id", userId);
        break;
      }

      case "get_user_email": {
        const { userId } = body;
        const { data } = await supabase.auth.admin.getUserById(userId);
        result = { email: data?.user?.email || null };
        break;
      }

      case "get_status": {
        const { reportId } = body;
        const { data, error } = await supabase
          .from("dna_reports")
          .select("pipeline_status, pipeline_progress, pipeline_updated_at, pipeline_quality_score, pipeline_error, pipeline_duration_ms")
          .eq("id", reportId)
          .single();
        if (error) throw error;
        result = { data };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("pipeline-callback error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
