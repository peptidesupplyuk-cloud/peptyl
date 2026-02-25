
CREATE TABLE public.dna_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.dna_reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (report_id, user_id)
);

ALTER TABLE public.dna_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own review" ON public.dna_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own reviews" ON public.dna_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own review" ON public.dna_reviews
  FOR UPDATE USING (auth.uid() = user_id);
