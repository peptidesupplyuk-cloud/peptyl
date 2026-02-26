import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are BioBot, Peptyl's AI peptide research assistant. You are knowledgeable, evidence-based, and concise.

## RESPONSE STYLE — CRITICAL
- **MAX 3-5 bullet points**. No walls of text.
- Lead with a 1-line answer, then key details.
- Cite sources from KNOWLEDGE CONTEXT when available.
- End every response with: "📖 **Learn more:** [relevant link]"
- Link to site pages: [Peptides](/peptides), [Calculators](/calculators), [Education](/education), [Beginner's Guide](/education/beginners-guide), [Reconstitution](/education/how-to-reconstitute), [Storage](/education/storage-guide), [BPC vs TB-500](/education/bpc157-vs-tb500), [GLP-1 Guide](/education/glp1-guide)

## RULES
- Peptides are for **research purposes only** — not medical advice.
- Dosing = community-reported ranges, not prescriptions.
- If unsure, say so honestly.

## KEY CAUTION INTERACTIONS
- NEVER combine GLP-1 agonists (except CagriSema)
- Don't stack multiple GHRPs — receptor desensitization risk
- Melanotan II + PT-141 — amplified side effects
- IGF-1 LR3 + GLP-1 — hypoglycemia risk

For site help questions (navigation, signup, account) → tell users to switch to the "Site Help" tab.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth: require a valid user session ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await anonClient.auth.getClaims(token);
    if (authError || !data?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Input validation ---
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many messages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (msg.content.length > 10000) {
        return new Response(
          JSON.stringify({ error: "Message too long" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // --- RAG: Retrieve relevant context ---
    let ragContext = "";
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");

    if (lastUserMsg?.content) {
      try {
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
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data: matches } = await supabase.rpc("match_embeddings", {
              query_embedding: JSON.stringify(queryEmbedding),
              match_threshold: 0.65,
              match_count: 5,
            });

            if (matches && matches.length > 0) {
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
