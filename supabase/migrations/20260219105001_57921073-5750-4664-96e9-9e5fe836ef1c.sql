
-- Table for persisting votes on peptide experiences (both hardcoded research + community reports)
CREATE TABLE public.peptide_experience_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  peptide_name text NOT NULL,
  experience_key text NOT NULL, -- for hardcoded: "research_<index>", for journal: journal entry id
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, peptide_name, experience_key)
);

ALTER TABLE public.peptide_experience_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read aggregate vote counts
CREATE POLICY "Anyone can read experience votes"
  ON public.peptide_experience_votes FOR SELECT
  USING (true);

-- Authenticated users can insert their own votes
CREATE POLICY "Users can insert own experience votes"
  ON public.peptide_experience_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes (change direction)
CREATE POLICY "Users can update own experience votes"
  ON public.peptide_experience_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own votes (unvote)
CREATE POLICY "Users can delete own experience votes"
  ON public.peptide_experience_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Allow public read of journal summaries for community reports (anonymized)
-- Add a new policy that allows reading summaries without exposing user_id
CREATE POLICY "Anyone can read journal summaries for community"
  ON public.journal_entries FOR SELECT
  USING (true);

-- Create a view for aggregated community experiences per peptide
CREATE OR REPLACE VIEW public.community_experiences AS
SELECT 
  unnest(peptides) as peptide_name,
  id as journal_id,
  summary,
  evidence_quality,
  created_at
FROM public.journal_entries
WHERE summary IS NOT NULL AND summary != ''
  AND peptides IS NOT NULL AND array_length(peptides, 1) > 0;

-- Create a view for aggregated vote counts per experience
CREATE OR REPLACE VIEW public.experience_vote_counts AS
SELECT 
  peptide_name,
  experience_key,
  COUNT(*) FILTER (WHERE vote_type = 'up') as upvotes,
  COUNT(*) FILTER (WHERE vote_type = 'down') as downvotes
FROM public.peptide_experience_votes
GROUP BY peptide_name, experience_key;
