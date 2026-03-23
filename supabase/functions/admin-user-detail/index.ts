import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const ADMIN_EMAIL = "peptidesupplyuk@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user || user.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Fetch auth user email
    const { data: authUserData } = await admin.auth.admin.getUserById(user_id);
    const email = authUserData?.user?.email || "";

    const [
      profileRes,
      protocolsRes,
      protocolPeptidesRes,
      injectionsRes,
      supplementLogsRes,
      journalRes,
      bloodworkRes,
      activityRes,
      dnaRes,
    ] = await Promise.all([
      admin.from("profiles").select("*").eq("user_id", user_id).single(),
      admin.from("protocols").select("*").eq("user_id", user_id).order("created_at", { ascending: false }),
      admin.from("protocol_peptides").select("*").eq("user_id", user_id),
      admin.from("injection_logs").select("peptide_name, dose_mcg, status, scheduled_time, completed_at, injection_site, notes, side_effects, protocol_peptide_id").eq("user_id", user_id).order("scheduled_time", { ascending: false }).limit(100),
      admin.from("supplement_logs").select("item, status, date, protocol_id").eq("user_id", user_id).order("date", { ascending: false }).limit(100),
      admin.from("journal_entries").select("id, content, peptides, summary, created_at").eq("user_id", user_id).order("created_at", { ascending: false }).limit(20),
      admin.from("bloodwork_panels").select("id, panel_name, panel_type, test_date, created_at").eq("user_id", user_id).order("created_at", { ascending: false }),
      admin.from("user_activity").select("page_path, device_type, is_pwa, created_at, session_id").eq("user_id", user_id).order("created_at", { ascending: false }).limit(200),
      admin.from("dna_reports").select("id, input_method, overall_score, pipeline_status, created_at").eq("user_id", user_id).order("created_at", { ascending: false }),
    ]);

    // Compute activity summary
    const activity = activityRes.data || [];
    const uniqueSessions = new Set(activity.map((a: any) => a.session_id)).size;
    const pageViews: Record<string, number> = {};
    for (const a of activity) {
      if (a.page_path) pageViews[a.page_path] = (pageViews[a.page_path] || 0) + 1;
    }
    const topPages = Object.entries(pageViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([path, views]) => ({ path, views }));

    const lastSeen = activity.length > 0 ? activity[0].created_at : null;
    const isPwa = activity.some((a: any) => a.is_pwa);
    const deviceType = activity[0]?.device_type || "unknown";

    // Injection stats
    const injections = injectionsRes.data || [];
    const now = new Date();
    const completedCount = injections.filter((i: any) => i.status === "completed").length;
    const missedCount = injections.filter((i: any) => i.status === "scheduled" && new Date(i.scheduled_time) < now).length;
    const skippedCount = injections.filter((i: any) => i.status === "skipped").length;

    const result = {
      email,
      profile: profileRes.data,
      protocols: protocolsRes.data || [],
      protocol_peptides: protocolPeptidesRes.data || [],
      injection_summary: {
        total: injections.length,
        completed: completedCount,
        missed: missedCount,
        skipped: skippedCount,
        recent: injections.slice(0, 20),
      },
      supplement_logs: (supplementLogsRes.data || []).slice(0, 30),
      journal: journalRes.data || [],
      bloodwork: bloodworkRes.data || [],
      dna_reports: dnaRes.data || [],
      activity_summary: {
        total_page_views: activity.length,
        unique_sessions: uniqueSessions,
        last_seen: lastSeen,
        is_pwa: isPwa,
        device_type: deviceType,
        top_pages: topPages,
        recent_activity: activity.slice(0, 30),
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
