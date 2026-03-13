
CREATE TABLE public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  is_pwa boolean NOT NULL DEFAULT false,
  display_mode text DEFAULT 'browser',
  device_type text DEFAULT 'desktop',
  page_path text,
  referrer text,
  screen_width integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_activity_user_id ON public.user_activity (user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity (created_at);
CREATE INDEX idx_user_activity_session ON public.user_activity (session_id);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own activity"
  ON public.user_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can read all activity"
  ON public.user_activity FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anon can insert activity"
  ON public.user_activity FOR INSERT
  TO anon
  WITH CHECK (true);
