-- Prevent duplicate injection logs: one entry per user + peptide + scheduled time
CREATE UNIQUE INDEX IF NOT EXISTS idx_injection_logs_unique_schedule 
ON public.injection_logs (user_id, peptide_name, scheduled_time);