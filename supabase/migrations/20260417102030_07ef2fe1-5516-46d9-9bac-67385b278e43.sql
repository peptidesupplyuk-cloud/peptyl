-- Add share fields to coach_plans
ALTER TABLE public.coach_plans
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS share_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS share_created_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_coach_plans_share_token ON public.coach_plans(share_token) WHERE share_token IS NOT NULL;

-- Public read policy: anyone (anon or authed) can read a plan IF
--  - sharing is enabled
--  - share_token is set (the URL must include it; we filter by token in the query)
--  - not expired
CREATE POLICY "Public can view plans via active share link"
ON public.coach_plans
FOR SELECT
TO anon, authenticated
USING (
  share_enabled = true
  AND share_token IS NOT NULL
  AND (share_expires_at IS NULL OR share_expires_at > now())
);