
-- Update whoop_daily_metrics to match spec
-- Rename sleep_duration → sleep_duration_seconds
ALTER TABLE public.whoop_daily_metrics RENAME COLUMN sleep_duration TO sleep_duration_seconds;

-- Rename rhr → resting_heart_rate
ALTER TABLE public.whoop_daily_metrics RENAME COLUMN rhr TO resting_heart_rate;

-- Add sleep_performance column
ALTER TABLE public.whoop_daily_metrics ADD COLUMN sleep_performance NUMERIC;

-- Add raw_json for full Whoop response storage
ALTER TABLE public.whoop_daily_metrics ADD COLUMN raw_json JSONB;
