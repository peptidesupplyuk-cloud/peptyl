import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a peptide and supplement research analyst. You will be given a list of peptides and supplements already in a database. Your job is to identify important compounds that are MISSING.

Rules:
- Only suggest well-known, researched compounds — not obscure or experimental ones
- For peptides: focus on those with meaningful clinical evidence or widespread research use
- For supplements: focus on those commonly used in health optimisation, longevity, and sports science
- Do NOT suggest compounds already in the provided lists
- Provide a brief rationale for each suggestion
- Respond ONLY with valid JSON — no preamble, no explanation outside the JSON`;

function buildUserMessage(peptideNames: string[], supplementNames: string[]): string {
  return `Here are the peptides currently in our database:
${peptideNames.join(", ")}

Here are the supplements currently in our database:
${supplementNames.join(", ")}

Identify what's missing. Return a JSON object:
{
  "missing_peptides": [
    {
      "name": "peptide name",
      "full_name": "full scientific name or null",
      "category": "recovery | weight_loss | cognitive | immune | longevity | hormonal | skin | other",
      "rationale": "one sentence why this should be added",
      "priority": "high | medium | low"
    }
  ],
  "missing_supplements": [
    {
      "name": "supplement name",
      "category": "vitamin | mineral | amino_acid | adaptogen | nootropic | antioxidant | probiotic | other",
      "rationale": "one sentence why this should be added",
      "priority": "high | medium | low"
    }
  ]
}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all current names
    const { data: peptides, error: pErr } = await supabase
      .from("peptides_enriched")
      .select("name")
      .eq("is_active", true);

    if (pErr) throw pErr;

    const { data: supplements, error: sErr } = await supabase
      .from("supplements_enriched")
      .select("name")
      .eq("is_active", true);

    if (sErr) throw sErr;

    const peptideNames = (peptides || []).map((p: any) => p.name);
    const supplementNames = (supplements || []).map((s: any) => s.name);

    // Call GPT-4o
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 3000,
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserMessage(peptideNames, supplementNames) },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from GPT-4o");

    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const gaps = JSON.parse(cleaned);

    return new Response(
      JSON.stringify({
        current_peptides: peptideNames.length,
        current_supplements: supplementNames.length,
        ...gaps,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
