import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const ADMIN_EMAIL = "peptidesupplyuk@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Verify user is admin via JWT
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

    // Use service role for aggregate queries
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Run all queries in parallel
    const [
      profilesRes,
      contactsRes,
      protocolsRes,
      bloodworkRes,
      recentSignupsRes,
    ] = await Promise.all([
      admin.from("profiles").select("country, research_goal, created_at"),
      admin.from("contact_submissions").select("id, name, email, message, created_at").order("created_at", { ascending: false }).limit(50),
      admin.from("protocols").select("id, user_id, name, goal, status, created_at"),
      admin.from("bloodwork_panels").select("id, user_id, panel_type, test_date, created_at"),
      admin.from("profiles").select("user_id, username, country, research_goal, created_at").order("created_at", { ascending: false }).limit(20),
    ]);

    const profiles = profilesRes.data || [];
    const contacts = contactsRes.data || [];
    const protocols = protocolsRes.data || [];
    const bloodwork = bloodworkRes.data || [];
    const recentSignups = recentSignupsRes.data || [];

    // Aggregate: users by country
    const byCountry: Record<string, number> = {};
    for (const p of profiles) {
      const c = p.country || "Not specified";
      byCountry[c] = (byCountry[c] || 0) + 1;
    }

    // Aggregate: users by research goal
    const byGoal: Record<string, number> = {};
    for (const p of profiles) {
      const g = p.research_goal || "Not specified";
      byGoal[g] = (byGoal[g] || 0) + 1;
    }

    // Signups over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const signupsByDay: Record<string, number> = {};
    for (const p of profiles) {
      const d = p.created_at?.slice(0, 10);
      if (d && new Date(d) >= thirtyDaysAgo) {
        signupsByDay[d] = (signupsByDay[d] || 0) + 1;
      }
    }

    // Unique users with protocols / bloodwork
    const uniqueProtocolUsers = new Set(protocols.map((p: any) => p.user_id)).size;
    const uniqueBloodworkUsers = new Set(bloodwork.map((b: any) => b.user_id)).size;

    const stats = {
      total_users: profiles.length,
      total_protocols: protocols.length,
      total_bloodwork_panels: bloodwork.length,
      active_protocol_users: uniqueProtocolUsers,
      active_bloodwork_users: uniqueBloodworkUsers,
      total_contact_submissions: contacts.length,
      by_country: byCountry,
      by_goal: byGoal,
      signups_by_day: signupsByDay,
      recent_signups: recentSignups,
      recent_contacts: contacts.slice(0, 20),
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
