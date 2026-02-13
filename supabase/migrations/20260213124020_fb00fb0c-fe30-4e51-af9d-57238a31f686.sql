
CREATE TABLE public.video_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_name TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert video views"
ON public.video_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read video view counts"
ON public.video_views FOR SELECT
USING (true);

CREATE INDEX idx_video_views_name ON public.video_views(video_name);
