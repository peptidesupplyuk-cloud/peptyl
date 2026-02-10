
-- Add biometric fields to profiles
ALTER TABLE public.profiles
ADD COLUMN height_cm numeric,
ADD COLUMN weight_kg numeric,
ADD COLUMN bp_systolic integer,
ADD COLUMN bp_diastolic integer;
