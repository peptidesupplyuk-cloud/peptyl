ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS primary_health_goal text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_medications text DEFAULT NULL;