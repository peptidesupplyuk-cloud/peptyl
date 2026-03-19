-- Users can read markers belonging to their own panels
CREATE POLICY "Users can read own markers"
  ON public.bloodwork_markers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bloodwork_panels bp
      WHERE bp.id = bloodwork_markers.panel_id
        AND bp.user_id = auth.uid()
    )
  );

-- Users can insert markers into their own panels
CREATE POLICY "Users can insert own markers"
  ON public.bloodwork_markers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bloodwork_panels bp
      WHERE bp.id = bloodwork_markers.panel_id
        AND bp.user_id = auth.uid()
    )
  );

-- Users can update markers in their own panels
CREATE POLICY "Users can update own markers"
  ON public.bloodwork_markers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bloodwork_panels bp
      WHERE bp.id = bloodwork_markers.panel_id
        AND bp.user_id = auth.uid()
    )
  );