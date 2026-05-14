-- Remove existing duplicate rows (keep earliest)
DELETE FROM public.nudge_log a
USING public.nudge_log b
WHERE a.user_id = b.user_id
  AND a.nudge_type = b.nudge_type
  AND a.sent_at > b.sent_at;

-- Then enforce uniqueness going forward
CREATE UNIQUE INDEX IF NOT EXISTS nudge_log_user_type_unique
  ON public.nudge_log (user_id, nudge_type);