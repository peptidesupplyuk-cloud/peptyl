
CREATE TABLE public.supplement_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  item TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, item)
);

ALTER TABLE public.supplement_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own supplement logs"
  ON public.supplement_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_supplement_logs_user_date ON public.supplement_logs (user_id, date);
