
-- Support Layer: affiliate products linked to protocols/supplements
CREATE TABLE public.support_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  rating NUMERIC,
  review_count TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Public read, admin write
ALTER TABLE public.support_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active support products"
  ON public.support_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can insert support products"
  ON public.support_products FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update support products"
  ON public.support_products FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete support products"
  ON public.support_products FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
