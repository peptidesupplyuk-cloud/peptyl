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
  const secret = Deno.env.get("DNA_PIPELINE_SECRET")?.trim();
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

        // Get the user_id before updating
        const { data: reportRow } = await supabase
          .from("dna_reports")
          .select("user_id")
          .eq("id", reportId)
          .single();

        // Only spread known columns to prevent silent update failures
        const safeUpdate: Record<string, any> = {
          pipeline_status: "complete",
          pipeline_progress: 100,
          pipeline_updated_at: new Date().toISOString(),
        };
        const knownColumns = [
          "report_json", "overall_score", "confidence", "narrative",
          "assessment_tier", "pipeline_quality_score", "pipeline_duration_ms",
          "pipeline_injected", "pipeline_issues", "pipeline_retry_count",
          "pipeline_timings", "plan_start_date",
        ];
        for (const col of knownColumns) {
          if (reportData[col] !== undefined) {
            safeUpdate[col] = reportData[col];
          }
        }

        const { error: updateErr } = await supabase
          .from("dna_reports")
          .update(safeUpdate)
          .eq("id", reportId);

        if (updateErr) {
          console.error("save_report update failed:", updateErr);
          throw new Error(`Failed to save report: ${updateErr.message}`);
        }

        // Only send email if update succeeded AND report has meaningful content
        const savedScore = safeUpdate.overall_score ?? 0;
        if (reportRow?.user_id && savedScore > 0) {
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(reportRow.user_id);
            const userEmail = userData?.user?.email;
            if (userEmail) {
              const resendKey = Deno.env.get("RESEND_API_KEY")?.trim();
              const reportUrl = `https://peptyl.lovable.app/dna/report/${reportId}`;
              if (resendKey) {
                await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${resendKey}`,
                  },
                  body: JSON.stringify({
                    from: "Peptyl <noreply@resend.dev>",
                    to: [userEmail],
                    subject: "🎉 Your Holistic Health Report is Ready!",
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                        <h1 style="color: #0d9488; font-size: 24px; margin-bottom: 16px;">Congratulations!</h1>
                        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                          Your new Holistic Health Assessment report has been generated and is ready to view.
                        </p>
                        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                          Our AI has analysed your data and produced personalised recommendations just for you.
                        </p>
                        <a href="${reportUrl}" style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                          Click here to view your report
                        </a>
                        <p style="color: #9ca3af; font-size: 13px; margin-top: 40px; line-height: 1.5;">
                          You can also view all your reports in the <a href="https://peptyl.lovable.app/dna/dashboard" style="color: #0d9488;">My Assessments</a> section.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
                          — The Peptyl Team
                        </p>
                      </div>
                    `,
                  }),
                });
                console.log(`Report-ready email sent to ${userEmail} for report ${reportId}`);
              }
            }
          } catch (emailErr) {
            console.error("Failed to send report-ready email:", emailErr);
          }
        }

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
