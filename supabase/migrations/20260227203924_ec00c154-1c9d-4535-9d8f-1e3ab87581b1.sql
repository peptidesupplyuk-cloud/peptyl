
-- Fitbit connections table (mirrors whoop_connections)
CREATE TABLE public.fitbit_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  fitbit_user_id text,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fitbit_connections ENABLE ROW LEVEL SECURITY;

-- Users can read their own connection
CREATE POLICY "Users can read own fitbit connection"
  ON public.fitbit_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own connection
CREATE POLICY "Users can delete own fitbit connection"
  ON public.fitbit_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service role manages fitbit connections"
  ON public.fitbit_connections FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Safe view (no tokens exposed)
CREATE VIEW public.fitbit_connections_safe AS
  SELECT id, user_id, fitbit_user_id, last_sync_at, created_at, updated_at
  FROM public.fitbit_connections;

-- Fitbit daily metrics
CREATE TABLE public.fitbit_daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  resting_heart_rate numeric,
  hrv numeric,
  sleep_score numeric,
  sleep_duration_minutes numeric,
  steps integer,
  active_zone_minutes integer,
  calories_burned integer,
  stress_score numeric,
  raw_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.fitbit_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own fitbit metrics"
  ON public.fitbit_daily_metrics FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
