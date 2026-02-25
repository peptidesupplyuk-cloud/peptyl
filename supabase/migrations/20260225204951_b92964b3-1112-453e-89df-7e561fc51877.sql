
-- DNA Reports table - stores only processed report JSON, never raw genetic data
CREATE TABLE public.dna_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  report_json JSONB NOT NULL,
  narrative TEXT,
  overall_score INTEGER,
  input_method TEXT NOT NULL,
  confidence TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- DNA Consents table - logs GDPR consent
CREATE TABLE public.dna_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  feature TEXT NOT NULL DEFAULT 'dna_analysis'
);

-- Enable RLS
ALTER TABLE public.dna_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dna_consents ENABLE ROW LEVEL SECURITY;

-- RLS: users can only access their own reports
CREATE POLICY "Users can view their own DNA reports"
  ON public.dna_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DNA reports"
  ON public.dna_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own DNA reports"
  ON public.dna_reports FOR DELETE
  USING (auth.uid() = user_id);

-- RLS: users can only access their own consents
CREATE POLICY "Users can view their own consents"
  ON public.dna_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
  ON public.dna_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);
