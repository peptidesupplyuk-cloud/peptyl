
-- TABLE 1: peptides_enriched
CREATE TABLE public.peptides_enriched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  peptyl_id text UNIQUE NOT NULL,
  name text NOT NULL,
  full_name text,
  aliases text[],
  category text,
  description text,
  mechanism_of_action text,
  primary_effects text[],
  evidence_grade text,
  evidence_summary text,
  key_research_refs jsonb,
  dose_range text,
  frequency text,
  cycle_duration text,
  administration text[],
  dosing_notes text,
  contraindications text[],
  drug_interactions text[],
  synergistic_compounds text[],
  antagonistic_compounds text[],
  side_effects_common text[],
  side_effects_rare text[],
  regulatory_status_uk text,
  regulatory_status_us text,
  regulatory_status_eu text,
  regulatory_note text,
  dna_profile_signals jsonb,
  longevity_relevance text,
  fitness_relevance text,
  health_optimisation_relevance text,
  enrichment_status text NOT NULL DEFAULT 'pending',
  enrichment_model text,
  enriched_at timestamptz,
  is_active boolean NOT NULL DEFAULT true
);

-- TABLE 2: supplements_enriched
CREATE TABLE public.supplements_enriched (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  peptyl_id text UNIQUE NOT NULL,
  name text NOT NULL,
  aliases text[],
  category text,
  description text,
  mechanism_of_action text,
  primary_effects text[],
  evidence_grade text,
  evidence_summary text,
  key_research_refs jsonb,
  forms_available text[],
  best_form text,
  bioavailability_notes text,
  dose_range text,
  upper_safe_limit text,
  timing text,
  cycling_notes text,
  food_sources text[],
  contraindications text[],
  drug_interactions text[],
  synergistic_supplements text[],
  antagonistic_supplements text[],
  side_effects_common text[],
  side_effects_rare text[],
  biomarker_targets jsonb,
  dna_profile_signals jsonb,
  gene_interactions jsonb,
  longevity_relevance text,
  fitness_relevance text,
  health_optimisation_relevance text,
  enrichment_status text NOT NULL DEFAULT 'pending',
  enrichment_model text,
  enriched_at timestamptz,
  is_active boolean NOT NULL DEFAULT true
);

-- Indexes for peptides_enriched
CREATE INDEX idx_peptides_enriched_peptyl_id ON public.peptides_enriched (peptyl_id);
CREATE INDEX idx_peptides_enriched_category ON public.peptides_enriched (category);
CREATE INDEX idx_peptides_enriched_status ON public.peptides_enriched (enrichment_status);
CREATE INDEX idx_peptides_enriched_active ON public.peptides_enriched (is_active);

-- Indexes for supplements_enriched
CREATE INDEX idx_supplements_enriched_peptyl_id ON public.supplements_enriched (peptyl_id);
CREATE INDEX idx_supplements_enriched_category ON public.supplements_enriched (category);
CREATE INDEX idx_supplements_enriched_status ON public.supplements_enriched (enrichment_status);
CREATE INDEX idx_supplements_enriched_active ON public.supplements_enriched (is_active);

-- RLS: Public read, service role write
ALTER TABLE public.peptides_enriched ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements_enriched ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read peptides_enriched" ON public.peptides_enriched
  FOR SELECT USING (true);

CREATE POLICY "Service role insert peptides_enriched" ON public.peptides_enriched
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role update peptides_enriched" ON public.peptides_enriched
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role delete peptides_enriched" ON public.peptides_enriched
  FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "Public read supplements_enriched" ON public.supplements_enriched
  FOR SELECT USING (true);

CREATE POLICY "Service role insert supplements_enriched" ON public.supplements_enriched
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role update supplements_enriched" ON public.supplements_enriched
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role delete supplements_enriched" ON public.supplements_enriched
  FOR DELETE USING (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER peptides_enriched_updated_at
  BEFORE UPDATE ON public.peptides_enriched
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER supplements_enriched_updated_at
  BEFORE UPDATE ON public.supplements_enriched
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
