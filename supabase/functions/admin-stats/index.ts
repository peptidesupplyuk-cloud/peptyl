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

    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const [
      profilesRes,
      contactsRes,
      protocolsRes,
      bloodworkRes,
      recentSignupsRes,
      authUsersRes,
      journalRes,
      activityRes,
    ] = await Promise.all([
      admin.from("profiles").select("country, research_goal, experience_level, risk_tolerance, biomarker_availability, current_compounds, created_at"),
      admin.from("contact_submissions").select("id, name, email, message, created_at").order("created_at", { ascending: false }).limit(50),
      admin.from("protocols").select("id, user_id, name, goal, status, created_at"),
      admin.from("bloodwork_panels").select("id, user_id, panel_type, test_date, created_at"),
      admin.from("profiles").select("user_id, first_name, last_name, username, country, research_goal, experience_level, current_compounds, created_at").order("created_at", { ascending: false }).limit(30),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      admin.from("journal_entries").select("id, user_id, content, peptides, summary, created_at").order("created_at", { ascending: false }),
      admin.from("user_activity").select("user_id, session_id, is_pwa, display_mode, device_type, page_path, screen_width, created_at").order("created_at", { ascending: false }).limit(10000),
    ]);

    const profiles = profilesRes.data || [];
    const contacts = contactsRes.data || [];
    const protocols = protocolsRes.data || [];
    const bloodwork = bloodworkRes.data || [];
    const recentSignupsRaw = recentSignupsRes.data || [];
    const journalEntries = journalRes.data || [];
    const activityLogs = activityRes.data || [];

    // Build email lookup from auth users
    const emailMap: Record<string, string> = {};
    const authUsers = authUsersRes.data?.users || [];
    for (const u of authUsers) {
      emailMap[u.id] = u.email || "";
    }
    const recentSignups = recentSignupsRaw.map((s: any) => ({
      ...s,
      email: emailMap[s.user_id] || "",
    }));

    // ===== EXISTING AGGREGATIONS =====
    const byCountry: Record<string, number> = {};
    for (const p of profiles) {
      const c = p.country || "Not specified";
      byCountry[c] = (byCountry[c] || 0) + 1;
    }

    const byGoal: Record<string, number> = {};
    for (const p of profiles) {
      const g = p.research_goal || "Not specified";
      byGoal[g] = (byGoal[g] || 0) + 1;
    }

    const byExperience: Record<string, number> = {};
    for (const p of profiles) {
      const e = p.experience_level || "Not specified";
      byExperience[e] = (byExperience[e] || 0) + 1;
    }

    const byRisk: Record<string, number> = {};
    for (const p of profiles) {
      const r = p.risk_tolerance || "Not specified";
      byRisk[r] = (byRisk[r] || 0) + 1;
    }

    const byBiomarker: Record<string, number> = {};
    for (const p of profiles) {
      const b = p.biomarker_availability || "Not specified";
      byBiomarker[b] = (byBiomarker[b] || 0) + 1;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const signupsByDay: Record<string, number> = {};
    for (const p of profiles) {
      const d = p.created_at?.slice(0, 10);
      if (d && new Date(d) >= thirtyDaysAgo) {
        signupsByDay[d] = (signupsByDay[d] || 0) + 1;
      }
    }

    const uniqueProtocolUsers = new Set(protocols.map((p: any) => p.user_id)).size;
    const uniqueBloodworkUsers = new Set(bloodwork.map((b: any) => b.user_id)).size;

    const today = new Date().toISOString().slice(0, 10);
    const journalToday = journalEntries.filter((j: any) => j.created_at?.slice(0, 10) === today).length;
    const uniqueJournalUsers = new Set(journalEntries.map((j: any) => j.user_id)).size;

    const journalByDay: Record<string, number> = {};
    for (const j of journalEntries) {
      const d = j.created_at?.slice(0, 10);
      if (d && new Date(d) >= thirtyDaysAgo) {
        journalByDay[d] = (journalByDay[d] || 0) + 1;
      }
    }

    const peptideMentions: Record<string, number> = {};
    for (const j of journalEntries) {
      if (Array.isArray(j.peptides)) {
        for (const p of j.peptides) {
          if (p) peptideMentions[p] = (peptideMentions[p] || 0) + 1;
        }
      }
    }

    const recentJournal = journalEntries.slice(0, 20).map((j: any) => ({
      ...j,
      email: emailMap[j.user_id] || "",
    }));

    // ===== USER ENGAGEMENT ANALYTICS =====
    const now = new Date();
    const oneDayAgo = new Date(now); oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // DAU / WAU / MAU
    const dauUsers = new Set<string>();
    const wauUsers = new Set<string>();
    const mauUsers = new Set<string>();
    const pwaUsers = new Set<string>();
    const browserUsers = new Set<string>();
    const deviceCounts: Record<string, number> = {};
    const dailyActiveByDay: Record<string, Set<string>> = {};
    const topPages: Record<string, number> = {};
    const sessionsByUser: Record<string, Set<string>> = {};

    for (const a of activityLogs) {
      const ts = new Date(a.created_at);
      const uid = a.user_id;
      const day = a.created_at.slice(0, 10);

      // MAU (all within last 30 days from activity data)
      if (ts >= thirtyDaysAgo) mauUsers.add(uid);
      if (ts >= sevenDaysAgo) wauUsers.add(uid);
      if (ts >= oneDayAgo) dauUsers.add(uid);

      // PWA vs browser
      if (a.is_pwa) pwaUsers.add(uid);
      else browserUsers.add(uid);

      // Device type
      if (a.device_type) {
        deviceCounts[a.device_type] = (deviceCounts[a.device_type] || 0) + 1;
      }

      // DAU trend
      if (ts >= thirtyDaysAgo) {
        if (!dailyActiveByDay[day]) dailyActiveByDay[day] = new Set();
        dailyActiveByDay[day].add(uid);
      }

      // Top pages
      if (a.page_path && ts >= thirtyDaysAgo) {
        topPages[a.page_path] = (topPages[a.page_path] || 0) + 1;
      }

      // Sessions per user (for return rate)
      if (!sessionsByUser[uid]) sessionsByUser[uid] = new Set();
      sessionsByUser[uid].add(a.session_id);
    }

    // DAU trend array
    const dauTrend = Object.entries(dailyActiveByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, users]) => ({ date: date.slice(5), count: users.size }));

    // Return users: users with more than 1 session
    const totalTrackedUsers = Object.keys(sessionsByUser).length;
    const returningUsers = Object.values(sessionsByUser).filter(s => s.size > 1).length;
    const returnRate = totalTrackedUsers > 0 ? Math.round((returningUsers / totalTrackedUsers) * 100) : 0;

    // Session frequency distribution
    const sessionDistribution: Record<string, number> = { "1": 0, "2-3": 0, "4-7": 0, "8-14": 0, "15+": 0 };
    for (const sessions of Object.values(sessionsByUser)) {
      const count = sessions.size;
      if (count === 1) sessionDistribution["1"]++;
      else if (count <= 3) sessionDistribution["2-3"]++;
      else if (count <= 7) sessionDistribution["4-7"]++;
      else if (count <= 14) sessionDistribution["8-14"]++;
      else sessionDistribution["15+"]++;
    }

    // Top pages sorted
    const topPagesSorted = Object.entries(topPages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([path, views]) => ({ path, views }));

    // Most active users
    const userActivityCount: Record<string, number> = {};
    for (const a of activityLogs) {
      if (new Date(a.created_at) >= thirtyDaysAgo) {
        userActivityCount[a.user_id] = (userActivityCount[a.user_id] || 0) + 1;
      }
    }
    const mostActiveUsers = Object.entries(userActivityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([userId, pageViews]) => ({
        userId,
        email: emailMap[userId] || "Unknown",
        pageViews,
        sessions: sessionsByUser[userId]?.size || 0,
        isPwa: pwaUsers.has(userId),
      }));

    // Last seen for all auth users (from activity)
    const lastSeenMap: Record<string, string> = {};
    for (const a of activityLogs) {
      if (!lastSeenMap[a.user_id] || a.created_at > lastSeenMap[a.user_id]) {
        lastSeenMap[a.user_id] = a.created_at;
      }
    }

    const engagement = {
      dau: dauUsers.size,
      wau: wauUsers.size,
      mau: mauUsers.size,
      pwa_users: pwaUsers.size,
      browser_users: browserUsers.size,
      return_rate: returnRate,
      returning_users: returningUsers,
      total_tracked: totalTrackedUsers,
      device_counts: deviceCounts,
      dau_trend: dauTrend,
      session_distribution: sessionDistribution,
      top_pages: topPagesSorted,
      most_active_users: mostActiveUsers,
      total_page_views: activityLogs.length,
    };

    const stats = {
      total_users: profiles.length,
      total_protocols: protocols.length,
      total_bloodwork_panels: bloodwork.length,
      active_protocol_users: uniqueProtocolUsers,
      active_bloodwork_users: uniqueBloodworkUsers,
      total_contact_submissions: contacts.length,
      total_journal_entries: journalEntries.length,
      journal_entries_today: journalToday,
      unique_journal_users: uniqueJournalUsers,
      journal_by_day: journalByDay,
      journal_peptide_mentions: peptideMentions,
      recent_journal: recentJournal,
      by_country: byCountry,
      by_goal: byGoal,
      by_experience: byExperience,
      by_risk: byRisk,
      by_biomarker: byBiomarker,
      signups_by_day: signupsByDay,
      recent_signups: recentSignups,
      recent_contacts: contacts.slice(0, 20),
      engagement,
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
