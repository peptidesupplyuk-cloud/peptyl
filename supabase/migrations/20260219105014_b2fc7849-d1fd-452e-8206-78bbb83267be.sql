
-- Fix security definer views by recreating with security_invoker = true
DROP VIEW IF EXISTS public.community_experiences;
DROP VIEW IF EXISTS public.experience_vote_counts;

CREATE VIEW public.community_experiences 
WITH (security_invoker = true) AS
SELECT 
  unnest(peptides) as peptide_name,
  id as journal_id,
  summary,
  evidence_quality,
  created_at
FROM public.journal_entries
WHERE summary IS NOT NULL AND summary != ''
  AND peptides IS NOT NULL AND array_length(peptides, 1) > 0;

CREATE VIEW public.experience_vote_counts
WITH (security_invoker = true) AS
SELECT 
  peptide_name,
  experience_key,
  COUNT(*) FILTER (WHERE vote_type = 'up') as upvotes,
  COUNT(*) FILTER (WHERE vote_type = 'down') as downvotes
FROM public.peptide_experience_votes
GROUP BY peptide_name, experience_key;
