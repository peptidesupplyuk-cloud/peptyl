import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Accept token from Authorization header OR query param (for browser redirects)
    const url = new URL(req.url);
    const tokenFromQuery = url.searchParams.get("token");
    const authHeader = req.headers.get("Authorization");
    const bearerToken = tokenFromQuery
      ? `Bearer ${tokenFromQuery}`
      : authHeader;

    if (!bearerToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: bearerToken } } },
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = Deno.env.get("WHOOP_CLIENT_ID");
    if (!clientId) {
      return new Response(JSON.stringify({ error: "WHOOP not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const redirectUri = "https://wmudidfprbtojkmtczaq.supabase.co/functions/v1/whoop-oauth-callback";

    const authorizeUrl =
      `https://api.prod.whoop.com/oauth/oauth2/auth` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent("read:recovery read:cycles read:sleep read:profile")}` +
      `&state=${user.id}`;

    // Return a 302 redirect so the browser performs a top-level navigation
    // This avoids WHOOP's X-Frame-Options: DENY blocking the login page
    return Response.redirect(authorizeUrl, 302);
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
