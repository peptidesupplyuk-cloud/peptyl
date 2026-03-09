import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Count how many days in the past 7 a peptide was due, based on its frequency */
function countDueDays(
  frequency: string,
  protocolStartDate: string,
  weekStart: Date,
  weekEnd: Date
): number {
  let count = 0;
  const start = new Date(protocolStartDate);

  for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
    // Skip days before protocol started
    if (d < start) continue;

    const daysSinceStart = Math.floor(
      (d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dayOfWeek = d.getDay(); // 0=Sun

    let due = false;
    switch (frequency.toLowerCase()) {
      case "daily":
        due = true;
        break;
      case "weekly":
        due = daysSinceStart % 7 === 0;
        break;
      case "2x/week":
        due = dayOfWeek === 1 || dayOfWeek === 4;
        break;
      case "3x/week":
        due = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
        break;
      case "5on/2off":
        due = dayOfWeek >= 1 && dayOfWeek <= 5;
        break;
      case "eod":
      case "every other day":
        due = daysSinceStart % 2 === 0;
        break;
      default:
        due = true;
    }
    if (due) count++;
  }
  return count;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username");

    if (!profiles?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: authData } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });
    const emailMap = new Map<string, string>();
    for (const u of authData?.users ?? []) {
      if (u.email) emailMap.set(u.id, u.email);
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoISO = weekAgo.toISOString();

    const { count: newArticleCount } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte("published_at", weekAgoISO);

    let sentCount = 0;

    for (const profile of profiles) {
      const email = emailMap.get(profile.user_id);
      if (!email) continue;

      // Get active protocols with their peptides
      const { data: protocols } = await supabase
        .from("protocols")
        .select("id, name, start_date, end_date, status")
        .eq("user_id", profile.user_id)
        .eq("status", "active");

      const active = protocols?.length ?? 0;

      // Calculate EXPECTED doses from protocol peptides (server-side)
      let expectedDoses = 0;
      for (const protocol of protocols ?? []) {
        const { data: peptides } = await supabase
          .from("protocol_peptides")
          .select("frequency")
          .eq("protocol_id", protocol.id);

        for (const pep of peptides ?? []) {
          expectedDoses += countDueDays(
            pep.frequency,
            protocol.start_date,
            weekAgo,
            now
          );
        }
      }

      // Count ACTUAL completed doses from injection_logs
      const { data: doses } = await supabase
        .from("injection_logs")
        .select("status")
        .eq("user_id", profile.user_id)
        .gte("scheduled_time", weekAgoISO);

      const completed = (doses ?? []).filter(
        (i) => i.status === "completed"
      ).length;

      // Count completed supplements from supplement_logs
      const weekAgoDate = weekAgo.toISOString().split("T")[0];
      const { count: supplementsCompleted } = await supabase
        .from("supplement_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.user_id)
        .eq("completed", true)
        .gte("date", weekAgoDate);

      const totalCompleted = completed + (supplementsCompleted ?? 0);

      // Use the higher of expected vs logged scheduled for denominator
      const scheduled = Math.max(expectedDoses, doses?.length ?? 0);

      // Ending soon
      const endingSoon = (protocols ?? [])
        .filter((p) => {
          if (!p.end_date) return false;
          const daysLeft = Math.ceil(
            (new Date(p.end_date).getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          return daysLeft <= 7 && daysLeft >= 0;
        })
        .map((p) => p.name);

      // Skip users with truly no activity
      if (totalCompleted === 0 && active === 0) continue;

      const displayName = profile.username || "Researcher";
      const completionRate =
        scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;

      const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #e5e5e5;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #14b8a6; font-size: 22px; margin: 0;">Peptyl Weekly Digest</h1>
    <p style="color: #737373; font-size: 13px; margin-top: 4px;">Your research progress this week</p>
  </div>

  <div style="background: #171717; border: 1px solid #262626; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
    <p style="margin: 0 0 12px; font-size: 15px;">Hey ${displayName} 👋</p>
    <p style="margin: 0; font-size: 13px; color: #a3a3a3;">Here's your weekly research summary:</p>
  </div>

  <div style="display: flex; gap: 12px; margin-bottom: 16px;">
    <div style="flex: 1; background: #171717; border: 1px solid #262626; border-radius: 12px; padding: 16px; text-align: center;">
      <div style="font-size: 28px; font-weight: bold; color: #14b8a6;">${completed}/${scheduled}</div>
      <div style="font-size: 11px; color: #737373; margin-top: 4px;">Doses Logged</div>
    </div>
    <div style="flex: 1; background: #171717; border: 1px solid #262626; border-radius: 12px; padding: 16px; text-align: center;">
      <div style="font-size: 28px; font-weight: bold; color: ${completionRate >= 80 ? "#22c55e" : completionRate >= 50 ? "#eab308" : "#ef4444"};">${completionRate}%</div>
      <div style="font-size: 11px; color: #737373; margin-top: 4px;">Adherence Rate</div>
    </div>
    <div style="flex: 1; background: #171717; border: 1px solid #262626; border-radius: 12px; padding: 16px; text-align: center;">
      <div style="font-size: 28px; font-weight: bold; color: #14b8a6;">${active}</div>
      <div style="font-size: 11px; color: #737373; margin-top: 4px;">Active Protocols</div>
    </div>
  </div>

  ${(supplementsCompleted ?? 0) > 0 ? `
  <div style="background: #171717; border: 1px solid #262626; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
    <p style="margin: 0; font-size: 13px;">💊 <strong>${supplementsCompleted}</strong> supplement dose${(supplementsCompleted ?? 0) > 1 ? "s" : ""} logged this week.</p>
  </div>
  ` : ""}

  ${endingSoon.length > 0 ? `
  <div style="background: #451a03; border: 1px solid #92400e; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
    <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #fbbf24;">⚠️ Protocols Ending Soon</p>
    ${endingSoon.map((n) => `<p style="margin: 0; font-size: 13px; color: #fde68a;">• ${n}</p>`).join("")}
    <p style="margin: 8px 0 0; font-size: 11px; color: #d97706;">Consider scheduling follow-up bloodwork.</p>
  </div>
  ` : ""}

  ${(newArticleCount ?? 0) > 0 ? `
  <div style="background: #171717; border: 1px solid #262626; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
    <p style="margin: 0; font-size: 13px;">📚 <strong>${newArticleCount}</strong> new research article${(newArticleCount ?? 0) > 1 ? "s" : ""} published this week.</p>
  </div>
  ` : ""}

  ${scheduled > 0 && completionRate < 50 ? `
  <div style="background: #171717; border: 1px solid #262626; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
    <p style="margin: 0; font-size: 13px; color: #a3a3a3;">💡 <strong>Tip:</strong> Open your dashboard daily to log doses — consistency is key for accurate tracking.</p>
  </div>
  ` : ""}

  <div style="text-align: center; margin-top: 24px;">
    <a href="https://peptyl.co.uk/dashboard" style="display: inline-block; background: #14b8a6; color: #0a0a0a; font-weight: 600; padding: 10px 28px; border-radius: 8px; text-decoration: none; font-size: 14px;">View Dashboard</a>
  </div>

  <p style="text-align: center; font-size: 11px; color: #525252; margin-top: 32px;">
    Peptyl — peptide research platform. For educational use only.
  </p>
</body>
</html>`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Peptyl <digest@peptyl.co.uk>",
          to: [email],
          subject: `Your Week: ${completed}/${scheduled} doses, ${completionRate}% adherence`,
          html: htmlBody,
        }),
      });

      if (res.ok) sentCount++;
      else {
        const errBody = await res.text();
        console.error(`Failed to send to ${email}: ${res.status} ${errBody}`);
      }
    }

    return new Response(
      JSON.stringify({ sent: sentCount, total_users: profiles.length }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Weekly digest error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
