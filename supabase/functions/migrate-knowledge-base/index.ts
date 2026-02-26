import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { peptides, supplements } = await req.json();

    const results = {
      peptides: { migrated: 0, skipped: 0, errors: [] as string[] },
      supplements: { migrated: 0, skipped: 0, errors: [] as string[] },
    };

    // Migrate peptides
    if (peptides && Array.isArray(peptides)) {
      for (const p of peptides) {
        try {
          const peptylId = slugify(p.name);
          const row = {
            peptyl_id: peptylId,
            name: p.name,
            full_name: p.fullName || null,
            category: p.category || null,
            description: p.description || null,
            dose_range: p.doseRange || null,
            frequency: p.frequency || null,
            cycle_duration: p.cycleDuration || null,
            administration: p.administration
              ? Array.isArray(p.administration) ? p.administration : [p.administration]
              : null,
            dosing_notes: p.notes || null,
            primary_effects: p.benefits || null,
            regulatory_status_us: p.regulatoryStatus?.us
              ? JSON.stringify(p.regulatoryStatus.us)
              : null,
            regulatory_status_uk: p.regulatoryStatus?.uk
              ? JSON.stringify(p.regulatoryStatus.uk)
              : null,
            regulatory_status_eu: p.regulatoryStatus?.eu
              ? JSON.stringify(p.regulatoryStatus.eu)
              : null,
            enrichment_status: "pending",
            is_active: true,
          };

          const { error } = await supabase
            .from("peptides_enriched")
            .upsert(row, { onConflict: "peptyl_id" });

          if (error) {
            results.peptides.errors.push(`${p.name}: ${error.message}`);
          } else {
            results.peptides.migrated++;
          }
        } catch (e) {
          results.peptides.errors.push(`${p.name}: ${e.message}`);
        }
      }
    }

    // Migrate supplements
    if (supplements && Array.isArray(supplements)) {
      for (const s of supplements) {
        try {
          const peptylId = slugify(s.name);
          const row = {
            peptyl_id: peptylId,
            name: s.name,
            aliases: null,
            category: s.category || null,
            description: s.description || null,
            dose_range: s.doseRange || null,
            timing: s.timing || null,
            forms_available: s.form ? [s.form] : null,
            best_form: s.form || null,
            primary_effects: s.benefits || null,
            evidence_grade: s.evidenceGrade || null,
            evidence_summary: null,
            contraindications: s.contraindications || null,
            synergistic_supplements: s.synergies || null,
            biomarker_targets: s.biomarkerTargets
              ? s.biomarkerTargets.map((b: string) => ({ name: b }))
              : null,
            key_research_refs: s.keyStudies
              ? s.keyStudies.map((st: string) => ({ one_line_summary: st }))
              : null,
            cycling_notes: s.notes || null,
            enrichment_status: "pending",
            is_active: true,
          };

          const { error } = await supabase
            .from("supplements_enriched")
            .upsert(row, { onConflict: "peptyl_id" });

          if (error) {
            results.supplements.errors.push(`${s.name}: ${error.message}`);
          } else {
            results.supplements.migrated++;
          }
        } catch (e) {
          results.supplements.errors.push(`${s.name}: ${e.message}`);
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
