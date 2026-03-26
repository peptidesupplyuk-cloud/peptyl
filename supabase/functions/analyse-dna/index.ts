import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();
    const { reportId, userId, inputText, method, tier, lifestyleContext, questionnaireAnswers } = body;

    if (!reportId || !userId || !inputText) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Mark as queued
    await supabase.from("dna_reports").update({
      pipeline_status: "queued",
      pipeline_progress: 0,
      pipeline_updated_at: new Date().toISOString(),
      pipeline_error: null,
    }).eq("id", reportId);

    // Delegate to pipeline service
    const pipelineUrl = Deno.env.get("DNA_PIPELINE_URL");
    const pipelineSecret = Deno.env.get("DNA_PIPELINE_SECRET");

    const pipelineResponse = await fetch(`${pipelineUrl}/pipeline/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pipelineSecret}`,
      },
      body: JSON.stringify({
        reportId, userId, inputText, method,
        tier: tier || "standard", lifestyleContext,
        questionnaireAnswers: questionnaireAnswers || null,
        callbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/pipeline-callback`,
      }),
    });

    if (!pipelineResponse.ok) {
      const errText = await pipelineResponse.text();
      throw new Error(`Pipeline rejected: ${pipelineResponse.status} ${errText}`);
    }

    return new Response(
      JSON.stringify({ status: "queued", reportId }),
      { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("analyse-dna error:", err);

    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const body = await req.clone().json().catch(() => ({}));
      if (body.reportId) {
        await supabase.from("dna_reports").update({
          pipeline_status: "failed",
          pipeline_error: err.message || "Unknown error",
        }).eq("id", body.reportId);
      }
    } catch {}

    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
