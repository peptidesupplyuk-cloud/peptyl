
-- Allow users to delete their own WHOOP connections
CREATE POLICY "Users can delete own whoop connections"
  ON public.whoop_connections
  FOR DELETE
  USING (auth.uid() = user_id);
