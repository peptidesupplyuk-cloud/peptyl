
-- Table for users to request tracking of new markers
CREATE TABLE public.marker_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  marker_name text NOT NULL,
  source text DEFAULT 'pdf_upload',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marker_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own marker requests"
  ON public.marker_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own marker requests"
  ON public.marker_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all marker requests"
  ON public.marker_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update marker requests"
  ON public.marker_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
