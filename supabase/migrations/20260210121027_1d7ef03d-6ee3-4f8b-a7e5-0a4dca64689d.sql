-- Add quality score to monitored accounts for adaptive learning
ALTER TABLE public.monitored_accounts 
ADD COLUMN quality_score numeric NOT NULL DEFAULT 50,
ADD COLUMN total_accepted integer NOT NULL DEFAULT 0,
ADD COLUMN total_rejected integer NOT NULL DEFAULT 0;

-- Track topic/keyword performance for adaptive filtering
CREATE TABLE public.keyword_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword text NOT NULL UNIQUE,
  accept_count integer NOT NULL DEFAULT 0,
  reject_count integer NOT NULL DEFAULT 0,
  score numeric NOT NULL DEFAULT 50,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.keyword_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Keyword scores viewable by authenticated users"
ON public.keyword_scores FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert keyword scores"
ON public.keyword_scores FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update keyword scores"
ON public.keyword_scores FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Add source_account to articles so we can trace back to which account produced the article
ALTER TABLE public.articles
ADD COLUMN source_account_handle text;

-- Function to update scores when an article is approved or rejected
CREATE OR REPLACE FUNCTION public.update_learning_scores()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  peptide text;
  acc_record record;
BEGIN
  -- Only fire when status changes to published or rejected
  IF (OLD.status = NEW.status) THEN RETURN NEW; END IF;
  IF (NEW.status NOT IN ('published', 'rejected')) THEN RETURN NEW; END IF;

  -- Update account score if we know the source account
  IF NEW.source_account_handle IS NOT NULL THEN
    IF NEW.status = 'published' THEN
      UPDATE monitored_accounts 
      SET total_accepted = total_accepted + 1,
          quality_score = LEAST(100, quality_score + 3)
      WHERE handle = NEW.source_account_handle;
    ELSE
      UPDATE monitored_accounts 
      SET total_rejected = total_rejected + 1,
          quality_score = GREATEST(0, quality_score - 5)
      WHERE handle = NEW.source_account_handle;
    END IF;
  END IF;

  -- Update keyword scores for each peptide mentioned
  IF NEW.peptides_mentioned IS NOT NULL THEN
    FOREACH peptide IN ARRAY NEW.peptides_mentioned LOOP
      INSERT INTO keyword_scores (keyword) VALUES (lower(peptide))
      ON CONFLICT (keyword) DO NOTHING;

      IF NEW.status = 'published' THEN
        UPDATE keyword_scores 
        SET accept_count = accept_count + 1,
            score = LEAST(100, score + 2),
            updated_at = now()
        WHERE keyword = lower(peptide);
      ELSE
        UPDATE keyword_scores 
        SET reject_count = reject_count + 1,
            score = GREATEST(0, score - 3),
            updated_at = now()
        WHERE keyword = lower(peptide);
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER articles_learning_trigger
AFTER UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_learning_scores();
