
-- Add supplements and notes columns to protocols
ALTER TABLE public.protocols
  ADD COLUMN supplements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN notes TEXT;
