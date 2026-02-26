import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { peptides as staticPeptides } from "@/data/peptides";

export interface EnrichedPeptide {
  peptyl_id: string;
  name: string;
  full_name: string | null;
  category: string | null;
  description: string | null;
  mechanism_of_action: string | null;
  primary_effects: string[] | null;
  evidence_grade: string | null;
  evidence_summary: string | null;
  dose_range: string | null;
  frequency: string | null;
  cycle_duration: string | null;
  administration: string[] | null;
  dosing_notes: string | null;
  contraindications: string[] | null;
  drug_interactions: string[] | null;
  synergistic_compounds: string[] | null;
  antagonistic_compounds: string[] | null;
  side_effects_common: string[] | null;
  side_effects_rare: string[] | null;
  regulatory_status_us: string | null;
  regulatory_status_uk: string | null;
  regulatory_status_eu: string | null;
  regulatory_note: string | null;
  key_research_refs: any | null;
  dna_profile_signals: any | null;
  longevity_relevance: string | null;
  fitness_relevance: string | null;
  health_optimisation_relevance: string | null;
  enrichment_status: string;
  is_active: boolean;
}

export function useEnrichedPeptides() {
  return useQuery({
    queryKey: ["enriched-peptides"],
    queryFn: async (): Promise<EnrichedPeptide[]> => {
      const { data, error } = await supabase
        .from("peptides_enriched")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error || !data || data.length === 0) {
        // Fallback to static data
        return staticPeptides.map((p) => ({
          peptyl_id: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: p.name,
          full_name: p.fullName,
          category: p.category,
          description: p.description,
          mechanism_of_action: null,
          primary_effects: p.benefits,
          evidence_grade: null,
          evidence_summary: null,
          dose_range: p.doseRange || null,
          frequency: p.frequency,
          cycle_duration: p.cycleDuration || null,
          administration: [p.administration],
          dosing_notes: p.notes || null,
          contraindications: null,
          drug_interactions: null,
          synergistic_compounds: null,
          antagonistic_compounds: null,
          side_effects_common: null,
          side_effects_rare: null,
          regulatory_status_us: p.regulatoryStatus?.us ? JSON.stringify(p.regulatoryStatus.us) : null,
          regulatory_status_uk: p.regulatoryStatus?.uk ? JSON.stringify(p.regulatoryStatus.uk) : null,
          regulatory_status_eu: p.regulatoryStatus?.eu ? JSON.stringify(p.regulatoryStatus.eu) : null,
          regulatory_note: null,
          key_research_refs: null,
          dna_profile_signals: null,
          longevity_relevance: null,
          fitness_relevance: null,
          health_optimisation_relevance: null,
          enrichment_status: "pending",
          is_active: true,
        }));
      }

      return data as EnrichedPeptide[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
