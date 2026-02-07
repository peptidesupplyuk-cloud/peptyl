
-- Fix security definer views by recreating with security_invoker
DROP VIEW IF EXISTS public.stack_vote_counts;
DROP VIEW IF EXISTS public.benefit_vote_counts;
DROP VIEW IF EXISTS public.side_effect_vote_counts;

CREATE VIEW public.stack_vote_counts
WITH (security_invoker=on) AS
SELECT
  stack_name,
  COUNT(*) FILTER (WHERE vote_type = 'up') AS upvotes,
  COUNT(*) FILTER (WHERE vote_type = 'down') AS downvotes
FROM public.stack_votes
GROUP BY stack_name;

CREATE VIEW public.benefit_vote_counts
WITH (security_invoker=on) AS
SELECT
  stack_name,
  benefit,
  COUNT(*) FILTER (WHERE vote_type = 'up') AS upvotes,
  COUNT(*) FILTER (WHERE vote_type = 'down') AS downvotes
FROM public.benefit_votes
GROUP BY stack_name, benefit;

CREATE VIEW public.side_effect_vote_counts
WITH (security_invoker=on) AS
SELECT
  stack_name,
  side_effect,
  COUNT(*) FILTER (WHERE vote_type = 'up') AS upvotes,
  COUNT(*) FILTER (WHERE vote_type = 'down') AS downvotes
FROM public.side_effect_votes
GROUP BY stack_name, side_effect;

-- The views use security_invoker, so they respect the RLS of the underlying tables.
-- But for aggregated vote counts we need anyone authenticated to read ALL votes (not just their own).
-- Add read-all policies for authenticated users on the vote tables:
CREATE POLICY "Authenticated can read all stack votes" ON public.stack_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read all benefit votes" ON public.benefit_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read all side effect votes" ON public.side_effect_votes FOR SELECT TO authenticated USING (true);

-- Drop the overly restrictive self-only read policies
DROP POLICY "Users can read own votes" ON public.stack_votes;
DROP POLICY "Users can read own benefit votes" ON public.benefit_votes;
DROP POLICY "Users can read own side effect votes" ON public.side_effect_votes;
