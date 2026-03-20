
-- Pipeline tracking columns on dna_reports
ALTER TABLE dna_reports
ADD COLUMN IF NOT EXISTS pipeline_status text DEFAULT 'queued',
ADD COLUMN IF NOT EXISTS pipeline_progress integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pipeline_updated_at timestamptz,
ADD COLUMN IF NOT EXISTS pipeline_duration_ms integer,
ADD COLUMN IF NOT EXISTS pipeline_quality_score integer,
ADD COLUMN IF NOT EXISTS pipeline_retry_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pipeline_timings jsonb,
ADD COLUMN IF NOT EXISTS pipeline_injected text[],
ADD COLUMN IF NOT EXISTS pipeline_issues text[],
ADD COLUMN IF NOT EXISTS pipeline_error text;

-- Index for polling
CREATE INDEX IF NOT EXISTS idx_dna_reports_pipeline_status
ON dna_reports (pipeline_status)
WHERE pipeline_status NOT IN ('complete', 'failed');

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_dna_reports_user_status
ON dna_reports (user_id, pipeline_status);

-- Quality tracking table
CREATE TABLE IF NOT EXISTS dna_report_quality (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES dna_reports(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  quality_score integer NOT NULL,
  completeness_score integer,
  specificity_score integer,
  cross_reference_score integer,
  personalisation_score integer,
  hard_failure_count integer DEFAULT 0,
  soft_failure_count integer DEFAULT 0,
  issues text[],
  injected_fields text[],
  retry_count integer DEFAULT 0,
  synthesis_tokens integer,
  synthesis_duration_ms integer,
  model_used text DEFAULT 'claude-opus-4-20250514',
  UNIQUE(report_id)
);

CREATE INDEX IF NOT EXISTS idx_dna_report_quality_score
ON dna_report_quality (quality_score);

CREATE INDEX IF NOT EXISTS idx_dna_report_quality_report
ON dna_report_quality (report_id);

-- Failure log table
CREATE TABLE IF NOT EXISTS dna_report_failures (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES dna_reports(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  failure_type text NOT NULL,
  failure_code text NOT NULL,
  description text,
  attempt_number integer DEFAULT 1,
  resolved boolean DEFAULT false,
  resolved_by text
);

CREATE INDEX IF NOT EXISTS idx_dna_report_failures_report
ON dna_report_failures (report_id);

CREATE INDEX IF NOT EXISTS idx_dna_report_failures_type
ON dna_report_failures (failure_type, failure_code);

-- Extend dna_reviews
ALTER TABLE dna_reviews
ADD COLUMN IF NOT EXISTS section_feedback jsonb,
ADD COLUMN IF NOT EXISTS accuracy_rating integer,
ADD COLUMN IF NOT EXISTS feedback_text text;

COMMENT ON COLUMN dna_reviews.section_feedback IS 'Array of section names the user found most useful';
COMMENT ON COLUMN dna_reviews.accuracy_rating IS 'User rating 1-5 for report accuracy';
COMMENT ON COLUMN dna_reviews.feedback_text IS 'Free-text feedback from user';

-- Low quality trigger
CREATE OR REPLACE FUNCTION flag_low_quality_report()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pipeline_status = 'complete'
     AND NEW.pipeline_quality_score IS NOT NULL
     AND NEW.pipeline_quality_score < 60 THEN
    INSERT INTO dna_report_failures (
      report_id, failure_type, failure_code, description, resolved
    ) VALUES (
      NEW.id, 'soft', 'low_quality_score',
      'Report completed with quality score ' || NEW.pipeline_quality_score || '% (below 60% threshold)',
      false
    ) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_flag_low_quality ON dna_reports;

CREATE TRIGGER trigger_flag_low_quality
  AFTER UPDATE OF pipeline_status ON dna_reports
  FOR EACH ROW
  WHEN (NEW.pipeline_status = 'complete')
  EXECUTE FUNCTION flag_low_quality_report();

-- RLS for new tables
ALTER TABLE dna_report_quality ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quality for own reports"
ON dna_report_quality FOR SELECT
USING (
  report_id IN (
    SELECT id FROM dna_reports WHERE user_id = auth.uid()
  )
);

ALTER TABLE dna_report_failures ENABLE ROW LEVEL SECURITY;

-- Admin view
CREATE OR REPLACE VIEW admin_pipeline_quality AS
SELECT
  r.id AS report_id,
  r.user_id,
  r.pipeline_status,
  r.pipeline_quality_score,
  r.pipeline_duration_ms,
  r.pipeline_retry_count,
  r.overall_score,
  r.created_at,
  q.completeness_score,
  q.specificity_score,
  q.cross_reference_score,
  q.personalisation_score,
  q.hard_failure_count,
  q.soft_failure_count,
  q.synthesis_tokens,
  array_length(r.pipeline_issues, 1) AS issue_count,
  array_length(r.pipeline_injected, 1) AS injection_count
FROM dna_reports r
LEFT JOIN dna_report_quality q ON q.report_id = r.id
WHERE r.pipeline_status IS NOT NULL
ORDER BY r.created_at DESC;
