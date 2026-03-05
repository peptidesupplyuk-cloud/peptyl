ALTER TABLE public.dna_reports
ADD COLUMN IF NOT EXISTS assessment_tier text DEFAULT 'standard';

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dna_standard_unlocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS dna_advanced_unlocked boolean DEFAULT false;

ALTER TABLE public.dna_reports
ADD COLUMN IF NOT EXISTS lifestyle_context jsonb DEFAULT NULL;