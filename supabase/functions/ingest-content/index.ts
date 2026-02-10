import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EXTRACTION_SYSTEM_PROMPT = `You are a peptide research data extractor for Peptyl, a UK & European peptide community platform.

Given raw content (article text, transcript, blog post), extract structured data about peptides mentioned.

You MUST call the extract_peptide_data function with the extracted data. Be thorough but only include information explicitly stated or strongly implied in the source material.

Credibility assessment guide:
- peer_reviewed: Published in indexed journals with peer review
- clinical_trial: Registered clinical trial results
- expert_review: Written by credentialed researchers/physicians
- established_media: Major health/science publications
- community_verified: Well-sourced community discussions with citations
- anecdotal: Personal reports, Reddit posts, forum discussions`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { content, content_type = "text", source_url, source_name } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Content must be at least 50 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Create queue entry
    const { data: queueItem, error: queueErr } = await supabase
      .from("content_queue")
      .insert({
        submitted_by: user.id,
        content_type,
        raw_input: content.slice(0, 50000), // cap at 50k chars
        source_url: source_url || null,
        processing_status: "processing",
      })
      .select("id")
      .single();

    if (queueErr) throw new Error(`Queue insert failed: ${queueErr.message}`);

    // 2. Find or create source
    let sourceId: string | null = null;
    if (source_name || source_url) {
      const { data: existingSource } = await supabase
        .from("sources")
        .select("id")
        .eq("name", source_name || source_url || "Unknown")
        .maybeSingle();

      if (existingSource) {
        sourceId = existingSource.id;
      } else {
        const { data: newSource } = await supabase
          .from("sources")
          .insert({
            name: source_name || source_url || "Unknown",
            url: source_url || null,
            credibility: "anecdotal",
          })
          .select("id")
          .single();
        sourceId = newSource?.id || null;
      }
    }

    // 3. Call Lovable AI with tool calling for structured extraction
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Extract peptide research data from this content:\n\n---\nSource: ${source_name || source_url || "Unknown"}\nURL: ${source_url || "N/A"}\n---\n\n${content.slice(0, 30000)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_peptide_data",
              description: "Extract structured peptide research data from the content.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "A concise title for this content" },
                  summary: { type: "string", description: "2-3 sentence summary of key findings" },
                  peptides_mentioned: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of peptide names mentioned (e.g. BPC-157, Semaglutide)",
                  },
                  findings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        peptide: { type: "string" },
                        finding: { type: "string" },
                        evidence_strength: { type: "string", enum: ["strong", "moderate", "weak", "anecdotal"] },
                      },
                      required: ["peptide", "finding", "evidence_strength"],
                      additionalProperties: false,
                    },
                    description: "Key findings about peptides",
                  },
                  dosing_details: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        peptide: { type: "string" },
                        dose: { type: "string" },
                        frequency: { type: "string" },
                        route: { type: "string" },
                        duration: { type: "string" },
                      },
                      required: ["peptide", "dose"],
                      additionalProperties: false,
                    },
                    description: "Dosing protocols mentioned",
                  },
                  evidence_quality: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                    description: "Overall evidence quality of this content",
                  },
                  credibility_tier: {
                    type: "string",
                    enum: ["peer_reviewed", "clinical_trial", "expert_review", "established_media", "community_verified", "anecdotal"],
                    description: "Source credibility tier",
                  },
                  interactions_or_warnings: {
                    type: "array",
                    items: { type: "string" },
                    description: "Any drug interactions or safety warnings mentioned",
                  },
                },
                required: ["title", "summary", "peptides_mentioned", "findings", "evidence_quality", "credibility_tier"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_peptide_data" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI extraction failed:", aiResponse.status, errText);

      await supabase
        .from("content_queue")
        .update({ processing_status: "failed", processing_error: `AI error: ${aiResponse.status}` })
        .eq("id", queueItem.id);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI extraction failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      await supabase
        .from("content_queue")
        .update({ processing_status: "failed", processing_error: "No structured data returned" })
        .eq("id", queueItem.id);

      return new Response(JSON.stringify({ error: "AI did not return structured data" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    // 4. Create article in pending_review status
    const { data: article, error: articleErr } = await supabase
      .from("articles")
      .insert({
        source_id: sourceId,
        title: extracted.title || "Untitled",
        url: source_url || null,
        raw_content: content.slice(0, 50000),
        summary: extracted.summary,
        peptides_mentioned: extracted.peptides_mentioned || [],
        findings: extracted.findings || [],
        dosing_details: extracted.dosing_details || [],
        evidence_quality: extracted.evidence_quality,
        credibility_tier: extracted.credibility_tier || "anecdotal",
        status: "pending_review",
      })
      .select("id, title, status")
      .single();

    if (articleErr) throw new Error(`Article insert failed: ${articleErr.message}`);

    // 5. Update queue entry
    await supabase
      .from("content_queue")
      .update({
        processing_status: "completed",
        article_id: article.id,
      })
      .eq("id", queueItem.id);

    return new Response(
      JSON.stringify({
        success: true,
        article,
        extracted: {
          peptides: extracted.peptides_mentioned,
          findings_count: extracted.findings?.length || 0,
          evidence_quality: extracted.evidence_quality,
          credibility_tier: extracted.credibility_tier,
          warnings: extracted.interactions_or_warnings || [],
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("ingest-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
