import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WHOOP_API = "https://api.prod.whoop.com/developer/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Determine which users to sync
    // If called with a user_id body param, sync just that user; otherwise sync all connected users
    let targetUserId: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        targetUserId = body.user_id ?? null;
      } catch {
        // no body — sync all
      }
    }

    let query = supabase
      .from("whoop_connections")
      .select("*")
      .not("access_token", "is", null);

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: connections, error: connErr } = await query;
    if (connErr) throw connErr;
    if (!connections || connections.length === 0) {
      return new Response(JSON.stringify({ synced: 0, message: "No connections" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // IMPORTANT: Always pull YESTERDAY only.
    // Whoop finalizes recovery after the sleep cycle ends,
    // so today's data is incomplete and causes chart jitter.
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10); // YYYY-MM-DD

    // ISO range for yesterday 00:00 → 23:59:59
    const startISO = `${dateStr}T00:00:00.000Z`;
    const endISO = `${dateStr}T23:59:59.999Z`;

    const results: { user_id: string; status: string; detail?: string }[] = [];

    for (const conn of connections) {
      try {
        // 1. Refresh token if expired
        let accessToken = conn.access_token;
        if (conn.expires_at && new Date(conn.expires_at) <= new Date()) {
          accessToken = await refreshToken(conn, supabase);
          if (!accessToken) {
            results.push({ user_id: conn.user_id, status: "error", detail: "Token refresh failed" });
            continue;
          }
        }

        const headers = { Authorization: `Bearer ${accessToken}` };

        // 2. Fetch recovery (HRV, RHR, recovery score)
        const recoveryData = await fetchWhoop(
          `${WHOOP_API}/recovery?start=${startISO}&end=${endISO}`,
          headers
        );

        // 3. Fetch sleep
        const sleepData = await fetchWhoop(
          `${WHOOP_API}/activity/sleep?start=${startISO}&end=${endISO}`,
          headers
        );

        // 4. Fetch cycle / strain
        const cycleData = await fetchWhoop(
          `${WHOOP_API}/cycle?start=${startISO}&end=${endISO}`,
          headers
        );

        // Extract metrics — use first record from each collection
        const rec = recoveryData?.records?.[0]?.score;
        const slp = sleepData?.records?.[0]?.score;
        const cyc = cycleData?.records?.[0]?.score;

        const metrics = {
          user_id: conn.user_id,
          date: dateStr,
          hrv: rec?.hrv_rmssd_milli ?? null,
          rhr: rec?.resting_heart_rate ?? null,
          recovery_score: rec?.recovery_score ?? null,
          respiratory_rate: rec?.respiratory_rate ?? null,
          strain: cyc?.strain ?? null,
          sleep_score: slp?.sleep_performance_percentage ?? null,
          sleep_duration: slp?.total_in_bed_time_milli
            ? Math.round(slp.total_in_bed_time_milli / 60000)
            : null,
          sleep_efficiency: slp?.sleep_efficiency_percentage ?? null,
        };

        // 5. Upsert into whoop_daily_metrics
        const { error: upsertErr } = await supabase
          .from("whoop_daily_metrics")
          .upsert(metrics, { onConflict: "user_id,date" });

        if (upsertErr) throw upsertErr;

        // 6. Update last_sync_at
        await supabase
          .from("whoop_connections")
          .update({ last_sync_at: new Date().toISOString() })
          .eq("user_id", conn.user_id);

        results.push({ user_id: conn.user_id, status: "ok" });
      } catch (err: any) {
        results.push({ user_id: conn.user_id, status: "error", detail: err?.message });
      }
    }

    return new Response(JSON.stringify({ synced: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// --- helpers ---

async function fetchWhoop(url: string, headers: Record<string, string>) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Whoop API ${res.status}: ${text}`);
  }
  return await res.json();
}

async function refreshToken(conn: any, supabase: any): Promise<string | null> {
  // RFC 6749 §2.3.1 — Confidential client MUST authenticate via HTTP Basic header.
  // WHOOP rejects client_id/client_secret in the request body.
  const clientId = Deno.env.get("WHOOP_CLIENT_ID");
  const clientSecret = Deno.env.get("WHOOP_CLIENT_SECRET");
  if (!clientId || !clientSecret) return null;

  const basicAuth = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch("https://api.prod.whoop.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: conn.refresh_token,
    }),
  });

  if (!res.ok) {
    await res.text();
    return null;
  }

  const data = await res.json();
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  await supabase
    .from("whoop_connections")
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? conn.refresh_token,
      expires_at: expiresAt,
    })
    .eq("user_id", conn.user_id);

  return data.access_token;
}
