
-- Research Queue table for AI-extracted PubMed findings
CREATE TABLE IF NOT EXISTS public.research_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pubmed_id TEXT UNIQUE,
  title TEXT NOT NULL,
  abstract TEXT,
  authors TEXT[],
  published_date DATE,
  source_url TEXT,
  compound_names TEXT[],
  gene_names TEXT[],
  biomarker_names TEXT[],
  relationship_type TEXT,
  strength TEXT,
  evidence_level TEXT,
  dose_note TEXT,
  ai_summary TEXT,
  evidence_score INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending',
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  written_to_graph BOOLEAN DEFAULT FALSE,
  knowledge_edge_id UUID REFERENCES public.knowledge_edges(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation trigger for evidence_score (1-5) instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_research_queue_evidence_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.evidence_score IS NOT NULL AND (NEW.evidence_score < 1 OR NEW.evidence_score > 5) THEN
    RAISE EXCEPTION 'evidence_score must be between 1 and 5';
  END IF;
  IF NEW.status IS NOT NULL AND NEW.status NOT IN ('pending','approved','rejected','needs_review') THEN
    RAISE EXCEPTION 'status must be one of: pending, approved, rejected, needs_review';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_research_queue_fields
  BEFORE INSERT OR UPDATE ON public.research_queue
  FOR EACH ROW EXECUTE FUNCTION public.validate_research_queue_evidence_score();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_research_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER research_queue_updated_at
  BEFORE UPDATE ON public.research_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_research_queue_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS research_queue_status_idx ON public.research_queue(status);
CREATE INDEX IF NOT EXISTS research_queue_pubmed_idx ON public.research_queue(pubmed_id);
CREATE INDEX IF NOT EXISTS research_queue_created_idx ON public.research_queue(created_at DESC);

-- RLS
ALTER TABLE public.research_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage research queue"
  ON public.research_queue FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role full access research queue"
  ON public.research_queue FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
