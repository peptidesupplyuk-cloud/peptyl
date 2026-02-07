
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Saved stacks (user's custom builds)
CREATE TABLE public.saved_stacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  peptides TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_stacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own stacks" ON public.saved_stacks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Stack votes: thumbs up/down on recommended stacks (referenced by name string)
CREATE TABLE public.stack_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stack_name TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, stack_name)
);

ALTER TABLE public.stack_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own votes" ON public.stack_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own votes" ON public.stack_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON public.stack_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON public.stack_votes FOR DELETE USING (auth.uid() = user_id);

-- Benefit votes: vote on specific benefits of stacks
CREATE TABLE public.benefit_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stack_name TEXT NOT NULL,
  benefit TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, stack_name, benefit)
);

ALTER TABLE public.benefit_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own benefit votes" ON public.benefit_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own benefit votes" ON public.benefit_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own benefit votes" ON public.benefit_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own benefit votes" ON public.benefit_votes FOR DELETE USING (auth.uid() = user_id);

-- Side effect votes: vote on specific side effects
CREATE TABLE public.side_effect_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stack_name TEXT NOT NULL,
  side_effect TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, stack_name, side_effect)
);

ALTER TABLE public.side_effect_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own side effect votes" ON public.side_effect_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own side effect votes" ON public.side_effect_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own side effect votes" ON public.side_effect_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own side effect votes" ON public.side_effect_votes FOR DELETE USING (auth.uid() = user_id);

-- Aggregated views (public read, no user identification)
CREATE OR REPLACE VIEW public.stack_vote_counts AS
SELECT
  stack_name,
  COUNT(*) FILTER (WHERE vote_type = 'up') AS upvotes,
  COUNT(*) FILTER (WHERE vote_type = 'down') AS downvotes
FROM public.stack_votes
GROUP BY stack_name;

CREATE OR REPLACE VIEW public.benefit_vote_counts AS
SELECT
  stack_name,
  benefit,
  COUNT(*) FILTER (WHERE vote_type = 'up') AS upvotes,
  COUNT(*) FILTER (WHERE vote_type = 'down') AS downvotes
FROM public.benefit_votes
GROUP BY stack_name, benefit;

CREATE OR REPLACE VIEW public.side_effect_vote_counts AS
SELECT
  stack_name,
  side_effect,
  COUNT(*) FILTER (WHERE vote_type = 'up') AS upvotes,
  COUNT(*) FILTER (WHERE vote_type = 'down') AS downvotes
FROM public.side_effect_votes
GROUP BY stack_name, side_effect;

-- Updated at trigger for profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
