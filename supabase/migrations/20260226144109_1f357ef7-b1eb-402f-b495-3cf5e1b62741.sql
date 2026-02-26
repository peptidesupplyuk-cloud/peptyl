
-- Make the view SECURITY INVOKER so it respects the querying user's permissions
ALTER VIEW public.whoop_connections_safe SET (security_invoker = on);

-- Enable RLS on the underlying table is already done, and the view with security_invoker
-- will respect it. But since we restricted SELECT to service_role, we need to allow
-- users to SELECT their own rows too for the view to work.

-- Drop the service-role-only SELECT policy and replace with one that hides tokens
DROP POLICY IF EXISTS "Service role can select whoop connections" ON public.whoop_connections;

-- Allow users to read their own connection (the view filters out token columns)
CREATE POLICY "Users can select own whoop connection"
  ON public.whoop_connections FOR SELECT
  USING (auth.uid() = user_id);
