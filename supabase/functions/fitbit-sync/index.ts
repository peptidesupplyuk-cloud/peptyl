import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function refreshToken(supabase: any, connection: any) {
  const clientId = Deno.env.get("FITBIT_CLIENT_ID")!;
  const clientSecret = Deno.env.get("FITBIT_CLIENT_SECRET")!;
  const basicAuth = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch("https://api.fitbit.com/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: connection.refresh_token,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.errors?.[0]?.message || "Refresh failed");

  await supabase.from("fitbit_connections").update({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", connection.id);

  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let userId: string | null = null;
    try {
      const body = await req.json();
      userId = body.user_id;
    } catch {}

    // Get connections to sync
    let query = supabase.from("fitbit_connections").select("*");
    if (userId) query = query.eq("user_id", userId);
    const { data: connections, error } = await query;
    if (error) throw error;

    const results: any[] = [];

    for (const conn of connections || []) {
      try {
        let token = conn.access_token;

        // Refresh if expired
        if (conn.expires_at && new Date(conn.expires_at) < new Date()) {
          token = await refreshToken(supabase, conn);
        }

        const today = new Date().toISOString().split("T")[0];

        // Fetch heart rate data
        const hrRes = await fetch(
          `https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const hrData = hrRes.ok ? await hrRes.json() : null;

        // Fetch sleep data
        const sleepRes = await fetch(
          `https://api.fitbit.com/1.2/user/-/sleep/date/${today}.json`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const sleepData = sleepRes.ok ? await sleepRes.json() : null;

        // Fetch activity summary
        const actRes = await fetch(
          `https://api.fitbit.com/1/user/-/activities/date/${today}.json`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const actData = actRes.ok ? await actRes.json() : null;

        // Fetch HRV (if available)
        const hrvRes = await fetch(
          `https://api.fitbit.com/1/user/-/hrv/date/${today}.json`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const hrvData = hrvRes.ok ? await hrvRes.json() : null;

        const restingHr = hrData?.["activities-heart"]?.[0]?.value?.restingHeartRate ?? null;
        const sleepLog = sleepData?.sleep?.[0];
        const sleepScore = sleepLog?.efficiency ?? null;
        const sleepDuration = sleepLog?.duration ? Math.round(sleepLog.duration / 60000) : null;
        const steps = actData?.summary?.steps ?? null;
        const activeMinutes = (actData?.summary?.fairlyActiveMinutes ?? 0) + (actData?.summary?.veryActiveMinutes ?? 0);
        const calories = actData?.summary?.caloriesOut ?? null;
        const hrv = hrvData?.hrv?.[0]?.value?.dailyRmssd ?? null;

        const { error: upsertErr } = await supabase
          .from("fitbit_daily_metrics")
          .upsert({
            user_id: conn.user_id,
            date: today,
            resting_heart_rate: restingHr,
            hrv,
            sleep_score: sleepScore,
            sleep_duration_minutes: sleepDuration,
            steps,
            active_zone_minutes: activeMinutes || null,
            calories_burned: calories,
            raw_json: { hr: hrData, sleep: sleepData, activity: actData, hrv: hrvData },
          }, { onConflict: "user_id,date" });

        if (upsertErr) throw upsertErr;

        await supabase.from("fitbit_connections").update({
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", conn.id);

        results.push({ user_id: conn.user_id, status: "ok" });
      } catch (e: any) {
        results.push({ user_id: conn.user_id, status: "error", message: e.message });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
