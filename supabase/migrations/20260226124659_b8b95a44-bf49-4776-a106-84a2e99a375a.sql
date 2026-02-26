CREATE TABLE public.audit_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  peptyl_id TEXT,
  compound_name TEXT NOT NULL,
  compound_type TEXT NOT NULL DEFAULT 'peptide',
  issue_type TEXT NOT NULL,
  field_affected TEXT,
  current_value TEXT,
  issue_description TEXT,
  recommended_fix TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  fixed_at TIMESTAMPTZ,
  fixed_by TEXT,
  audit_run_id UUID
);

ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage audit results" ON public.audit_results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authenticated users can read audit results" ON public.audit_results
  FOR SELECT USING (auth.uid() IS NOT NULL);