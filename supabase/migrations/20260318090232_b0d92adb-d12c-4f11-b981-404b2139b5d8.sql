-- Fix protocol-scoped uniqueness so the same compound can exist in multiple active protocols
-- without collapsing logs across protocols.

-- Injection logs: preserve legacy/manual rows with null protocol_peptide_id,
-- but make protocol-linked rows unique per protocol peptide + scheduled time.
DROP INDEX IF EXISTS public.idx_injection_logs_unique_schedule;

CREATE UNIQUE INDEX IF NOT EXISTS idx_injection_logs_protocol_schedule_unique
ON public.injection_logs (user_id, protocol_peptide_id, scheduled_time)
WHERE protocol_peptide_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_injection_logs_legacy_schedule_unique
ON public.injection_logs (user_id, peptide_name, scheduled_time)
WHERE protocol_peptide_id IS NULL;

-- Supplement logs: allow the same supplement name to be tracked separately
-- across different protocols on the same date.
ALTER TABLE public.supplement_logs
DROP CONSTRAINT IF EXISTS supplement_logs_user_id_date_item_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_supplement_logs_protocol_item_unique
ON public.supplement_logs (user_id, date, protocol_id, item)
WHERE protocol_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_supplement_logs_legacy_item_unique
ON public.supplement_logs (user_id, date, item)
WHERE protocol_id IS NULL;