
-- Add country and research_goal columns to profiles
ALTER TABLE public.profiles ADD COLUMN country text;
ALTER TABLE public.profiles ADD COLUMN research_goal text;
