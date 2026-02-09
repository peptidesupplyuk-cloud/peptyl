
-- Bloodwork panels (one per test date)
CREATE TABLE public.bloodwork_panels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_date DATE NOT NULL,
  panel_type TEXT NOT NULL DEFAULT 'basic',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bloodwork_panels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own panels" ON public.bloodwork_panels FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Bloodwork markers (individual values per panel)
CREATE TABLE public.bloodwork_markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id UUID NOT NULL REFERENCES public.bloodwork_panels(id) ON DELETE CASCADE,
  marker_name TEXT NOT NULL,
  value NUMERIC,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bloodwork_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own markers" ON public.bloodwork_markers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.bloodwork_panels bp WHERE bp.id = panel_id AND bp.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.bloodwork_panels bp WHERE bp.id = panel_id AND bp.user_id = auth.uid())
  );

-- Protocols
CREATE TABLE public.protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  goal TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  disclaimer_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own protocols" ON public.protocols FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_protocols_updated_at
  BEFORE UPDATE ON public.protocols
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Protocol peptides
CREATE TABLE public.protocol_peptides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,
  peptide_name TEXT NOT NULL,
  dose_mcg NUMERIC NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily',
  timing TEXT DEFAULT 'PM',
  route TEXT DEFAULT 'SubQ',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.protocol_peptides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own protocol peptides" ON public.protocol_peptides FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.protocols p WHERE p.id = protocol_id AND p.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.protocols p WHERE p.id = protocol_id AND p.user_id = auth.uid())
  );

-- Injection logs
CREATE TABLE public.injection_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  protocol_peptide_id UUID REFERENCES public.protocol_peptides(id) ON DELETE SET NULL,
  peptide_name TEXT NOT NULL,
  dose_mcg NUMERIC NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled',
  injection_site TEXT,
  side_effects TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.injection_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own injection logs" ON public.injection_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
