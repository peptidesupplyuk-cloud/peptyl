
ALTER TABLE public.bloodwork_panels
  ADD COLUMN IF NOT EXISTS protocol_id UUID REFERENCES public.protocols(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS dna_report_id UUID REFERENCES public.dna_reports(id) ON DELETE SET NULL;

ALTER TABLE public.supplement_logs
  ADD COLUMN IF NOT EXISTS dose_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS dose_unit TEXT,
  ADD COLUMN IF NOT EXISTS supplement_form TEXT,
  ADD COLUMN IF NOT EXISTS protocol_id UUID REFERENCES public.protocols(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

ALTER TABLE public.bloodwork_markers
  ADD COLUMN IF NOT EXISTS optimal_low NUMERIC,
  ADD COLUMN IF NOT EXISTS optimal_high NUMERIC,
  ADD COLUMN IF NOT EXISTS ref_low NUMERIC,
  ADD COLUMN IF NOT EXISTS ref_high NUMERIC,
  ADD COLUMN IF NOT EXISTS marker_status TEXT;

CREATE TABLE IF NOT EXISTS public.outcome_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL,
  dna_report_id UUID REFERENCES public.dna_reports(id) ON DELETE SET NULL,
  genotype_signals JSONB DEFAULT '{}'::jsonb,
  protocol_id UUID REFERENCES public.protocols(id) ON DELETE SET NULL,
  protocol_snapshot JSONB DEFAULT '[]'::jsonb,
  protocol_start_date DATE,
  weeks_on_protocol INTEGER,
  adherence_percentage NUMERIC,
  baseline_panel_id UUID REFERENCES public.bloodwork_panels(id) ON DELETE SET NULL,
  baseline_date DATE,
  baseline_markers JSONB DEFAULT '{}'::jsonb,
  retest_panel_id UUID REFERENCES public.bloodwork_panels(id) ON DELETE SET NULL,
  retest_date DATE,
  retest_markers JSONB DEFAULT '{}'::jsonb,
  avg_hrv_baseline NUMERIC,
  avg_hrv_protocol NUMERIC,
  avg_recovery_baseline NUMERIC,
  avg_recovery_protocol NUMERIC,
  avg_sleep_score_baseline NUMERIC,
  avg_sleep_score_protocol NUMERIC,
  outcome_markers JSONB DEFAULT '{}'::jsonb,
  overall_responder_status TEXT DEFAULT 'pending',
  consented_to_aggregate BOOLEAN DEFAULT false,
  aggregation_genotype_key TEXT,
  status TEXT DEFAULT 'baseline_only'
);

ALTER TABLE public.outcome_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own outcome records" ON public.outcome_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_outcome_genotype ON public.outcome_records (aggregation_genotype_key);
CREATE INDEX IF NOT EXISTS idx_outcome_status ON public.outcome_records (status, consented_to_aggregate);
CREATE INDEX IF NOT EXISTS idx_outcome_user ON public.outcome_records (user_id);

CREATE TRIGGER update_outcome_records_updated_at BEFORE UPDATE ON public.outcome_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE VIEW public.outcome_aggregates AS
SELECT
  aggregation_genotype_key,
  COUNT(*) as sample_size,
  ROUND(AVG(CASE WHEN (outcome_markers->'homocysteine'->>'pct_change') IS NOT NULL THEN (outcome_markers->'homocysteine'->>'pct_change')::numeric END), 1) as avg_homocysteine_change,
  ROUND(AVG(CASE WHEN (outcome_markers->'vitamin_d'->>'pct_change') IS NOT NULL THEN (outcome_markers->'vitamin_d'->>'pct_change')::numeric END), 1) as avg_vitd_change,
  ROUND(AVG(adherence_percentage), 0) as avg_adherence,
  ROUND(AVG(weeks_on_protocol), 1) as avg_weeks,
  COUNT(*) FILTER (WHERE overall_responder_status IN ('strong_responder', 'responder')) as responder_count
FROM public.outcome_records
WHERE status = 'completed' AND consented_to_aggregate = true
GROUP BY aggregation_genotype_key
HAVING COUNT(*) >= 5;
