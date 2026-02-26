import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { supplements as staticSupplements } from "@/data/supplements";

export interface EnrichedSupplement {
  peptyl_id: string;
  name: string;
  aliases: string[] | null;
  category: string | null;
  description: string | null;
  mechanism_of_action: string | null;
  primary_effects: string[] | null;
  evidence_grade: string | null;
  evidence_summary: string | null;
  forms_available: string[] | null;
  best_form: string | null;
  bioavailability_notes: string | null;
  dose_range: string | null;
  upper_safe_limit: string | null;
  timing: string | null;
  cycling_notes: string | null;
  food_sources: string[] | null;
  contraindications: string[] | null;
  drug_interactions: string[] | null;
  synergistic_supplements: string[] | null;
  antagonistic_supplements: string[] | null;
  side_effects_common: string[] | null;
  side_effects_rare: string[] | null;
  biomarker_targets: any | null;
  key_research_refs: any | null;
  dna_profile_signals: any | null;
  gene_interactions: any | null;
  longevity_relevance: string | null;
  fitness_relevance: string | null;
  health_optimisation_relevance: string | null;
  enrichment_status: string;
  is_active: boolean;
}

export function useEnrichedSupplements() {
  return useQuery({
    queryKey: ["enriched-supplements"],
    queryFn: async (): Promise<EnrichedSupplement[]> => {
      const { data, error } = await supabase
        .from("supplements_enriched")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error || !data || data.length === 0) {
        // Fallback to static data
        return staticSupplements.map((s) => ({
          peptyl_id: s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: s.name,
          aliases: null,
          category: s.category,
          description: s.description,
          mechanism_of_action: null,
          primary_effects: s.benefits,
          evidence_grade: s.evidenceGrade,
          evidence_summary: null,
          forms_available: [s.form],
          best_form: s.form,
          bioavailability_notes: null,
          dose_range: s.doseRange,
          upper_safe_limit: null,
          timing: s.timing,
          cycling_notes: s.notes || null,
          food_sources: null,
          contraindications: s.contraindications || null,
          drug_interactions: null,
          synergistic_supplements: s.synergies || null,
          antagonistic_supplements: null,
          side_effects_common: null,
          side_effects_rare: null,
          biomarker_targets: s.biomarkerTargets ? s.biomarkerTargets.map((b: string) => ({ name: b })) : null,
          key_research_refs: s.keyStudies ? s.keyStudies.map((st: string) => ({ one_line_summary: st })) : null,
          dna_profile_signals: null,
          gene_interactions: null,
          longevity_relevance: null,
          fitness_relevance: null,
          health_optimisation_relevance: null,
          enrichment_status: "pending",
          is_active: true,
        }));
      }

      return data as EnrichedSupplement[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
