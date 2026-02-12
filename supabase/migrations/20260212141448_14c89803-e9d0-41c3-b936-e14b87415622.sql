
-- 1. Create app_role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can read roles (via has_role function bootstrap)
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Create security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Seed admin role for the known admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'peptidesupplyuk@gmail.com'
ON CONFLICT DO NOTHING;

-- 4. Update articles RLS: keep public SELECT, restrict writes to admin
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON public.articles;

CREATE POLICY "Only admins can insert articles"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update articles"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete articles"
  ON public.articles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Update content_queue: users can insert own, only admin can update
DROP POLICY IF EXISTS "Authenticated users can update queue items" ON public.content_queue;

CREATE POLICY "Only admins can update queue items"
  ON public.content_queue FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Update feed_posts: restrict to admin
DROP POLICY IF EXISTS "Authenticated users can manage feed posts" ON public.feed_posts;
DROP POLICY IF EXISTS "Authenticated users can update feed posts" ON public.feed_posts;

CREATE POLICY "Only admins can insert feed posts"
  ON public.feed_posts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update feed posts"
  ON public.feed_posts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Update monitored_accounts: restrict to admin
DROP POLICY IF EXISTS "Users can insert monitored accounts" ON public.monitored_accounts;
DROP POLICY IF EXISTS "Users can update their monitored accounts" ON public.monitored_accounts;
DROP POLICY IF EXISTS "Users can delete their monitored accounts" ON public.monitored_accounts;

CREATE POLICY "Only admins can insert monitored accounts"
  ON public.monitored_accounts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update monitored accounts"
  ON public.monitored_accounts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete monitored accounts"
  ON public.monitored_accounts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 8. Update keyword_scores: restrict to admin
DROP POLICY IF EXISTS "Authenticated users can insert keyword scores" ON public.keyword_scores;
DROP POLICY IF EXISTS "Authenticated users can update keyword scores" ON public.keyword_scores;

CREATE POLICY "Only admins can insert keyword scores"
  ON public.keyword_scores FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update keyword scores"
  ON public.keyword_scores FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 9. Update content_embeddings: restrict writes to admin
DROP POLICY IF EXISTS "Authenticated users can manage embeddings" ON public.content_embeddings;
DROP POLICY IF EXISTS "Authenticated users can delete embeddings" ON public.content_embeddings;

CREATE POLICY "Only admins can insert embeddings"
  ON public.content_embeddings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete embeddings"
  ON public.content_embeddings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 10. Update contact_submissions SELECT to admin-only (replace false with admin check)
DROP POLICY IF EXISTS "No public reads" ON public.contact_submissions;

CREATE POLICY "Only admins can read contact submissions"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 11. Update feedback: restrict reads/deletes to admin
DROP POLICY IF EXISTS "Only admins can read feedback" ON public.feedback;
DROP POLICY IF EXISTS "Only admins can delete feedback" ON public.feedback;

CREATE POLICY "Only admins can read feedback"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete feedback"
  ON public.feedback FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 12. Update sources: restrict writes to admin
DROP POLICY IF EXISTS "Only authenticated users can insert sources" ON public.sources;
DROP POLICY IF EXISTS "Only authenticated users can update sources" ON public.sources;

CREATE POLICY "Only admins can insert sources"
  ON public.sources FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update sources"
  ON public.sources FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
