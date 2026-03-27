CREATE TABLE public.manual_compounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  compound_name text NOT NULL,
  compound_type text NOT NULL DEFAULT 'supplement',
  needs_review boolean NOT NULL DEFAULT true,
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.manual_compounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own manual compounds"
  ON public.manual_compounds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own manual compounds"
  ON public.manual_compounds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all manual compounds"
  ON public.manual_compounds FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update manual compounds"
  ON public.manual_compounds FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));