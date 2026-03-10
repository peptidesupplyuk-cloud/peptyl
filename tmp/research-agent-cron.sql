-- ============================================================
-- PEPTYL — pg_cron schedule for research-agent edge function
-- Run in Supabase SQL Editor
-- Requires pg_cron extension (enabled by default on Supabase)
-- ============================================================

-- Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the research agent to run daily at 06:00 UTC
-- This calls your deployed Supabase Edge Function via HTTP
SELECT cron.schedule(
  'peptyl-research-agent-daily',         -- job name
  '0 6 * * *',                           -- cron: every day at 06:00 UTC
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/research-agent',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- ============================================================
-- Alternative: if current_setting doesn't work in your setup,
-- hardcode your project URL and anon key:
-- ============================================================
-- SELECT cron.schedule(
--   'peptyl-research-agent-daily',
--   '0 6 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/research-agent',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer YOUR_ANON_KEY'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );

-- ============================================================
-- Useful management queries
-- ============================================================

-- View all scheduled jobs
-- SELECT * FROM cron.job;

-- View recent job run history
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- Pause the job
-- SELECT cron.unschedule('peptyl-research-agent-daily');

-- Change schedule (e.g. twice daily at 06:00 and 18:00 UTC)
-- SELECT cron.unschedule('peptyl-research-agent-daily');
-- SELECT cron.schedule('peptyl-research-agent-daily', '0 6,18 * * *', $$...$$);
