
-- Table for monitored X/Twitter accounts
CREATE TABLE public.monitored_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL DEFAULT 'twitter',
  handle TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  scan_frequency TEXT NOT NULL DEFAULT 'daily',
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  last_tweet_id TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.monitored_accounts ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can view monitored accounts
CREATE POLICY "Authenticated users can view monitored accounts"
  ON public.monitored_accounts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only the user who added can manage
CREATE POLICY "Users can insert monitored accounts"
  ON public.monitored_accounts FOR INSERT
  WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Users can update their monitored accounts"
  ON public.monitored_accounts FOR UPDATE
  USING (auth.uid() = added_by);

CREATE POLICY "Users can delete their monitored accounts"
  ON public.monitored_accounts FOR DELETE
  USING (auth.uid() = added_by);

-- Add full-text search column to articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_articles_search ON public.articles USING GIN(search_vector);

-- Trigger for updated_at on monitored_accounts
CREATE TRIGGER update_monitored_accounts_updated_at
  BEFORE UPDATE ON public.monitored_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
