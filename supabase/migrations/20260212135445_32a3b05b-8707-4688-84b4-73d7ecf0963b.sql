
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  page TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
ON public.feedback FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can read feedback"
ON public.feedback FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete feedback"
ON public.feedback FOR DELETE
USING (auth.uid() IS NOT NULL);
