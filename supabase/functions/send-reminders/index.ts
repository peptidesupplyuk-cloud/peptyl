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

interface SupplementReminder {
  name: string;
  dose: string;
  frequency: string;
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

    console.log("Environment check:", {
      hasResendKey: !!resendApiKey,
      hasWhatsappToken: !!whatsappToken,
      hasWhatsappPhoneId: !!whatsappPhoneNumberId,
    });

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().split("T")[0];
    const currentHour = new Date().getUTCHours();

    const isAM = currentHour >= 6 && currentHour < 12;
    const isPM = currentHour >= 17 && currentHour < 23;
    const window = isAM ? "AM" : isPM ? "PM" : null;

    console.log(`Current UTC hour: ${currentHour}, window: ${window}`);

    if (!window) {
      return new Response(
        JSON.stringify({ message: "Outside reminder windows" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: protocols, error: protErr } = await supabase
      .from("protocols")
      .select("id, user_id, name, status, supplements")
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

    const results: Array<{ user_id: string; email_sent: boolean; whatsapp_sent: boolean; peptides_count: number; supplements_count: number; error?: string }> = [];

    for (const [userId, userProts] of Object.entries(userProtocols)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("notify_email, notify_whatsapp, whatsapp_number, notify_am_time, notify_pm_time")
        .eq("user_id", userId)
        .single();

      if (!profile) continue;
      if (!profile.notify_email && !profile.notify_whatsapp) continue;

      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      const userEmail = authUser?.user?.email;

      if (!userEmail && profile.notify_email) {
        console.log(`User ${userId}: notify_email=true but no email found, skipping`);
        continue;
      }

      const reminders: PeptideReminder[] = [];
      const supplementReminders: SupplementReminder[] = [];
      const seenSupplements = new Set<string>();

      for (const prot of userProts) {
        const { data: peptides } = await supabase
          .from("protocol_peptides")
          .select("peptide_name, dose_mcg, timing, frequency")
          .eq("protocol_id", prot.id);

        if (peptides) {
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

        if (window === "AM" && Array.isArray(prot.supplements)) {
          for (const supp of prot.supplements as Array<{ name: string; dose: string; frequency: string }>) {
            if (supp.name && !seenSupplements.has(supp.name)) {
              seenSupplements.add(supp.name);
              supplementReminders.push({
                name: supp.name,
                dose: supp.dose || "",
                frequency: supp.frequency || "daily",
                protocol_name: prot.name,
              });
            }
          }
        }
      }

      if (reminders.length === 0 && supplementReminders.length === 0) continue;

      let emailSent = false;
      let whatsappSent = false;
      let errorMsg: string | undefined;

      // Send email via Resend
      if (profile.notify_email && resendApiKey && userEmail) {
        try {
          const emailHtml = buildReminderEmail(reminders, supplementReminders, window, today);
          const totalCount = reminders.length + supplementReminders.length;

          const emailPayload = {
            from: "Peptyl <reminders@peptyl.co.uk>",
            to: [userEmail],
            subject: `⏰ Action Required: ${totalCount} item${totalCount > 1 ? "s" : ""} to complete on your dashboard`,
            html: emailHtml,
          };

          console.log(`Sending email to ${userEmail} with ${totalCount} items...`);

          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailPayload),
          });

          const emailResBody = await emailRes.text();
          emailSent = emailRes.ok;

          if (!emailRes.ok) {
            console.error(`Resend API error (${emailRes.status}): ${emailResBody}`);
            errorMsg = `Resend ${emailRes.status}: ${emailResBody}`;
          } else {
            console.log(`Email sent to ${userEmail}: ${emailResBody}`);
          }
        } catch (emailErr) {
          console.error(`Email send exception for ${userEmail}:`, emailErr);
          errorMsg = emailErr instanceof Error ? emailErr.message : "Email send failed";
        }
      } else {
        console.log(`Email skipped for ${userId}: notify=${profile.notify_email}, hasKey=${!!resendApiKey}, email=${userEmail}`);
      }

      // Send WhatsApp via Meta Cloud API
      if (profile.notify_whatsapp && whatsappToken && whatsappPhoneNumberId && profile.whatsapp_number) {
        const waMessage = buildWhatsAppMessage(reminders, supplementReminders, window);
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
        supplements_count: supplementReminders.length,
        ...(errorMsg ? { error: errorMsg } : {}),
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

function buildWhatsAppMessage(reminders: PeptideReminder[], supplements: SupplementReminder[], window: string): string {
  const totalCount = reminders.length + supplements.length;
  const lines = [
    `🧬 *Action Required — Your ${window} Protocol*`,
    `━━━━━━━━━━━━━━━━`,
    `You have *${totalCount} item${totalCount > 1 ? "s" : ""}* to complete.\n`,
  ];

  if (reminders.length > 0) {
    for (const r of reminders) {
      lines.push(`💉 *${r.peptide_name}* — ${r.dose_mcg} mcg`);
      lines.push(`   📋 Protocol: ${r.protocol_name}\n`);
    }
  }

  if (supplements.length > 0) {
    lines.push(`💊 *Supplements*`);
    for (const s of supplements) {
      lines.push(`   • ${s.name} — ${s.dose}`);
    }
    lines.push("");
  }

  lines.push(`━━━━━━━━━━━━━━━━`);
  lines.push(`✅ *Log your doses on your dashboard:*`);
  lines.push(`peptyl.lovable.app/dashboard`);

  return lines.join("\n");
}

function buildReminderEmail(
  reminders: PeptideReminder[],
  supplements: SupplementReminder[],
  window: string,
  date: string
): string {
  const totalCount = reminders.length + supplements.length;

  const peptideRows = reminders
    .map(
      (r) =>
        `<tr>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb">
            <span style="font-size:18px">💉</span>
            <strong style="color:#111827;margin-left:6px">${r.peptide_name}</strong>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#374151;font-weight:500">${r.dose_mcg} mcg</td>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280">${r.protocol_name}</td>
        </tr>`
    )
    .join("");

  const supplementRows = supplements
    .map(
      (s) =>
        `<tr>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb">
            <span style="font-size:18px">💊</span>
            <strong style="color:#111827;margin-left:6px">${s.name}</strong>
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#374151;font-weight:500">${s.dose}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280">${s.protocol_name}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:0;background:#ffffff">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:28px 24px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:700">⏰ Action Required</h1>
        <p style="color:#d1fae5;font-size:14px;margin:8px 0 0;font-weight:400">
          You have <strong style="color:#ffffff">${totalCount} item${totalCount > 1 ? "s" : ""}</strong> to complete in your <strong style="color:#ffffff">${window}</strong> window
        </p>
      </div>

      <!-- Body -->
      <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.5">
          Hi there 👋 — here's what's due today. Please log in to your dashboard to mark each item as complete.
        </p>

        <!-- Items table -->
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
          <thead>
            <tr style="background:#f0fdfa">
              <th style="padding:10px 16px;text-align:left;font-weight:600;color:#0d9488;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Item</th>
              <th style="padding:10px 16px;text-align:left;font-weight:600;color:#0d9488;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Dose</th>
              <th style="padding:10px 16px;text-align:left;font-weight:600;color:#0d9488;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Protocol</th>
            </tr>
          </thead>
          <tbody>${peptideRows}${supplementRows}</tbody>
        </table>

        <!-- CTA Button -->
        <div style="text-align:center;margin:24px 0 8px">
          <a href="https://peptyl.lovable.app/dashboard" 
             style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;letter-spacing:0.3px">
            ✅ Go to Dashboard & Complete
          </a>
        </div>
        <p style="text-align:center;font-size:12px;color:#9ca3af;margin:8px 0 0">
          Log your doses to keep your streak going!
        </p>
      </div>

      <!-- Footer -->
      <div style="padding:20px 24px;text-align:center">
        <p style="font-size:11px;color:#9ca3af;margin:0;line-height:1.6">
          This is an automated reminder from Peptyl. For educational and research purposes only.
          <br/>Manage notification preferences in your <a href="https://peptyl.lovable.app/dashboard" style="color:#0d9488;text-decoration:underline">dashboard settings</a>.
        </p>
      </div>
    </div>
  `;
}
