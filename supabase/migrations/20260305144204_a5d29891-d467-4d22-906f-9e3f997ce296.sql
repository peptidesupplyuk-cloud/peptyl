
ALTER TABLE public.dna_reports 
ADD COLUMN IF NOT EXISTS plan_start_date date DEFAULT NULL;

CREATE POLICY "Users can update own DNA reports"
ON public.dna_reports FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
