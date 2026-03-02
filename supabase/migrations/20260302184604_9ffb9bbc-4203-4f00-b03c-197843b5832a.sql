
-- Add subscription columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT null,
  ADD COLUMN IF NOT EXISTS subscription_start timestamptz DEFAULT null,
  ADD COLUMN IF NOT EXISTS subscription_end timestamptz DEFAULT null;

-- Create payment_events table
CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  product text,
  event_type text,
  payment_id text,
  gocardless_event_id text,
  amount integer,
  currency text DEFAULT 'GBP',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own payment events
CREATE POLICY "Users can read own payment events"
  ON public.payment_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can insert payment events (from webhook)
CREATE POLICY "Service role can insert payment events"
  ON public.payment_events FOR INSERT
  WITH CHECK (true);
