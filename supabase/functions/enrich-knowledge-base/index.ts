import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PEPTIDE_SYSTEM_PROMPT = `You are a peptide research analyst specialising in clinical pharmacology, sports medicine, and longevity science. You provide accurate, evidence-based information about research peptides for an educated health optimisation audience.

Rules:
- Always distinguish between animal/in vitro evidence and human clinical evidence
- Be conservative in evidence grading — if in doubt, grade lower
- Accurately reflect UK regulatory status (MHRA perspective)
- Never fabricate research references — only cite studies you are highly confident exist
- For dna_profile_signals, only include direct mechanistic relationships
- Use plain English, not jargon
- Respond ONLY with valid JSON — no preamble, no explanation outside the JSON`;

const SUPPLEMENT_SYSTEM_PROMPT = `You are a supplement science analyst specialising in clinical nutrition, sports science, and longevity medicine. You provide accurate, evidence-based information about dietary supplements for an educated health optimisation audience.

Rules:
- Always distinguish between animal/in vitro evidence and human clinical evidence
- Be conservative in evidence grading — if in doubt, grade lower
- Never fabricate research references — only cite studies you are highly confident exist
- For dna_profile_signals, only include direct mechanistic relationships
- For gene_interactions, only include well-established gene-nutrient interactions
- Use plain English, not jargon
- Respond ONLY with valid JSON — no preamble, no explanation outside the JSON`;

function buildPeptideUserMessage(name: string, description: string | null): string {
  return `Enrich this peptide record with complete clinical data. Peptide name: ${name}${description ? ` Existing description: ${description}` : ""}

Return a JSON object with ALL of these fields:
{
  "mechanism_of_action": "2-4 plain English sentences explaining how this peptide works at a cellular/molecular level",
  "primary_effects": ["3-6 specific, evidence-backed effects"],
  "evidence_grade": "A | B | C | Insufficient",
  "evidence_summary": "2-3 sentences. Explicitly state: how many human trials exist, what they showed, and what the gaps are",
  "key_research_refs": [
    {
      "title": "exact study title",
      "authors": "First author et al",
      "year": 2023,
      "pubmed_id": "PMID if known or null",
      "doi": "doi string or null",
      "one_line_summary": "what this study showed"
    }
  ],
  "dosing_notes": "timing, cycling requirements, method of administration nuances",
  "contraindications": ["list absolute contraindications"],
  "drug_interactions": ["list known drug interactions with mechanism"],
  "synergistic_compounds": ["compounds that enhance effects — peptides or supplements"],
  "antagonistic_compounds": ["compounds that reduce effects or are unsafe to combine"],
  "side_effects_common": ["common, dose-dependent side effects"],
  "side_effects_rare": ["rare or serious adverse effects"],
  "regulatory_status_uk": "research_compound | prescription_only | emerging | licensed",
  "regulatory_note": "Plain English UK regulatory statement — MHRA perspective",
  "regulatory_status_us": "research_compound | prescription_only | emerging | licensed | banned",
  "regulatory_status_eu": "research_compound | prescription_only | emerging | licensed",
  "dna_profile_signals": [
    {
      "signal_type": "gene_variant | biomarker_low | biomarker_high | biomarker_borderline",
      "signal_value": "use exact values from the DNA signal reference list",
      "rationale": "one sentence explaining the mechanistic connection"
    }
  ],
  "longevity_relevance": "one sentence on relevance to longevity/anti-ageing goals or null",
  "fitness_relevance": "one sentence on relevance to athletic performance/recovery or null",
  "health_optimisation_relevance": "one sentence on general health relevance or null"
}`;
}

function buildSupplementUserMessage(name: string, description: string | null): string {
  return `Enrich this supplement record with complete clinical data. Supplement name: ${name}${description ? ` Existing description: ${description}` : ""}

Return a JSON object with ALL of these fields:
{
  "mechanism_of_action": "2-4 plain English sentences explaining how this supplement works",
  "primary_effects": ["3-6 specific, evidence-backed effects"],
  "evidence_grade": "A | B | C | Insufficient",
  "evidence_summary": "2-3 sentences. Explicitly state: how many human trials exist, what they showed, and what the gaps are",
  "key_research_refs": [
    {
      "title": "exact study title",
      "authors": "First author et al",
      "year": 2023,
      "pubmed_id": "PMID if known or null",
      "doi": "doi string or null",
      "one_line_summary": "what this study showed"
    }
  ],
  "forms_available": ["all commercially available forms"],
  "best_form": "most bioavailable form + one sentence reason",
  "bioavailability_notes": "key bioavailability factors — food, timing, cofactors",
  "upper_safe_limit": "established UL with source e.g. NHS, EFSA, NIH",
  "cycling_notes": "cycling protocol if needed, or null if continuous use is fine",
  "food_sources": ["top 5 dietary sources with rough amounts"],
  "contraindications": ["absolute contraindications"],
  "drug_interactions": ["significant drug interactions with mechanism"],
  "synergistic_supplements": ["supplements that enhance effects"],
  "antagonistic_supplements": ["supplements that compete or reduce absorption"],
  "side_effects_common": ["common side effects"],
  "side_effects_rare": ["rare or serious adverse effects"],
  "biomarker_targets": [
    {
      "biomarker": "exact biomarker name",
      "direction": "below | above",
      "threshold": "threshold value with units",
      "notes": "context"
    }
  ],
  "dna_profile_signals": [
    {
      "signal_type": "gene_variant | biomarker_low | biomarker_high | biomarker_borderline",
      "signal_value": "use exact values from the DNA signal reference list",
      "rationale": "one sentence mechanistic connection"
    }
  ],
  "gene_interactions": [
    {
      "gene": "gene name",
      "variant": "specific variant",
      "interaction_type": "required | beneficial | contraindicated | monitor",
      "notes": "plain English explanation"
    }
  ],
  "longevity_relevance": "one sentence or null",
  "fitness_relevance": "one sentence or null",
  "health_optimisation_relevance": "one sentence or null"
}`;
}

async function callGpt4o(systemPrompt: string, userMessage: string, apiKey: string): Promise<any> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 2000,
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
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

  // Strip markdown code fences if present
  const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

    const { type = "both", batch_size = 5 } = await req.json();

    const results = {
      enriched: 0,
      failed: 0,
      remaining: 0,
      errors: [] as string[],
      estimated_cost_usd: 0,
    };

    // Enrich peptides
    if (type === "peptides" || type === "both") {
      const { data: pending, error } = await supabase
        .from("peptides_enriched")
        .select("*")
        .eq("enrichment_status", "pending")
        .limit(batch_size);

      if (error) throw error;

      // Count remaining
      const { count } = await supabase
        .from("peptides_enriched")
        .select("*", { count: "exact", head: true })
        .eq("enrichment_status", "pending");

      results.remaining += (count || 0) - (pending?.length || 0);

      for (const record of pending || []) {
        try {
          const enrichment = await callGpt4o(
            PEPTIDE_SYSTEM_PROMPT,
            buildPeptideUserMessage(record.name, record.description),
            apiKey
          );

          const { error: updateError } = await supabase
            .from("peptides_enriched")
            .update({
              mechanism_of_action: enrichment.mechanism_of_action || null,
              primary_effects: enrichment.primary_effects || null,
              evidence_grade: enrichment.evidence_grade || null,
              evidence_summary: enrichment.evidence_summary || null,
              key_research_refs: enrichment.key_research_refs || null,
              dosing_notes: enrichment.dosing_notes || record.dosing_notes || null,
              contraindications: enrichment.contraindications || null,
              drug_interactions: enrichment.drug_interactions || null,
              synergistic_compounds: enrichment.synergistic_compounds || null,
              antagonistic_compounds: enrichment.antagonistic_compounds || null,
              side_effects_common: enrichment.side_effects_common || null,
              side_effects_rare: enrichment.side_effects_rare || null,
              regulatory_status_uk: enrichment.regulatory_status_uk || record.regulatory_status_uk || null,
              regulatory_status_us: enrichment.regulatory_status_us || record.regulatory_status_us || null,
              regulatory_status_eu: enrichment.regulatory_status_eu || record.regulatory_status_eu || null,
              regulatory_note: enrichment.regulatory_note || null,
              dna_profile_signals: enrichment.dna_profile_signals || null,
              longevity_relevance: enrichment.longevity_relevance || null,
              fitness_relevance: enrichment.fitness_relevance || null,
              health_optimisation_relevance: enrichment.health_optimisation_relevance || null,
              enrichment_status: "enriched",
              enrichment_model: "gpt-4o",
              enriched_at: new Date().toISOString(),
            })
            .eq("id", record.id);

          if (updateError) {
            results.errors.push(`${record.name}: ${updateError.message}`);
            results.failed++;
          } else {
            results.enriched++;
            results.estimated_cost_usd += 0.04; // ~$0.04 per call estimate
          }

          await delay(500);
        } catch (e) {
          results.errors.push(`${record.name}: ${e.message}`);
          results.failed++;
        }
      }
    }

    // Enrich supplements
    if (type === "supplements" || type === "both") {
      const { data: pending, error } = await supabase
        .from("supplements_enriched")
        .select("*")
        .eq("enrichment_status", "pending")
        .limit(batch_size);

      if (error) throw error;

      const { count } = await supabase
        .from("supplements_enriched")
        .select("*", { count: "exact", head: true })
        .eq("enrichment_status", "pending");

      results.remaining += (count || 0) - (pending?.length || 0);

      for (const record of pending || []) {
        try {
          const enrichment = await callGpt4o(
            SUPPLEMENT_SYSTEM_PROMPT,
            buildSupplementUserMessage(record.name, record.description),
            apiKey
          );

          const { error: updateError } = await supabase
            .from("supplements_enriched")
            .update({
              mechanism_of_action: enrichment.mechanism_of_action || null,
              primary_effects: enrichment.primary_effects || null,
              evidence_grade: enrichment.evidence_grade || null,
              evidence_summary: enrichment.evidence_summary || null,
              key_research_refs: enrichment.key_research_refs || null,
              forms_available: enrichment.forms_available || record.forms_available || null,
              best_form: enrichment.best_form || record.best_form || null,
              bioavailability_notes: enrichment.bioavailability_notes || null,
              upper_safe_limit: enrichment.upper_safe_limit || null,
              cycling_notes: enrichment.cycling_notes || record.cycling_notes || null,
              food_sources: enrichment.food_sources || null,
              contraindications: enrichment.contraindications || null,
              drug_interactions: enrichment.drug_interactions || null,
              synergistic_supplements: enrichment.synergistic_supplements || null,
              antagonistic_supplements: enrichment.antagonistic_supplements || null,
              side_effects_common: enrichment.side_effects_common || null,
              side_effects_rare: enrichment.side_effects_rare || null,
              biomarker_targets: enrichment.biomarker_targets || record.biomarker_targets || null,
              dna_profile_signals: enrichment.dna_profile_signals || null,
              gene_interactions: enrichment.gene_interactions || null,
              longevity_relevance: enrichment.longevity_relevance || null,
              fitness_relevance: enrichment.fitness_relevance || null,
              health_optimisation_relevance: enrichment.health_optimisation_relevance || null,
              enrichment_status: "enriched",
              enrichment_model: "gpt-4o",
              enriched_at: new Date().toISOString(),
            })
            .eq("id", record.id);

          if (updateError) {
            results.errors.push(`${record.name}: ${updateError.message}`);
            results.failed++;
          } else {
            results.enriched++;
            results.estimated_cost_usd += 0.04;
          }

          await delay(500);
        } catch (e) {
          results.errors.push(`${record.name}: ${e.message}`);
          results.failed++;
        }
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
