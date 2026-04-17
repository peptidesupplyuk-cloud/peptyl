-- Coach plans table for bespoke admin-created protocols
CREATE TABLE public.coach_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_notes TEXT,
  goal TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  peptides JSONB NOT NULL DEFAULT '[]'::jsonb,
  supplements JSONB NOT NULL DEFAULT '[]'::jsonb,
  titration_schedule JSONB DEFAULT '[]'::jsonb,
  injection_sites TEXT[],
  timing_notes TEXT,
  safety_notes TEXT,
  coach_rationale TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all coach plans"
ON public.coach_plans
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_coach_plans_updated_at
BEFORE UPDATE ON public.coach_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_coach_plans_created_by ON public.coach_plans(created_by);
CREATE INDEX idx_coach_plans_status ON public.coach_plans(status);