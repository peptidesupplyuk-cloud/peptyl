import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Split text into overlapping chunks of ~500 tokens */
function chunkText(text: string, maxChars = 2000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    chunks.push(text.slice(start, end));
    if (end >= text.length) break;
    start = end - overlap;
  }
  return chunks;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { article_id } = await req.json();

    if (!article_id) {
      return new Response(JSON.stringify({ error: "article_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch article
    const { data: article, error: articleErr } = await supabase
      .from("articles")
      .select("id, title, summary, raw_content, peptides_mentioned, findings")
      .eq("id", article_id)
      .single();

    if (articleErr || !article) {
      return new Response(JSON.stringify({ error: "Article not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build searchable text from all fields
    const findingsText = Array.isArray(article.findings)
      ? (article.findings as any[]).map((f: any) => `${f.peptide}: ${f.finding} (${f.evidence_strength})`).join("\n")
      : "";

    const fullText = [
      `Title: ${article.title}`,
      article.summary ? `Summary: ${article.summary}` : "",
      `Peptides: ${(article.peptides_mentioned || []).join(", ")}`,
      findingsText ? `Findings:\n${findingsText}` : "",
      article.raw_content || "",
    ].filter(Boolean).join("\n\n");

    // Chunk the text
    const chunks = chunkText(fullText);
    console.log(`Chunking article ${article_id}: ${chunks.length} chunks from ${fullText.length} chars`);

    // Delete old embeddings for this article
    await supabase.from("content_embeddings").delete().eq("article_id", article_id);

    // Generate embeddings for each chunk via Lovable AI
    let stored = 0;
    for (let i = 0; i < chunks.length; i++) {
      const embResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: chunks[i],
        }),
      });

      if (!embResponse.ok) {
        const errText = await embResponse.text();
        console.error(`Embedding failed for chunk ${i}:`, embResponse.status, errText);
        continue;
      }

      const embData = await embResponse.json();
      const embedding = embData.data?.[0]?.embedding;

      if (!embedding) {
        console.error(`No embedding returned for chunk ${i}`);
        continue;
      }

      // Store in content_embeddings
      const { error: insertErr } = await supabase.from("content_embeddings").insert({
        article_id,
        chunk_index: i,
        chunk_text: chunks[i],
        embedding: JSON.stringify(embedding),
        metadata: {
          title: article.title,
          peptides: article.peptides_mentioned,
          chunk_of: chunks.length,
        },
      });

      if (insertErr) {
        console.error(`Insert failed for chunk ${i}:`, insertErr.message);
      } else {
        stored++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, chunks_total: chunks.length, chunks_stored: stored }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("chunk-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
