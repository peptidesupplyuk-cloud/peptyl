import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PeptideReminder {
  peptide_name: string;
  dose_mcg: number;
  timing: string;
  protocol_name: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const whatsappToken = Deno.env.get("WHATSAPP_TOKEN");
    const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().split("T")[0];
    const currentHour = new Date().getUTCHours();

    const isAM = currentHour >= 6 && currentHour < 12;
    const isPM = currentHour >= 17 && currentHour < 23;
    const window = isAM ? "AM" : isPM ? "PM" : null;

    if (!window) {
      return new Response(
        JSON.stringify({ message: "Outside reminder windows" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: protocols, error: protErr } = await supabase
      .from("protocols")
      .select("id, user_id, name, status")
      .eq("status", "active");

    if (protErr) throw protErr;
    if (!protocols || protocols.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active protocols" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userProtocols: Record<string, typeof protocols> = {};
    for (const p of protocols) {
      if (!userProtocols[p.user_id]) userProtocols[p.user_id] = [];
      userProtocols[p.user_id].push(p);
    }

    const results: Array<{ user_id: string; email_sent: boolean; whatsapp_sent: boolean; peptides_count: number }> = [];

    for (const [userId, userProts] of Object.entries(userProtocols)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("notify_email, notify_whatsapp, whatsapp_number, notify_am_time, notify_pm_time")
        .eq("user_id", userId)
        .single();

      if (!profile) continue;
      if (!profile.notify_email && !profile.notify_whatsapp) continue;

      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      if (!authUser?.user?.email && profile.notify_email) continue;

      const reminders: PeptideReminder[] = [];

      for (const prot of userProts) {
        const { data: peptides } = await supabase
          .from("protocol_peptides")
          .select("peptide_name, dose_mcg, timing, frequency")
          .eq("protocol_id", prot.id);

        if (!peptides) continue;

        for (const pep of peptides) {
          const timing = (pep.timing || "AM").toUpperCase();
          const matchesWindow =
            (window === "AM" && timing.includes("AM")) ||
            (window === "PM" && (timing.includes("PM") || timing.includes("BED")));

          if (matchesWindow) {
            const isDue = checkFrequencyDue(pep.frequency, today);
            if (isDue) {
              reminders.push({
                peptide_name: pep.peptide_name,
                dose_mcg: pep.dose_mcg,
                timing: pep.timing || "AM",
                protocol_name: prot.name,
              });
            }
          }
        }
      }

      if (reminders.length === 0) continue;

      let emailSent = false;
      let whatsappSent = false;

      // Send email via Resend
      if (profile.notify_email && resendApiKey && authUser?.user?.email) {
        const emailHtml = buildReminderEmail(reminders, window, today);
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Peptyl <reminders@peptyl.co.uk>",
            to: [authUser.user.email],
            subject: `⏰ ${window} Reminder: ${reminders.length} peptide${reminders.length > 1 ? "s" : ""} due`,
            html: emailHtml,
          }),
        });
        emailSent = emailRes.ok;
        console.log(`Email to ${authUser.user.email}: ${emailRes.ok ? "sent" : "failed"}`);
      }

      // Send WhatsApp via Meta Cloud API
      if (profile.notify_whatsapp && whatsappToken && whatsappPhoneNumberId && profile.whatsapp_number) {
        const waMessage = buildWhatsAppMessage(reminders, window);
        try {
          const waRes = await fetch(
            `https://graph.facebook.com/v21.0/${whatsappPhoneNumberId}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${whatsappToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: profile.whatsapp_number.replace(/\s+/g, "").replace(/^\+/, ""),
                type: "text",
                text: { body: waMessage },
              }),
            }
          );
          const waData = await waRes.json();
          whatsappSent = waRes.ok;
          console.log(`WhatsApp to ${profile.whatsapp_number}: ${waRes.ok ? "sent" : "failed"}`, waData);
        } catch (waErr) {
          console.error("WhatsApp send error:", waErr);
        }
      }

      results.push({
        user_id: userId,
        email_sent: emailSent,
        whatsapp_sent: whatsappSent,
        peptides_count: reminders.length,
      });
    }

    return new Response(
      JSON.stringify({ success: true, reminders_sent: results.length, details: results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Reminder error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function checkFrequencyDue(frequency: string, todayStr: string): boolean {
  const today = new Date(todayStr);
  const dayOfWeek = today.getDay();
  switch (frequency.toLowerCase()) {
    case "daily": return true;
    case "weekly": return dayOfWeek === 1;
    case "2x/week": return dayOfWeek === 1 || dayOfWeek === 4;
    case "3x/week": return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
    case "5on/2off": return dayOfWeek >= 1 && dayOfWeek <= 5;
    default: return true;
  }
}

function buildWhatsAppMessage(reminders: PeptideReminder[], window: string): string {
  const lines = [
    `🧬 *Your Daily reminder from BioBot*`,
    `━━━━━━━━━━━━━━━━`,
    `⏰ *${window} Window* — ${reminders.length} peptide${reminders.length > 1 ? "s" : ""} due\n`,
  ];

  for (const r of reminders) {
    lines.push(`💉 *${r.peptide_name}* — ${r.dose_mcg} mcg`);
    lines.push(`   📋 Protocol: ${r.protocol_name}\n`);
  }

  lines.push(`━━━━━━━━━━━━━━━━`);
  lines.push(`_For research purposes only._`);
  lines.push(`_Manage at peptyl.lovable.app/dashboard_`);

  return lines.join("\n");
}

function buildReminderEmail(
  reminders: PeptideReminder[],
  window: string,
  date: string
): string {
  const peptideRows = reminders
    .map(
      (r) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${r.peptide_name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${r.dose_mcg} mcg</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">${r.protocol_name}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:500px;margin:0 auto;padding:24px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#0d9488;font-size:24px;margin:0">Peptyl</h1>
        <p style="color:#888;font-size:13px;margin:4px 0 0">Your ${window} Research Reminder</p>
      </div>
      <div style="background:#f8fffe;border:1px solid #d1fae5;border-radius:12px;padding:20px;margin-bottom:16px">
        <p style="margin:0 0 12px;font-size:14px;color:#333">
          You have <strong>${reminders.length} peptide${reminders.length > 1 ? "s" : ""}</strong> 
          scheduled for your <strong>${window}</strong> window today.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#e6f7f5">
              <th style="padding:8px 12px;text-align:left;font-weight:600;color:#0d9488">Peptide</th>
              <th style="padding:8px 12px;text-align:left;font-weight:600;color:#0d9488">Dose</th>
              <th style="padding:8px 12px;text-align:left;font-weight:600;color:#0d9488">Protocol</th>
            </tr>
          </thead>
          <tbody>${peptideRows}</tbody>
        </table>
      </div>
      <p style="font-size:12px;color:#999;text-align:center;margin-top:24px">
        This is an automated reminder from Peptyl. For educational and research purposes only.
        <br/>Manage your preferences in your <a href="https://peptyl.lovable.app/dashboard" style="color:#0d9488">dashboard</a>.
      </p>
    </div>
  `;
}
