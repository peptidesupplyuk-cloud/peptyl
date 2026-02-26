import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a medical accuracy auditor reviewing a health knowledge base.
Identify factual errors, contradictions, outdated information, and missing critical safety data.
Be specific and cite what is wrong and what the correct information should be.
Respond ONLY with valid JSON — no preamble, no explanation outside the JSON.`;

function buildAuditPrompt(records: any[]): string {
  const summaries = records.map((r) => ({
    peptyl_id: r.peptyl_id,
    name: r.name,
    type: r.compound_type,
    mechanism_of_action: r.mechanism_of_action,
    evidence_grade: r.evidence_grade,
    evidence_summary: r.evidence_summary,
    contraindications: r.contraindications,
    drug_interactions: r.drug_interactions,
    synergistic_compounds: r.synergistic_compounds || r.synergistic_supplements,
    antagonistic_compounds: r.antagonistic_compounds || r.antagonistic_supplements,
    side_effects_common: r.side_effects_common,
    side_effects_rare: r.side_effects_rare,
    regulatory_status_uk: r.regulatory_status_uk,
    regulatory_status_us: r.regulatory_status_us,
    longevity_relevance: r.longevity_relevance,
  }));

  return `Audit these ${records.length} records for accuracy. For each issue found return:
{
  "audit_results": [
    {
      "peptyl_id": "id of the record",
      "name": "compound name",
      "issue_type": "factual_error | contradiction | outdated | missing_safety | regulatory_error | overstated_evidence",
      "field_affected": "which field has the issue",
      "current_value": "what it currently says (brief)",
      "issue_description": "what is wrong and why",
      "recommended_fix": "what it should say",
      "severity": "critical | high | medium | low"
    }
  ]
}

If no issues are found for a record, omit it. Only flag genuine problems.

Records to audit:
${JSON.stringify(summaries, null, 2)}`;
}

async function callGpt4o(systemPrompt: string, userMessage: string, apiKey: string): Promise<any> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 4000,
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

    const auditRunId = crypto.randomUUID();

    // Fetch all enriched peptides
    const { data: peptides, error: pErr } = await supabase
      .from("peptides_enriched")
      .select("*")
      .eq("enrichment_status", "enriched")
      .eq("is_active", true);
    if (pErr) throw pErr;

    // Fetch all enriched supplements
    const { data: supplements, error: sErr } = await supabase
      .from("supplements_enriched")
      .select("*")
      .eq("enrichment_status", "enriched")
      .eq("is_active", true);
    if (sErr) throw sErr;

    // Tag records with compound_type
    const allRecords = [
      ...(peptides || []).map((r) => ({ ...r, compound_type: "peptide" })),
      ...(supplements || []).map((r) => ({ ...r, compound_type: "supplement" })),
    ];

    const summary = {
      total_records_audited: allRecords.length,
      issues_found: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      article_contradictions: 0,
      estimated_cost_usd: 0,
    };

    // Process in batches of 10
    const batchSize = 10;
    for (let i = 0; i < allRecords.length; i += batchSize) {
      const batch = allRecords.slice(i, i + batchSize);

      try {
        const result = await callGpt4o(SYSTEM_PROMPT, buildAuditPrompt(batch), apiKey);
        summary.estimated_cost_usd += 0.06;

        const issues = result.audit_results || [];
        for (const issue of issues) {
          const { error: insertErr } = await supabase.from("audit_results").insert({
            peptyl_id: issue.peptyl_id || null,
            compound_name: issue.name,
            compound_type: batch.find((b) => b.name === issue.name)?.compound_type || "peptide",
            issue_type: issue.issue_type,
            field_affected: issue.field_affected,
            current_value: issue.current_value,
            issue_description: issue.issue_description,
            recommended_fix: issue.recommended_fix,
            severity: issue.severity,
            audit_run_id: auditRunId,
          });

          if (!insertErr) {
            summary.issues_found++;
            if (issue.severity === "critical") summary.critical++;
            else if (issue.severity === "high") summary.high++;
            else if (issue.severity === "medium") summary.medium++;
            else summary.low++;
          }
        }
      } catch (e) {
        console.error(`Audit batch error (records ${i}-${i + batch.length}):`, e.message);
      }

      await delay(500);
    }

    // Check article contradictions
    try {
      const { data: articles } = await supabase
        .from("articles")
        .select("id, title, summary, peptides_mentioned")
        .eq("status", "published")
        .limit(50);

      if (articles && articles.length > 0) {
        const articleSummaries = articles.map((a) => ({
          title: a.title,
          summary: a.summary,
          peptides_mentioned: a.peptides_mentioned,
        }));

        const compoundNames = allRecords.map((r) => r.name);

        const contradictionPrompt = `Compare these published articles against the knowledge base compounds (${compoundNames.join(", ")}).
Flag any claims in articles that contradict the database records. Return:
{
  "audit_results": [
    {
      "peptyl_id": "article",
      "name": "article title",
      "issue_type": "contradiction",
      "field_affected": "article_content",
      "current_value": "what the article claims",
      "issue_description": "how it contradicts the database",
      "recommended_fix": "which is correct and what to update",
      "severity": "medium"
    }
  ]
}
If no contradictions found, return {"audit_results": []}.

Articles:
${JSON.stringify(articleSummaries, null, 2)}`;

        const contradictions = await callGpt4o(SYSTEM_PROMPT, contradictionPrompt, apiKey);
        summary.estimated_cost_usd += 0.04;

        for (const issue of contradictions.audit_results || []) {
          await supabase.from("audit_results").insert({
            peptyl_id: "article",
            compound_name: issue.name,
            compound_type: "article",
            issue_type: issue.issue_type,
            field_affected: issue.field_affected,
            current_value: issue.current_value,
            issue_description: issue.issue_description,
            recommended_fix: issue.recommended_fix,
            severity: issue.severity,
            audit_run_id: auditRunId,
          });
          summary.article_contradictions++;
          summary.issues_found++;
          summary.medium++;
        }
      }
    } catch (e) {
      console.error("Article contradiction check error:", e.message);
    }

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
