
-- Fix scrape_log policies to be more restrictive
DROP POLICY "Only service role can insert scrape log" ON public.supplier_scrape_log;
DROP POLICY "Only service role can update scrape log" ON public.supplier_scrape_log;

CREATE POLICY "Only admins can insert scrape log"
  ON public.supplier_scrape_log FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update scrape log"
  ON public.supplier_scrape_log FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));
