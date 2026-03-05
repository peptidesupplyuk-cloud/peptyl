SELECT cron.schedule(
  'peptyl-dose-reminders',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wmdudifpbrtojkmtczaq.supabase.co/functions/v1/send-reminders',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);