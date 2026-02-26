
-- Drop the overly broad ALL policy
DROP POLICY IF EXISTS "Users can CRUD own whoop connection" ON public.whoop_connections;

-- SELECT: users can read their own row but NOT token fields (use a column-restricted approach via RLS + view)
-- Since RLS can't restrict columns, we restrict SELECT to service_role only for this table
-- and create a safe view for the frontend

-- New policies: users can insert/update/delete their own rows, but only service_role can SELECT
CREATE POLICY "Users can insert own whoop connection"
  ON public.whoop_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own whoop connection"
  ON public.whoop_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own whoop connection"
  ON public.whoop_connections FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can select whoop connections"
  ON public.whoop_connections FOR SELECT
  USING (auth.role() = 'service_role');

-- Create a safe view that excludes tokens for frontend use
CREATE OR REPLACE VIEW public.whoop_connections_safe AS
  SELECT id, user_id, whoop_user_id, last_sync_at, created_at, updated_at
  FROM public.whoop_connections;

-- Grant access to the view
GRANT SELECT ON public.whoop_connections_safe TO authenticated;

-- Users can select from the safe view (inherits service_role via SECURITY DEFINER isn't needed - 
-- views bypass RLS by default when owned by postgres)
