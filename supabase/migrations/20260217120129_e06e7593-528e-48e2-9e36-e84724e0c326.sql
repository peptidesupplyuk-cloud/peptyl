
-- Add onboarding questionnaire fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS current_compounds text,
  ADD COLUMN IF NOT EXISTS biomarker_availability text,
  ADD COLUMN IF NOT EXISTS risk_tolerance text;

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.experience_level IS 'Onboarding: none, beginner, intermediate, advanced';
COMMENT ON COLUMN public.profiles.current_compounds IS 'Onboarding: free-text current compounds';
COMMENT ON COLUMN public.profiles.biomarker_availability IS 'Onboarding: none, basic, hormones, comprehensive';
COMMENT ON COLUMN public.profiles.risk_tolerance IS 'Onboarding: conservative, moderate, aggressive';
