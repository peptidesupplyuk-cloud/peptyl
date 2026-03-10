
-- Add missing columns to bloodwork_panels for user bloodwork tracking
ALTER TABLE public.bloodwork_panels
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS test_date DATE,
  ADD COLUMN IF NOT EXISTS panel_type TEXT,
  ADD COLUMN IF NOT EXISTS protocol_id UUID REFERENCES public.protocols(id),
  ADD COLUMN IF NOT EXISTS dna_report_id UUID REFERENCES public.dna_reports(id);

-- RLS policies for user bloodwork panels
CREATE POLICY "Users can read own bloodwork panels"
  ON public.bloodwork_panels FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own bloodwork panels"
  ON public.bloodwork_panels FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bloodwork panels"
  ON public.bloodwork_panels FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

ALTER TABLE public.bloodwork_panels ENABLE ROW LEVEL SECURITY;
