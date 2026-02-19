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
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // user_id passed as state

    if (!code || !state) {
      return new Response("Missing code or state", { status: 400, headers: corsHeaders });
    }

    const clientId = Deno.env.get("WHOOP_CLIENT_ID")!;
    const clientSecret = Deno.env.get("WHOOP_CLIENT_SECRET")!;

    // RFC 6749 §2.3.1 — HTTP Basic authentication for confidential clients
    const basicAuth = btoa(`${clientId}:${clientSecret}`);

    // Determine redirect_uri (must match what was used in authorize URL)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const redirectUri = `${supabaseUrl}/functions/v1/whoop-oauth-callback`;

    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://api.prod.whoop.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenText = await tokenRes.text();
    if (!tokenRes.ok) {
      console.error("WHOOP token exchange failed:", tokenRes.status, tokenText);
      return new Response(`Token exchange failed: ${tokenText}`, {
        status: 400,
        headers: corsHeaders,
      });
    }

    const tokenData = JSON.parse(tokenText);
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // Fetch WHOOP user profile to get whoop_user_id
    let whoopUserId: string | null = null;
    try {
      const profileRes = await fetch("https://api.prod.whoop.com/developer/v1/user/profile/basic", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        whoopUserId = String(profile.user_id);
      } else {
        await profileRes.text(); // consume body
      }
    } catch {
      // non-critical
    }

    // Store connection in DB
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("whoop_connections").upsert(
      {
        user_id: state,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        whoop_user_id: whoopUserId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("DB upsert error:", error);
      return new Response(`DB error: ${error.message}`, { status: 500, headers: corsHeaders });
    }

    // Redirect user back to dashboard
    const appUrl = Deno.env.get("APP_URL") || "https://peptyl.lovable.app";
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: `${appUrl}/dashboard?tab=overview&whoop=connected`,
      },
    });
  } catch (err: any) {
    console.error("WHOOP OAuth callback error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
