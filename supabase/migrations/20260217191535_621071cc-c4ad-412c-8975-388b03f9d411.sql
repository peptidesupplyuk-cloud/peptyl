
-- 1. whoop_connections
CREATE TABLE public.whoop_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  whoop_user_id TEXT,
  refresh_token TEXT,
  access_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.whoop_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own whoop connection"
  ON public.whoop_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_whoop_connections_updated_at
  BEFORE UPDATE ON public.whoop_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. whoop_daily_metrics
CREATE TABLE public.whoop_daily_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  hrv NUMERIC,
  rhr NUMERIC,
  recovery_score NUMERIC,
  strain NUMERIC,
  sleep_score NUMERIC,
  sleep_duration NUMERIC,
  sleep_efficiency NUMERIC,
  respiratory_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.whoop_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own whoop metrics"
  ON public.whoop_daily_metrics FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_whoop_metrics_user_date ON public.whoop_daily_metrics (user_id, date);

-- 3. derived_biomarkers (empty shell for Peptyl score later)
CREATE TABLE public.derived_biomarkers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, metric_name)
);

ALTER TABLE public.derived_biomarkers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own derived biomarkers"
  ON public.derived_biomarkers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_derived_biomarkers_user_date ON public.derived_biomarkers (user_id, date);
