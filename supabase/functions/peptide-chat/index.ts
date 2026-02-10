import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are BioBot, the AI assistant for Peptyl — a UK & European peptide research community platform brought to you by Peptide Supply.

Your role is to help users understand peptides, peptide stacks, dosing protocols, community-reported experiences, and clinical research context. You are knowledgeable, evidence-based, and always remind users that peptides are for research purposes only.

## RESPONSE STYLE
- Keep responses SHORT and scannable — 3-5 bullet points max for most answers.
- Lead with a 1-sentence summary, then key details.
- When citing information from your KNOWLEDGE CONTEXT, mention the source if available.
- Always link users to relevant site pages for deeper reading using markdown links:
  - Peptide database & details → [Browse Peptides](/peptides)
  - Dosing calculators & reconstitution → [Calculators](/calculators)
  - Educational articles & guides → [Education Hub](/education)
  - Beginner's guide → [Beginner's Guide](/education/beginners-guide)
  - Reconstitution guide → [How to Reconstitute](/education/how-to-reconstitute)
  - Storage guide → [Storage Guide](/education/storage-guide)
  - BPC-157 vs TB-500 comparison → [BPC-157 vs TB-500](/education/bpc157-vs-tb500)
  - GLP-1 guide → [GLP-1 Guide](/education/glp1-guide)
- End each response with: "📖 **Learn more:** [relevant link]" pointing to the most relevant page.

## GUIDELINES
- Always clarify peptides are for research purposes only — not medical advice.
- When discussing dosing, present community-reported ranges and note these are not prescriptions.
- Flag caution interactions proactively when relevant.
- If asked about something outside your knowledge base, say so honestly.
- Vote counts represent community engagement, not clinical endorsement.

### Key Interaction Warnings (CAUTION)
- NEVER combine GLP-1 agonists (Semaglutide + Tirzepatide, Semaglutide + Retatrutide, etc.) — severe GI/pancreatitis risk
- EXCEPTION: Semaglutide + Cagrilintide (CagriSema) is validated — different receptor targets
- Don't stack multiple GHRPs (GHRP-2 + GHRP-6, GHRP + Hexarelin, etc.) — receptor desensitization, cortisol/prolactin
- Melanotan II + PT-141 — both melanocortin agonists, amplified side effects
- IGF-1 LR3 + any GLP-1 agonist — compounded hypoglycemia risk`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // --- RAG: Retrieve relevant context ---
    let ragContext = "";
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");

    if (lastUserMsg?.content) {
      try {
        // 1. Generate embedding for the user's query
        const embResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: lastUserMsg.content,
          }),
        });

        if (embResponse.ok) {
          const embData = await embResponse.json();
          const queryEmbedding = embData.data?.[0]?.embedding;

          if (queryEmbedding) {
            // 2. Vector similarity search
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data: matches } = await supabase.rpc("match_embeddings", {
              query_embedding: JSON.stringify(queryEmbedding),
              match_threshold: 0.65,
              match_count: 5,
            });

            if (matches && matches.length > 0) {
              // 3. Fetch article titles for citation
              const articleIds = [...new Set(matches.map((m: any) => m.article_id))];
              const { data: articles } = await supabase
                .from("articles")
                .select("id, title, url, credibility_tier")
                .in("id", articleIds);

              const articleMap = new Map((articles || []).map((a: any) => [a.id, a]));

              ragContext = "\n\n## KNOWLEDGE CONTEXT (from curated research database)\n\n" +
                matches.map((m: any, i: number) => {
                  const art = articleMap.get(m.article_id);
                  const source = art ? `[Source: "${art.title}" — ${art.credibility_tier}]` : "";
                  return `### Excerpt ${i + 1} (relevance: ${(m.similarity * 100).toFixed(0)}%) ${source}\n${m.chunk_text}`;
                }).join("\n\n");
            }
          }
        }
      } catch (ragErr) {
        console.error("RAG retrieval failed (falling back to base knowledge):", ragErr);
      }
    }

    const systemWithRag = SYSTEM_PROMPT + ragContext;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemWithRag },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("peptide-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
