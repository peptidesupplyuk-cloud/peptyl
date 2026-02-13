
-- Table to store scraped supplier prices
CREATE TABLE public.supplier_prices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL DEFAULT 'medication', -- 'medication' or 'bloodwork'
  product_name text NOT NULL,
  supplier_name text NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'GBP',
  url text NOT NULL,
  in_stock boolean NOT NULL DEFAULT true,
  scraped_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_supplier_prices_category ON public.supplier_prices (category);
CREATE INDEX idx_supplier_prices_product ON public.supplier_prices (product_name);
CREATE INDEX idx_supplier_prices_scraped ON public.supplier_prices (scraped_at DESC);

-- Enable RLS
ALTER TABLE public.supplier_prices ENABLE ROW LEVEL SECURITY;

-- Public read access (prices are public info)
CREATE POLICY "Anyone can read supplier prices"
  ON public.supplier_prices FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Only admins can insert supplier prices"
  ON public.supplier_prices FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update supplier prices"
  ON public.supplier_prices FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete supplier prices"
  ON public.supplier_prices FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Table to track scrape runs
CREATE TABLE public.supplier_scrape_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  suppliers_scraped integer DEFAULT 0,
  products_matched integer DEFAULT 0,
  errors jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'running'
);

ALTER TABLE public.supplier_scrape_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scrape log"
  ON public.supplier_scrape_log FOR SELECT
  USING (true);

CREATE POLICY "Only service role can insert scrape log"
  ON public.supplier_scrape_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only service role can update scrape log"
  ON public.supplier_scrape_log FOR UPDATE
  USING (true);
