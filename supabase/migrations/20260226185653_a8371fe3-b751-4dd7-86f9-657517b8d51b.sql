
CREATE TABLE IF NOT EXISTS public.nudge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  protocol_id UUID REFERENCES public.protocols(id) ON DELETE SET NULL,
  nudge_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nudge_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage nudge_log" ON public.nudge_log FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Users can read own nudge_log" ON public.nudge_log FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_nudge_log_protocol ON public.nudge_log (protocol_id, nudge_type);
