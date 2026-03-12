
-- 1. Protocol change log - tracks mid-cycle adjustments
CREATE TABLE public.protocol_change_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  change_type TEXT NOT NULL, -- 'peptide_added', 'peptide_removed', 'supplement_added', 'supplement_removed', 'dose_changed', 'frequency_changed'
  change_detail JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {peptide_name, old_dose, new_dose}
  day_number INTEGER, -- which day of the protocol this change was made
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.protocol_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own change logs"
  ON public.protocol_change_log
  FOR ALL
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Protocol scorecards - auto-generated summaries at milestones
CREATE TABLE public.protocol_scorecards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  milestone TEXT NOT NULL, -- '30_day', '60_day', '90_day', 'completion', 'early_completion'
  day_number INTEGER NOT NULL,
  adherence_percentage NUMERIC,
  streak_best INTEGER,
  biomarker_improvements JSONB DEFAULT '[]'::jsonb, -- [{name, baseline, current, delta_pct, improved}]
  wearable_improvements JSONB DEFAULT '[]'::jsonb, -- [{metric, baseline_avg, protocol_avg, delta_pct}]
  protocol_snapshot JSONB DEFAULT '[]'::jsonb, -- snapshot of peptides + supplements at time of scorecard
  changes_made JSONB DEFAULT '[]'::jsonb, -- list of adjustments made during period
  summary_text TEXT, -- AI-generated or template-based summary
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.protocol_scorecards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own scorecards"
  ON public.protocol_scorecards
  FOR ALL
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Add archived status support - soft delete by changing status to 'archived'
-- No schema change needed, protocols.status already supports any string value
-- We just need to ensure the UI treats 'archived' protocols as preserved history
