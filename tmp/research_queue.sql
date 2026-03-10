-- ============================================================
-- PEPTYL — Research Queue Table
-- Run in Supabase SQL Editor before deploying the edge function
-- ============================================================

CREATE TABLE IF NOT EXISTS research_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source info
  pubmed_id TEXT UNIQUE,                        -- e.g. "38291047"
  title TEXT NOT NULL,
  abstract TEXT,
  authors TEXT[],
  published_date DATE,
  source_url TEXT,

  -- What the AI extracted
  compound_names TEXT[],                        -- ["BPC-157", "TB-500"]
  gene_names TEXT[],                            -- ["MTHFR_C677T"]
  biomarker_names TEXT[],                       -- ["Homocysteine"]
  relationship_type TEXT,                       -- triggers / synergises / confirms etc
  strength TEXT,                                -- strong / moderate / weak
  evidence_level TEXT,                          -- rct / observational / mechanistic etc
  dose_note TEXT,
  ai_summary TEXT,                              -- plain English summary
  evidence_score INTEGER CHECK (evidence_score BETWEEN 1 AND 5),

  -- Review workflow
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','needs_review')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  -- Did it get written to knowledge_edges?
  written_to_graph BOOLEAN DEFAULT FALSE,
  knowledge_edge_id UUID REFERENCES knowledge_edges(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS research_queue_status_idx ON research_queue(status);
CREATE INDEX IF NOT EXISTS research_queue_pubmed_idx ON research_queue(pubmed_id);
CREATE INDEX IF NOT EXISTS research_queue_created_idx ON research_queue(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_research_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER research_queue_updated_at
  BEFORE UPDATE ON research_queue
  FOR EACH ROW EXECUTE FUNCTION update_research_queue_updated_at();

-- RLS: only authenticated users (admins) can read/write
ALTER TABLE research_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage research queue"
  ON research_queue
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
