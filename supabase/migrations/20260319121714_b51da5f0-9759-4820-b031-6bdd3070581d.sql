
-- Table 1: WhatsApp conversation memory
CREATE TABLE public.whatsapp_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  direction text NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  message text NOT NULL,
  trigger_type text,
  wa_message_id text,
  intent_classified text,
  message_type text DEFAULT 'text',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own conversations"
  ON public.whatsapp_conversations FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Service role manages conversations"
  ON public.whatsapp_conversations FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
CREATE INDEX idx_whatsapp_conversations_user_created ON public.whatsapp_conversations(user_id, created_at DESC);

-- Table 2: Pip wellness pattern notes
CREATE TABLE public.pip_wellness_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  note_type text NOT NULL,
  context text,
  protocol_day int,
  protocol_id uuid,
  resolved boolean DEFAULT false,
  escalated_to text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.pip_wellness_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own wellness notes"
  ON public.pip_wellness_notes FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Service role manages wellness notes"
  ON public.pip_wellness_notes FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Table 3: Health trajectory scores
CREATE TABLE public.trajectory_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  week_start date NOT NULL,
  score int NOT NULL,
  direction text NOT NULL,
  biomarker_component float,
  wearable_component float,
  adherence_component float,
  wellbeing_component float,
  data_completeness float,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);
ALTER TABLE public.trajectory_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own trajectory"
  ON public.trajectory_scores FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Service role manages trajectory"
  ON public.trajectory_scores FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Table 4: Protocol debriefs
CREATE TABLE public.pip_protocol_debriefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  protocol_id uuid NOT NULL,
  q1_rating int,
  q1_answered_at timestamptz,
  q2_changes text,
  q2_answered_at timestamptz,
  q3_adjustments text,
  q3_answered_at timestamptz,
  debrief_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.pip_protocol_debriefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own debriefs"
  ON public.pip_protocol_debriefs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Service role manages debriefs"
  ON public.pip_protocol_debriefs FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Table 5: Product recommendation tracking
CREATE TABLE public.pip_product_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  product_id uuid REFERENCES public.support_products(id),
  symptom_trigger text,
  message_sent text,
  link_clicked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.pip_product_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own recommendations"
  ON public.pip_product_recommendations FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Service role manages product recommendations"
  ON public.pip_product_recommendations FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Table 6: Referrals
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid REFERENCES auth.users NOT NULL,
  referral_code text UNIQUE NOT NULL,
  referred_name text,
  referred_user_id uuid REFERENCES auth.users,
  status text DEFAULT 'pending',
  benefit_granted boolean DEFAULT false,
  expires_at timestamptz DEFAULT now() + interval '7 days',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_user_id);
CREATE POLICY "Public can read referral by code"
  ON public.referrals FOR SELECT
  USING (true);
CREATE POLICY "Service role manages referrals"
  ON public.referrals FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can update referral on signup"
  ON public.referrals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Profiles additions for Pip
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pip_paused_until timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pip_weekly_message_count int DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pip_last_contacted_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pip_frequency text DEFAULT 'normal';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pip_onboarding_done boolean DEFAULT false;

-- Nudge log additions
ALTER TABLE public.nudge_log ADD COLUMN IF NOT EXISTS message_content text;
ALTER TABLE public.nudge_log ADD COLUMN IF NOT EXISTS clinical_tier text;
