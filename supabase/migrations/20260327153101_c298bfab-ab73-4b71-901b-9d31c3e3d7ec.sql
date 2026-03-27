
CREATE TABLE public.pip_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'health_score', 'protocol', 'biomarkers')),
  structured_data JSONB DEFAULT NULL,
  is_proactive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pip_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pip conversations"
  ON public.pip_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pip conversations"
  ON public.pip_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_pip_conversations_user_id ON public.pip_conversations(user_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.pip_conversations;
