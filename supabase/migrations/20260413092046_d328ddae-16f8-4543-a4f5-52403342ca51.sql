
-- 1. Enable RLS on user_biomarker_results
ALTER TABLE public.user_biomarker_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own biomarker results"
  ON public.user_biomarker_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own biomarker results"
  ON public.user_biomarker_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own biomarker results"
  ON public.user_biomarker_results FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own biomarker results"
  ON public.user_biomarker_results FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Enable RLS on user_protocols
ALTER TABLE public.user_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own user_protocols"
  ON public.user_protocols FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_protocols"
  ON public.user_protocols FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_protocols"
  ON public.user_protocols FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own user_protocols"
  ON public.user_protocols FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Fix journal_entries public read policy
DROP POLICY IF EXISTS "Anyone can read journal summaries for community" ON public.journal_entries;

-- 4. Fix articles SELECT policy - restrict unpublished to admins
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;
CREATE POLICY "Articles: published visible to all, drafts to admins"
  ON public.articles FOR SELECT
  USING (
    status = 'published'
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 5. Fix feed_posts SELECT policy
DROP POLICY IF EXISTS "Published feed posts viewable by everyone" ON public.feed_posts;
CREATE POLICY "Feed posts: published visible to all, drafts to admins"
  ON public.feed_posts FOR SELECT
  USING (
    status = 'published'
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 6. Drop overly permissive keyword_scores policy (admin policies already exist)
DROP POLICY IF EXISTS "Keyword scores viewable by authenticated users" ON public.keyword_scores;

-- 7. Fix security definer views
ALTER VIEW public.fitbit_connections_safe SET (security_invoker = on);
ALTER VIEW public.admin_pipeline_quality SET (security_invoker = on);

-- 8. Fix function search_path
CREATE OR REPLACE FUNCTION public.validate_research_queue_evidence_score()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.evidence_score IS NOT NULL AND (NEW.evidence_score < 1 OR NEW.evidence_score > 5) THEN
    RAISE EXCEPTION 'evidence_score must be between 1 and 5';
  END IF;
  IF NEW.status IS NOT NULL AND NEW.status NOT IN ('pending','approved','rejected','needs_review') THEN
    RAISE EXCEPTION 'status must be one of: pending, approved, rejected, needs_review';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_research_queue_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.flag_low_quality_report()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.pipeline_status = 'complete'
     AND NEW.pipeline_quality_score IS NOT NULL
     AND NEW.pipeline_quality_score < 60 THEN
    INSERT INTO public.dna_report_failures (
      report_id, failure_type, failure_code, description, resolved
    ) VALUES (
      NEW.id, 'soft', 'low_quality_score',
      'Report completed with quality score ' || NEW.pipeline_quality_score || '% (below 60% threshold)',
      false
    ) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;
