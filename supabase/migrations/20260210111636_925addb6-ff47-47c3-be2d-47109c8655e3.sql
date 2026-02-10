
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Credibility tiers for sources
CREATE TYPE public.credibility_tier AS ENUM (
  'peer_reviewed',
  'clinical_trial',
  'expert_review',
  'established_media',
  'community_verified',
  'anecdotal'
);

-- Sources table (journals, blogs, channels, etc.)
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  credibility public.credibility_tier NOT NULL DEFAULT 'anecdotal',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sources are viewable by everyone" ON public.sources FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert sources" ON public.sources FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Only authenticated users can update sources" ON public.sources FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Articles table (processed content)
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url TEXT,
  raw_content TEXT,
  summary TEXT,
  peptides_mentioned TEXT[] DEFAULT '{}',
  findings JSONB DEFAULT '[]',
  dosing_details JSONB DEFAULT '[]',
  evidence_quality TEXT,
  credibility_tier public.credibility_tier NOT NULL DEFAULT 'anecdotal',
  status TEXT NOT NULL DEFAULT 'pending_review',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles are viewable by everyone" ON public.articles FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert articles" ON public.articles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update articles" ON public.articles FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete articles" ON public.articles FOR DELETE USING (auth.uid() IS NOT NULL);

-- Content queue (raw submissions awaiting processing)
CREATE TABLE public.content_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by UUID NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'url',
  raw_input TEXT NOT NULL,
  source_url TEXT,
  processing_status TEXT NOT NULL DEFAULT 'queued',
  processing_error TEXT,
  article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own queue items" ON public.content_queue FOR SELECT USING (auth.uid() = submitted_by OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert queue items" ON public.content_queue FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Authenticated users can update queue items" ON public.content_queue FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Embeddings table for RAG (pgvector)
CREATE TABLE public.content_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  chunk_text TEXT NOT NULL,
  embedding extensions.vector(768),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Embeddings are viewable by everyone" ON public.content_embeddings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage embeddings" ON public.content_embeddings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can delete embeddings" ON public.content_embeddings FOR DELETE USING (auth.uid() IS NOT NULL);

-- Index for vector similarity search
CREATE INDEX ON public.content_embeddings USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);

-- Feed posts (AI-generated content for review)
CREATE TABLE public.feed_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'briefing',
  related_article_ids UUID[] DEFAULT '{}',
  related_peptides TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published feed posts viewable by everyone" ON public.feed_posts FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage feed posts" ON public.feed_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update feed posts" ON public.feed_posts FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Updated_at triggers
CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON public.sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_queue_updated_at BEFORE UPDATE ON public.content_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feed_posts_updated_at BEFORE UPDATE ON public.feed_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Similarity search function
CREATE OR REPLACE FUNCTION public.match_embeddings(
  query_embedding extensions.vector(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  article_id UUID,
  chunk_text TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    ce.id,
    ce.article_id,
    ce.chunk_text,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM public.content_embeddings ce
  WHERE 1 - (ce.embedding <=> query_embedding) > match_threshold
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
$$;
