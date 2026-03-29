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
  doseWindow: "AM" | "PM";
}

interface SupplementReminder {
  name: string;
  dose: string;
  frequency: string;
  protocol_name: string;
  doseWindow: "AM" | "PM";
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
    const onesignalApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");
    const onesignalAppId = "7dd6be24-0dca-45af-b8b6-15cc95db293d";

    console.log("Environment check:", {
      hasResendKey: !!resendApiKey,
      hasWhatsappToken: !!whatsappToken,
      hasWhatsappPhoneId: !!whatsappPhoneNumberId,
      hasOneSignalKey: !!onesignalApiKey,
    });

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    // Use UK timezone (handles GMT/BST automatically)
    const ukFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
    });
    const ukParts = ukFormatter.formatToParts(now);
    const ukYear = ukParts.find(p => p.type === "year")!.value;
    const ukMonth = ukParts.find(p => p.type === "month")!.value;
    const ukDay = ukParts.find(p => p.type === "day")!.value;
    const today = `${ukYear}-${ukMonth}-${ukDay}`;
    const currentHour = parseInt(ukParts.find(p => p.type === "hour")!.value, 10);

    console.log(`Current UK hour: ${currentHour}, UK date: ${today}`);

    // ── DOSE REMINDERS ──
    // Two phases:
    //   1) "initial" — fires at user's chosen AM/PM time, sends email + push
    //   2) "followup" — fires 3 hours later, checks if doses are incomplete, sends push + email chase
    const results: Array<{ user_id: string; phase: string; email_sent: boolean; push_sent: boolean; peptides_count: number; supplements_count: number; error?: string }> = [];

    // Fetch all active protocols
    const { data: rawProtocols, error: protErr } = await supabase
      .from("protocols")
      .select("id, user_id, name, status, supplements, start_date, end_date")
      .eq("status", "active");

    if (protErr) throw protErr;

    // Filter out protocols past their end_date and auto-complete them
    const protocols = [];
    for (const p of rawProtocols || []) {
      if (p.end_date && p.end_date < today) {
        // Auto-complete expired protocol
        await supabase.from("protocols").update({ status: "completed" }).eq("id", p.id);
        console.log(`Auto-completed expired protocol ${p.id} (${p.name}), end_date: ${p.end_date}`);
        continue;
      }
      protocols.push(p);
    }

    if (protocols.length > 0) {
      const userProtocols: Record<string, typeof protocols> = {};
      for (const p of protocols) {
        if (!userProtocols[p.user_id]) userProtocols[p.user_id] = [];
        userProtocols[p.user_id].push(p);
      }

      for (const [userId, userProts] of Object.entries(userProtocols)) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("notify_email, notify_whatsapp, whatsapp_number, whatsapp_verified, notify_am_time, notify_pm_time")
          .eq("user_id", userId)
          .single();

        if (!profile) continue;
        if (!profile.notify_email && !onesignalApiKey) continue;

        // Parse user's preferred hours (stored as "HH:MM:SS" time strings, assumed UTC)
        const amHour = parseInt((profile.notify_am_time || "08:00:00").split(":")[0], 10);
        const pmHour = parseInt((profile.notify_pm_time || "20:00:00").split(":")[0], 10);

        // Determine which phase we're in for this user
        const isAMTime = currentHour === amHour;
        const isPMTime = currentHour === pmHour;
        const isAMFollowup = currentHour === amHour + 3;
        const isPMFollowup = currentHour === pmHour + 3;

        if (!isAMTime && !isPMTime && !isAMFollowup && !isPMFollowup) continue;

        const window = (isAMTime || isAMFollowup) ? "AM" : "PM";
        const isFollowup = isAMFollowup || isPMFollowup;
        const nudgeType = isFollowup ? `dose_followup_${window}_${today}` : `dose_${window}_${today}`;

        // ── DEDUPLICATION: check if we already sent this exact nudge today ──
        const { data: existingNudge } = await supabase
          .from("nudge_log")
          .select("id")
          .eq("user_id", userId)
          .eq("nudge_type", nudgeType)
          .limit(1)
          .maybeSingle();

        if (existingNudge) {
          console.log(`Skipping ${nudgeType} for ${userId}: already sent`);
          continue;
        }

        // Get user email
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        const userEmail = authUser?.user?.email;
        if (!userEmail && profile.notify_email) continue;

        // Build ALL items for the day — mirrors dashboard TodaysPlan exactly
        // AM reminder shows full daily plan; PM reminder shows PM items + incomplete AM catch-up
        const allPeptideReminders: PeptideReminder[] = [];
        const allSupplementReminders: SupplementReminder[] = [];
        const seenSupplements = new Set<string>();

        for (const prot of userProts) {
          // Check protocol is active on this date — mirrors dashboard isActiveOnDate
          if (prot.start_date && prot.start_date > today) continue;
          if (prot.end_date && prot.end_date < today) continue;

          const { data: peptides } = await supabase
            .from("protocol_peptides")
            .select("peptide_name, dose_mcg, timing, frequency")
            .eq("protocol_id", prot.id);

          if (peptides) {
            for (const pep of peptides) {
              const isDue = checkFrequencyDue(pep.frequency, today, prot.start_date);
              if (!isDue) continue;

              const timing = (pep.timing || "AM").toUpperCase();
              const addPeptide = (w: "AM" | "PM") => {
                allPeptideReminders.push({
                  peptide_name: pep.peptide_name,
                  dose_mcg: pep.dose_mcg,
                  timing: pep.timing || "AM",
                  protocol_name: prot.name,
                  doseWindow: w,
                });
              };

              let matched = false;
              if (timing.includes("AM") || timing === "BOTH") { addPeptide("AM"); matched = true; }
              if (timing.includes("PM") || timing.includes("BED") || timing === "BOTH") { addPeptide("PM"); matched = true; }
              if (!matched) addPeptide("AM"); // default
            }
          }

          if (Array.isArray(prot.supplements)) {
            for (const supp of prot.supplements as Array<{ name: string; dose: string; frequency: string; timing?: string }>) {
              if (!supp.name) continue;

              const normName = normaliseSupplementName(supp.name);
              const suppTiming = resolveSupplementTimingEdge(supp);

              // Check frequency — mirrors dashboard isFrequencyDueOnDate
              const isDue = checkSupplementFrequencyDue(supp.frequency, today, prot.start_date);
              if (!isDue) continue;

              if (suppTiming === "AM+PM" || suppTiming === "AM/PM" || suppTiming === "BOTH") {
                const amKey = `${normName.toLowerCase()}::AM`;
                const pmKey = `${normName.toLowerCase()}::PM`;
                if (!seenSupplements.has(amKey)) {
                  seenSupplements.add(amKey);
                  allSupplementReminders.push({ name: normName, dose: supp.dose || "", frequency: supp.frequency || "daily", protocol_name: prot.name, doseWindow: "AM" });
                }
                if (!seenSupplements.has(pmKey)) {
                  seenSupplements.add(pmKey);
                  allSupplementReminders.push({ name: normName, dose: supp.dose || "", frequency: supp.frequency || "daily", protocol_name: prot.name, doseWindow: "PM" });
                }
              } else {
                const w: "AM" | "PM" = suppTiming === "PM" ? "PM" : "AM";
                const key = `${normName.toLowerCase()}::${w}`;
                if (!seenSupplements.has(key)) {
                  seenSupplements.add(key);
                  allSupplementReminders.push({ name: normName, dose: supp.dose || "", frequency: supp.frequency || "daily", protocol_name: prot.name, doseWindow: w });
                }
              }
            }
          }
        }

        console.log(`User ${userId}: ${allPeptideReminders.length} peptides, ${allSupplementReminders.length} supplements across ${userProts.length} protocols. Seen keys: ${Array.from(seenSupplements).join(', ')}`);

        // Determine which items to include based on window
        let reminders: PeptideReminder[];
        let supplementReminders: SupplementReminder[];

        if (window === "AM") {
          // AM: show ALL items for the day (matches dashboard total)
          reminders = allPeptideReminders;
          supplementReminders = allSupplementReminders;
        } else {
          // PM: show PM items + catch-up for any incomplete AM items
          reminders = allPeptideReminders.filter(r => r.doseWindow === "PM");
          supplementReminders = allSupplementReminders.filter(s => s.doseWindow === "PM");

          // Check for incomplete AM items as catch-up
          const { data: todayInjections } = await supabase
            .from("injection_logs")
            .select("peptide_name, status")
            .eq("user_id", userId)
            .gte("scheduled_time", `${today}T00:00:00`)
            .lte("scheduled_time", `${today}T23:59:59`);

          const completedPeptides = new Set(
            (todayInjections || []).filter((l: any) => l.status === "completed").map((l: any) => l.peptide_name)
          );

          // Add incomplete AM peptides
          for (const pep of allPeptideReminders.filter(r => r.doseWindow === "AM")) {
            if (!completedPeptides.has(pep.peptide_name)) {
              reminders.push({ ...pep, doseWindow: "AM" });
            }
          }

          // Check incomplete AM supplements
          const { data: todaySuppLogs } = await supabase
            .from("supplement_logs")
            .select("item")
            .eq("user_id", userId)
            .eq("date", today)
            .eq("completed", true);

          const completedSupps = new Set(
            (todaySuppLogs || []).map((l: any) => (l.item || "").toLowerCase())
          );

          for (const supp of allSupplementReminders.filter(s => s.doseWindow === "AM")) {
            const key = `${supp.name.toLowerCase()}::AM`;
            if (!completedSupps.has(key)) {
              supplementReminders.push({ ...supp, doseWindow: "AM" });
            }
          }

          if (reminders.length === 0 && supplementReminders.length === 0) {
            console.log(`PM window for ${userId}: all AM items done, no PM items`);
          }
        }

        if (reminders.length === 0 && supplementReminders.length === 0) continue;

        // ── FOLLOW-UP PHASE: only send if doses are still incomplete ──
        if (isFollowup) {
          const { data: completedLogs } = await supabase
            .from("injection_logs")
            .select("id")
            .eq("user_id", userId)
            .eq("status", "completed")
            .gte("scheduled_time", `${today}T00:00:00`)
            .lte("scheduled_time", `${today}T23:59:59`);

          const completedCount = completedLogs?.length || 0;
          const totalDue = reminders.length;

          // Also check supplement logs
          const { data: completedSuppLogs } = await supabase
            .from("supplement_logs")
            .select("id")
            .eq("user_id", userId)
            .eq("date", today)
            .eq("completed", true);

          const suppCompletedCount = completedSuppLogs?.length || 0;
          const totalSuppDue = supplementReminders.length;

          const allPeptidesDone = completedCount >= totalDue;
          const allSuppsDone = suppCompletedCount >= totalSuppDue;

          if (allPeptidesDone && allSuppsDone) {
            console.log(`Follow-up skipped for ${userId}: all doses complete`);
            continue;
          }

          // Filter down to only incomplete items
          const incompletePeptideNames = new Set<string>();
          if (!allPeptidesDone) {
            const { data: todayLogs } = await supabase
              .from("injection_logs")
              .select("peptide_name")
              .eq("user_id", userId)
              .eq("status", "completed")
              .gte("scheduled_time", `${today}T00:00:00`)
              .lte("scheduled_time", `${today}T23:59:59`);

            const donePeptides = new Set((todayLogs || []).map((l: any) => l.peptide_name));
            for (const r of reminders) {
              if (!donePeptides.has(r.peptide_name)) incompletePeptideNames.add(r.peptide_name);
            }
          }

          const incompleteReminders = reminders.filter(r => incompletePeptideNames.has(r.peptide_name));
          const incompleteSuppReminders = allSuppsDone ? [] : supplementReminders;

          if (incompleteReminders.length === 0 && incompleteSuppReminders.length === 0) continue;

          // Send follow-up with different messaging
          let emailSent = false;
          let pushSent = false;

          const totalMissing = incompleteReminders.length + incompleteSuppReminders.length;

          // Push notification (follow-up)
          if (onesignalApiKey) {
            try {
              const pushRes = await fetch("https://onesignal.com/api/v1/notifications", {
                method: "POST",
                headers: {
                  Authorization: `Basic ${onesignalApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  app_id: onesignalAppId,
                  include_aliases: { external_id: [userId] },
                  target_channel: "push",
                  headings: { en: `⚠️ ${totalMissing} dose${totalMissing > 1 ? "s" : ""} still incomplete` },
                  contents: { en: `You haven't logged ${totalMissing > 1 ? "some" : "your"} ${window} doses yet. Tap to complete now.` },
                  url: "https://peptyl.co.uk/dashboard",
                  chrome_web_icon: "https://peptyl.co.uk/icon-192.png",
                  chrome_web_badge: "https://peptyl.co.uk/favicon.png",
                  priority: 10,
                  ios_interruption_level: "time-sensitive",
                  ios_relevance_score: 1.0,
                  ttl: 3600,
                  web_buttons: [
                    { id: "log-dose", text: "✅ Log Now", url: "https://peptyl.co.uk/dashboard" },
                  ],
                  collapse_id: `dose_followup_${window}_${today}`,
                }),
              });
              const pushData = await pushRes.json();
              pushSent = pushRes.ok && pushData.recipients > 0;
              console.log(`Follow-up push to ${userId}: ${pushSent ? "sent" : "no recipients"}`);
            } catch (e) {
              console.error("Follow-up push error:", e);
            }
          }

          // Email (follow-up)
          if (profile.notify_email && resendApiKey && userEmail) {
            try {
              const emailHtml = buildFollowupEmail(incompleteReminders, incompleteSuppReminders, window, today);
              const emailRes = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${resendApiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: "Peptyl <reminders@peptyl.co.uk>",
                  to: [userEmail],
                  subject: `⚠️ ${totalMissing} dose${totalMissing > 1 ? "s" : ""} still need logging`,
                  html: emailHtml,
                }),
              });
              emailSent = emailRes.ok;
              if (!emailRes.ok) {
                const body = await emailRes.text();
                console.error(`Follow-up email error: ${body}`);
              }
            } catch (e) {
              console.error("Follow-up email error:", e);
            }
          }

          // Log the follow-up nudge with delivery status
          await supabase.from("nudge_log").insert({
            user_id: userId,
            nudge_type: nudgeType,
            email_sent: emailSent,
            push_sent: pushSent,
            error_message: null,
          } as any);

          results.push({
            user_id: userId,
            phase: "followup",
            email_sent: emailSent,
            push_sent: pushSent,
            peptides_count: incompleteReminders.length,
            supplements_count: incompleteSuppReminders.length,
          });

          continue; // don't also send initial
        }

        // ── INITIAL REMINDER PHASE ──
        let emailSent = false;
        let pushSent = false;
        let errorMsg: string | undefined;

        // Send email via Resend
        if (profile.notify_email && resendApiKey && userEmail) {
          try {
            const emailHtml = buildReminderEmail(reminders, supplementReminders, window, today);
            const totalCount = reminders.length + supplementReminders.length;

            const emailRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "Peptyl <reminders@peptyl.co.uk>",
                to: [userEmail],
                subject: `⏰ Action Required: ${totalCount} item${totalCount > 1 ? "s" : ""} to complete on your dashboard`,
                html: emailHtml,
              }),
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
        }

        // Send push notification via OneSignal
        if (onesignalApiKey) {
          try {
            const pushMessage = buildPushMessage(reminders, supplementReminders, window);
            const totalCount = reminders.length + supplementReminders.length;
            const pushRes = await fetch("https://onesignal.com/api/v1/notifications", {
              method: "POST",
              headers: {
                Authorization: `Basic ${onesignalApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                app_id: onesignalAppId,
                include_aliases: { external_id: [userId] },
                target_channel: "push",
                headings: { en: pushMessage.title },
                contents: { en: pushMessage.body },
                url: "https://peptyl.co.uk/dashboard",
                chrome_web_icon: "https://peptyl.co.uk/icon-192.png",
                chrome_web_badge: "https://peptyl.co.uk/favicon.png",
                priority: 10,
                ios_interruption_level: "time-sensitive",
                ios_relevance_score: 1.0,
                ios_badge_type: "SetTo",
                ios_badge_count: totalCount,
                ttl: 3600,
                web_buttons: [
                  { id: "log-dose", text: "✅ Log Doses", url: "https://peptyl.co.uk/dashboard" },
                  { id: "snooze", text: "⏰ Remind Later", url: "https://peptyl.co.uk/dashboard?snooze=true" },
                ],
                android_group: "peptyl_dose_reminders",
                thread_id: "peptyl_dose_reminders",
                summary_arg: `${totalCount} items due`,
                collapse_id: `dose_${window}_${today}`,
              }),
            });
            const pushData = await pushRes.json();
            pushSent = pushRes.ok && pushData.recipients > 0;
            console.log(`Push to ${userId}: ${pushSent ? "sent" : "no recipients"}`, pushData);
          } catch (pushErr) {
            console.error("OneSignal push error:", pushErr);
          }
        }

        // Log initial nudge to prevent re-send (with delivery status + content for debugging)
        const contentSummary = [
          ...reminders.map(r => `💉 ${r.peptide_name} ${r.dose_mcg}mcg [${r.doseWindow}] (${r.protocol_name})`),
          ...supplementReminders.map(s => `💊 ${s.name} ${s.dose} [${s.doseWindow}] (${s.protocol_name})`),
        ].join(" | ");
        await supabase.from("nudge_log").insert({
          user_id: userId,
          nudge_type: nudgeType,
          email_sent: emailSent,
          push_sent: pushSent,
          error_message: errorMsg || null,
          message_content: contentSummary.slice(0, 1000),
        } as any);

        results.push({
          user_id: userId,
          phase: "initial",
          email_sent: emailSent,
          push_sent: pushSent,
          peptides_count: reminders.length,
          supplements_count: supplementReminders.length,
          ...(errorMsg ? { error: errorMsg } : {}),
        });
      }
    }

    // ── WEEK 10 RETEST NUDGE BLOCK (runs regardless of window) ──
    const nudgeResults: Array<{ user_id: string; protocol: string; push: boolean; email: boolean }> = [];

    const { data: nudgeProtocols } = await supabase
      .from("protocols")
      .select("id, name, user_id, start_date, goal")
      .eq("status", "active")
      .gte("start_date", new Date(Date.now() - 71 * 86400000).toISOString().split("T")[0])
      .lte("start_date", new Date(Date.now() - 69 * 86400000).toISOString().split("T")[0]);

    if (nudgeProtocols && nudgeProtocols.length > 0) {
      for (const np of nudgeProtocols) {
        const { data: existingRetest } = await supabase
          .from("bloodwork_panels")
          .select("id")
          .eq("protocol_id", np.id)
          .like("panel_type", "retest%")
          .limit(1)
          .maybeSingle();
        if (existingRetest) continue;

        const { data: existingNudge } = await supabase
          .from("nudge_log")
          .select("id")
          .eq("protocol_id", np.id)
          .eq("nudge_type", "week_10")
          .limit(1)
          .maybeSingle();
        if (existingNudge) continue;

        const { data: nudgeUser } = await supabase.auth.admin.getUserById(np.user_id);
        const nudgeEmail = nudgeUser?.user?.email;
        let pushOk = false;
        let emailOk = false;

        if (onesignalApiKey) {
          try {
            const retestUrl = `https://peptyl.co.uk/dashboard?tab=bloodwork&retest=true&protocolId=${np.id}`;
            const pushRes = await fetch("https://onesignal.com/api/v1/notifications", {
              method: "POST",
              headers: {
                Authorization: `Basic ${onesignalApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                app_id: onesignalAppId,
                include_aliases: { external_id: [np.user_id] },
                target_channel: "push",
                headings: { en: "🔬 Time to retest your bloods" },
                contents: { en: `${np.name} — 10 weeks in. Book a follow-up test to see your results.` },
                url: retestUrl,
                chrome_web_icon: "https://peptyl.co.uk/icon-192.png",
                chrome_web_badge: "https://peptyl.co.uk/favicon.png",
                priority: 10,
                ios_interruption_level: "time-sensitive",
                ios_relevance_score: 0.9,
                ttl: 86400,
                web_buttons: [
                  { id: "book-test", text: "📊 Book Retest", url: retestUrl },
                ],
                collapse_id: `retest_${np.id}`,
              }),
            });
            const pushData = await pushRes.json();
            pushOk = pushRes.ok && pushData.recipients > 0;
          } catch (e) {
            console.error("Nudge push error:", e);
          }
        }

        if (resendApiKey && nudgeEmail) {
          try {
            const ctaUrl = `https://peptyl.co.uk/dashboard?tab=bloodwork&retest=true&protocolId=${np.id}`;
            const nudgeHtml = `
              <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;background:#ffffff">
                <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:28px 24px;text-align:center;border-radius:12px 12px 0 0">
                  <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:700">🔬 Week 10 — Time to Retest</h1>
                </div>
                <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
                  <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px">
                    You started <strong>${np.name}</strong> 10 weeks ago. Now's the time to see what changed.
                  </p>
                  <div style="background:#f0fdfa;border-left:4px solid #0d9488;padding:14px 16px;border-radius:6px;margin:0 0 20px">
                    <p style="margin:0;font-size:13px;color:#0f766e;font-weight:600">Key markers to retest:</p>
                    <p style="margin:6px 0 0;font-size:13px;color:#374151">Homocysteine, Vitamin D, hsCRP, LDL, Full Blood Count</p>
                  </div>
                  <div style="text-align:center;margin:24px 0 8px">
                    <a href="${ctaUrl}" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px">
                      📊 Log My Retest
                    </a>
                  </div>
                </div>
                <div style="padding:20px 24px;text-align:center">
                  <p style="font-size:11px;color:#9ca3af;margin:0;line-height:1.6">
                    This is an automated reminder from Peptyl. For educational and research purposes only.
                    <br/>Manage preferences in your <a href="https://peptyl.co.uk/dashboard" style="color:#0d9488;text-decoration:underline">dashboard</a>.
                  </p>
                </div>
              </div>`;

            const emailRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "Peptyl <reminders@peptyl.co.uk>",
                to: [nudgeEmail],
                subject: `Week 10 — time to see if ${np.name} worked`,
                html: nudgeHtml,
              }),
            });
            emailOk = emailRes.ok;
          } catch (e) {
            console.error("Nudge email error:", e);
          }
        }

        await supabase.from("nudge_log").insert({
          user_id: np.user_id,
          protocol_id: np.id,
          nudge_type: "week_10",
        });

        nudgeResults.push({ user_id: np.user_id, protocol: np.name, push: pushOk, email: emailOk });
      }
    }

    // ── RESULTS READY NOTIFICATION BLOCK ──
    const resultsReadyResults: Array<{ user_id: string; protocol: string; push: boolean; email: boolean; whatsapp: boolean }> = [];

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data: completedOutcomes } = await supabase
      .from("outcome_records")
      .select("id, user_id, protocol_id, dna_report_id, outcome_markers, updated_at")
      .eq("status", "completed")
      .gte("updated_at", twoHoursAgo);

    if (completedOutcomes && completedOutcomes.length > 0) {
      for (const outcome of completedOutcomes) {
        const { data: existingNudge } = await supabase
          .from("nudge_log")
          .select("id")
          .eq("protocol_id", outcome.protocol_id)
          .eq("nudge_type", "results_ready")
          .limit(1)
          .maybeSingle();
        if (existingNudge) continue;

        const { data: protocol } = await supabase
          .from("protocols")
          .select("name")
          .eq("id", outcome.protocol_id)
          .single();
        if (!protocol) continue;

        const protocolName = protocol.name;
        const reportId = outcome.dna_report_id;
        const reportUrl = reportId
          ? `https://peptyl.co.uk/dna/report/${reportId}`
          : "https://peptyl.co.uk/dashboard";

        const topResult = extractTopResult(outcome.outcome_markers as Record<string, any> | null);

        const { data: authUser } = await supabase.auth.admin.getUserById(outcome.user_id);
        const userEmail = authUser?.user?.email;

        const { data: profile } = await supabase
          .from("profiles")
          .select("notify_email, notify_whatsapp, whatsapp_number, whatsapp_verified")
          .eq("user_id", outcome.user_id)
          .single();

        let pushOk = false;
        let emailOk = false;
        let whatsappOk = false;

        if (onesignalApiKey) {
          try {
            const pushBody = topResult
              ? `${protocolName} — ${topResult}. View your DNA report.`
              : `${protocolName} — your analysis is complete. View your DNA report.`;

            const pushRes = await fetch("https://onesignal.com/api/v1/notifications", {
              method: "POST",
              headers: {
                Authorization: `Basic ${onesignalApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                app_id: onesignalAppId,
                include_aliases: { external_id: [outcome.user_id] },
                target_channel: "push",
                headings: { en: "🧬 Your results are ready" },
                contents: { en: pushBody },
                url: reportUrl,
                chrome_web_icon: "https://peptyl.co.uk/icon-192.png",
                chrome_web_badge: "https://peptyl.co.uk/favicon.png",
                priority: 10,
                ios_interruption_level: "time-sensitive",
                ios_relevance_score: 1.0,
                ios_badge_type: "Increase",
                ios_badge_count: 1,
                ttl: 86400,
                web_buttons: [
                  { id: "view-results", text: "📊 View Results", url: reportUrl },
                ],
                collapse_id: `results_${outcome.id}`,
              }),
            });
            const pushData = await pushRes.json();
            pushOk = pushRes.ok && pushData.recipients > 0;
          } catch (e) {
            console.error("Results push error:", e);
          }
        }

        if (profile?.notify_whatsapp && profile?.whatsapp_verified && whatsappToken && whatsappPhoneNumberId && profile.whatsapp_number) {
          const formattedWa = formatWhatsAppNumber(profile.whatsapp_number);
          if (formattedWa) {
            try {
              const waLines = [
                `🧬 *Your Results Are Ready*`,
                `━━━━━━━━━━━━━━━━`,
                `You completed *${protocolName}*.`,
                ``,
              ];
              if (topResult) {
                waLines.push(`Top result: *${topResult}*`);
                waLines.push(``);
              }
              waLines.push(`View your full analysis:`);
              waLines.push(reportUrl);

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
                    to: formattedWa,
                    type: "text",
                    text: { body: waLines.join("\n") },
                  }),
                }
              );
              whatsappOk = waRes.ok;
            } catch (e) {
              console.error("Results WhatsApp error:", e);
            }
          }
        }

        if (profile?.notify_email && resendApiKey && userEmail) {
          try {
            const resultHighlight = topResult
              ? `<div style="background:#f0fdfa;border-left:4px solid #0d9488;padding:14px 16px;border-radius:6px;margin:0 0 20px">
                   <p style="margin:0;font-size:13px;color:#0f766e;font-weight:600">Top result:</p>
                   <p style="margin:6px 0 0;font-size:15px;color:#374151;font-weight:700">${topResult}</p>
                 </div>`
              : "";

            const resultsHtml = `
              <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;background:#ffffff">
                <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:28px 24px;text-align:center;border-radius:12px 12px 0 0">
                  <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:700">🧬 Your Results Are Ready</h1>
                </div>
                <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
                  <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px">
                    You completed <strong>${protocolName}</strong>. Your full analysis is ready to view.
                  </p>
                  ${resultHighlight}
                  <div style="text-align:center;margin:24px 0 8px">
                    <a href="${reportUrl}" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px">
                      📊 View Your Results
                    </a>
                  </div>
                </div>
                <div style="padding:20px 24px;text-align:center">
                  <p style="font-size:11px;color:#9ca3af;margin:0;line-height:1.6">
                    This is an automated notification from Peptyl. For educational and research purposes only.
                    <br/>Manage preferences in your <a href="https://peptyl.co.uk/dashboard" style="color:#0d9488;text-decoration:underline">dashboard</a>.
                  </p>
                </div>
              </div>`;

            const emailRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "Peptyl <reminders@peptyl.co.uk>",
                to: [userEmail],
                subject: `Your ${protocolName} results are ready`,
                html: resultsHtml,
              }),
            });
            emailOk = emailRes.ok;
          } catch (e) {
            console.error("Results email error:", e);
          }
        }

        await supabase.from("nudge_log").insert({
          user_id: outcome.user_id,
          protocol_id: outcome.protocol_id,
          nudge_type: "results_ready",
        });

        resultsReadyResults.push({
          user_id: outcome.user_id,
          protocol: protocolName,
          push: pushOk,
          email: emailOk,
          whatsapp: whatsappOk,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: results.length,
        nudges_sent: nudgeResults.length,
        results_ready_sent: resultsReadyResults.length,
        details: results,
        nudge_details: nudgeResults,
        results_ready_details: resultsReadyResults,
      }),
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

// ── Helpers ──

function extractTopResult(markers: Record<string, any> | null): string | null {
  if (!markers || typeof markers !== "object") return null;
  let topMarker = "";
  let topPct = 0;
  for (const [key, val] of Object.entries(markers)) {
    if (val && typeof val === "object" && "pct_change" in val) {
      const pct = Math.abs(Number(val.pct_change) || 0);
      if (pct > topPct) { topPct = pct; topMarker = key; }
    }
  }
  if (!topMarker || topPct === 0) return null;
  const markerVal = markers[topMarker];
  const direction = Number(markerVal.pct_change) > 0 ? "improved" : "changed";
  const name = topMarker.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  return `${name} ${direction} ${Math.round(topPct)}%`;
}

/** Mirrors dashboard isFrequencyDueOnDate — uses protocol start_date for EOD/weekly alignment */
function checkFrequencyDue(frequency: string, todayStr: string, startDate?: string): boolean {
  const today = new Date(`${todayStr}T12:00:00`);
  const dayOfWeek = today.getDay();
  const start = startDate ? new Date(`${startDate}T12:00:00`) : today;
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceStart < 0) return false;

  const f = frequency.toLowerCase();
  if (f === "daily" || f.includes("daily") || f === "morning" || f === "evening"
    || f.includes("with meals") || f.includes("fasted") || f.includes("with fat")
    || f.includes("before bed") || f.includes("before exercise") || f.includes("split")) return true;
  if (f === "twice daily" || f.includes("twice") || f.includes("2x/day")) return true;
  if (f === "weekly" || f.includes("1x")) return daysSinceStart % 7 === 0;
  if (f.includes("2x")) return dayOfWeek === 1 || dayOfWeek === 4;
  if (f.includes("3x")) return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
  if (f === "5on/2off") return dayOfWeek >= 1 && dayOfWeek <= 5;
  if (f === "eod" || f.includes("every other")) return daysSinceStart % 2 === 0;
  return true;
}

/** Supplement frequency check — mirrors dashboard logic */
function checkSupplementFrequencyDue(frequency: string, todayStr: string, startDate?: string): boolean {
  return checkFrequencyDue(frequency || "daily", todayStr, startDate);
}

/** Normalise supplement names — mirrors src/lib/supplement-normalise.ts EXACTLY */
const SUPP_ALIASES: Record<string, string> = {
  "omega-3 fish oil": "Omega-3 (EPA/DHA)",
  "omega 3 fish oil": "Omega-3 (EPA/DHA)",
  "omega-3": "Omega-3 (EPA/DHA)",
  "omega 3": "Omega-3 (EPA/DHA)",
  "omega-3 (epa/dha)": "Omega-3 (EPA/DHA)",
  "fish oil": "Omega-3 (EPA/DHA)",
  "epa/dha": "Omega-3 (EPA/DHA)",
  "epa dha": "Omega-3 (EPA/DHA)",
  "omega-3 fish oil 3000mg epa/dha": "Omega-3 (EPA/DHA)",
  "coq10": "CoQ10",
  "coq10 (ubiquinol)": "CoQ10 (Ubiquinol)",
  "ubiquinol": "CoQ10 (Ubiquinol)",
  "vitamin d": "Vitamin D3 + K2",
  "vitamin d3": "Vitamin D3 + K2",
  "vit d3": "Vitamin D3 + K2",
  "vitamin d3 + k2": "Vitamin D3 + K2",
  "mag glycinate": "Magnesium Glycinate",
  "magnesium": "Magnesium Glycinate",
  "magnesium glycinate": "Magnesium Glycinate",
  "vitamin c": "Vitamin C",
  "vit c": "Vitamin C",
  "berberine": "Berberine HCl",
  "berberine hcl": "Berberine HCl",
  "zinc": "Zinc",
};

function normaliseSupplementName(name: string): string {
  const trimmed = name.trim();
  return SUPP_ALIASES[trimmed.toLowerCase()] ?? trimmed;
}

/** Resolve supplement timing — mirrors dashboard resolveSupplementTiming EXACTLY */
function resolveSupplementTimingEdge(supp: { timing?: string; frequency?: string }): string {
  const rawTiming = (supp.timing || "").trim().toLowerCase();
  if (rawTiming) {
    if ((rawTiming.includes("am") && rawTiming.includes("pm")) || rawTiming.includes("both") || rawTiming.includes("split")) {
      return "AM+PM";
    }
    if (rawTiming.includes("pm") || rawTiming.includes("bed") || rawTiming.includes("evening") || rawTiming.includes("night")) {
      return "PM";
    }
    if (rawTiming.includes("noon") || rawTiming.includes("midday") || rawTiming.includes("lunch")) {
      return "AM"; // Noon items show in AM window on email
    }
    return "AM";
  }

  const freq = (supp.frequency || "").toLowerCase();
  if (freq.includes("split") || freq.includes("am/pm") || freq.includes("twice") || freq.includes("2x/day") || freq.includes("twice daily")) return "AM+PM";
  if (freq.includes("morning") || freq.includes("fasted")) return "AM";
  if (freq.includes("bed") || freq.includes("evening") || freq.includes("night")) return "PM";
  if (freq.includes("with meals")) return "AM+PM";
  return "AM";
}

function formatWhatsAppNumber(raw: string): string | null {
  let n = raw.replace(/[\s\-\(\)\.]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  if (n.startsWith("07")) n = "44" + n.slice(1);
  if (n.startsWith("00")) n = n.slice(2);
  if (!/^\d{10,15}$/.test(n)) return null;
  if (n.startsWith("0")) return null;
  return n;
}

function buildPushMessage(
  reminders: PeptideReminder[],
  supplements: SupplementReminder[],
  window: string
): { title: string; body: string } {
  const totalCount = reminders.length + supplements.length;
  const title = `⏰ ${window} Protocol — ${totalCount} item${totalCount > 1 ? "s" : ""} due`;
  const items: string[] = [];
  for (const r of reminders) items.push(`💉 ${r.peptide_name} ${r.dose_mcg}mcg`);
  for (const s of supplements) items.push(`💊 ${s.name} ${s.dose}`);
  const body = items.slice(0, 3).join(", ") + (items.length > 3 ? ` +${items.length - 3} more` : "") + " — tap to log";
  return { title, body };
}

function buildReminderEmail(
  reminders: PeptideReminder[],
  supplements: SupplementReminder[],
  window: string,
  date: string
): string {
  const totalCount = reminders.length + supplements.length;

  // Group by protocol — mirrors dashboard layout
  const protocolGroups = new Map<string, { peptides: PeptideReminder[]; supps: SupplementReminder[] }>();
  for (const r of reminders) {
    if (!protocolGroups.has(r.protocol_name)) protocolGroups.set(r.protocol_name, { peptides: [], supps: [] });
    protocolGroups.get(r.protocol_name)!.peptides.push(r);
  }
  for (const s of supplements) {
    if (!protocolGroups.has(s.protocol_name)) protocolGroups.set(s.protocol_name, { peptides: [], supps: [] });
    protocolGroups.get(s.protocol_name)!.supps.push(s);
  }

  const renderItem = (icon: string, name: string, dose: string, w: string) =>
    `<tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;vertical-align:middle">
        <span style="display:inline-block;width:22px;text-align:center;font-size:15px">${icon}</span>
        <strong style="color:#111827;font-size:13px;margin-left:4px">${name}</strong>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;font-weight:500">${dose}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6">
        <span style="display:inline-block;background:${w === "AM" ? "#dbeafe" : "#ede9fe"};color:${w === "AM" ? "#1d4ed8" : "#7c3aed"};font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px">${w}</span>
      </td>
    </tr>`;

  let protocolSections = "";
  for (const [protName, items] of protocolGroups) {
    const count = items.peptides.length + items.supps.length;
    const rows = [
      ...items.peptides.sort((a, b) => a.doseWindow === b.doseWindow ? 0 : a.doseWindow === "AM" ? -1 : 1)
        .map(r => renderItem("💉", r.peptide_name, `${r.dose_mcg}mcg`, r.doseWindow)),
      ...items.supps.sort((a, b) => a.doseWindow === b.doseWindow ? 0 : a.doseWindow === "AM" ? -1 : 1)
        .map(s => renderItem("💊", s.name, s.dose, s.doseWindow)),
    ].join("");

    protocolSections += `
      <div style="margin-bottom:16px">
        <div style="margin-bottom:8px">
          <span style="font-size:13px;font-weight:700;color:#111827">🧬 ${protName}</span>
          <span style="font-size:11px;color:#6b7280;font-weight:400;margin-left:8px">${count} item${count > 1 ? "s" : ""}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
          <thead><tr style="background:#f9fafb">
            <th style="padding:8px 14px;text-align:left;font-weight:600;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Item</th>
            <th style="padding:8px 14px;text-align:left;font-weight:600;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Dose</th>
            <th style="padding:8px 14px;text-align:left;font-weight:600;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Window</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  const amCount = reminders.filter(r => r.doseWindow === "AM").length + supplements.filter(s => s.doseWindow === "AM").length;
  const pmCount = reminders.filter(r => r.doseWindow === "PM").length + supplements.filter(s => s.doseWindow === "PM").length;
  const windowSummary = [amCount > 0 ? `${amCount} AM` : "", pmCount > 0 ? `${pmCount} PM` : ""].filter(Boolean).join(" · ");

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:0;background:#ffffff">
      <div style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:24px 24px 20px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:700">Today's Plan</h1>
        <p style="color:#d1fae5;font-size:13px;margin:6px 0 0">
          <strong style="color:#ffffff">${totalCount} item${totalCount > 1 ? "s" : ""}</strong> to complete · ${windowSummary}
        </p>
      </div>
      <div style="padding:20px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        ${protocolSections}
        <div style="text-align:center;margin:20px 0 8px">
          <a href="https://peptyl.co.uk/dashboard" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px">✅ Log Doses Now</a>
        </div>
        <p style="text-align:center;font-size:11px;color:#9ca3af;margin:8px 0 0">Log your doses to keep your streak going</p>
      </div>
      <div style="padding:16px 24px;text-align:center">
        <p style="font-size:10px;color:#9ca3af;margin:0;line-height:1.5">Peptyl — for educational and research purposes only.<br/>Manage notifications in your <a href="https://peptyl.co.uk/dashboard" style="color:#0d9488;text-decoration:underline">dashboard</a>.</p>
      </div>
    </div>`;
}

function buildFollowupEmail(
  reminders: PeptideReminder[],
  supplements: SupplementReminder[],
  window: string,
  date: string
): string {
  const totalCount = reminders.length + supplements.length;

  const itemList = [
    ...reminders.map(r => `<tr>
      <td style="padding:8px 14px;border-bottom:1px solid #fef3c7;vertical-align:middle">
        <span style="font-size:15px">💉</span>
        <strong style="color:#111827;font-size:13px;margin-left:4px">${r.peptide_name}</strong>
      </td>
      <td style="padding:8px 14px;border-bottom:1px solid #fef3c7;color:#374151;font-size:13px">${r.dose_mcg}mcg</td>
      <td style="padding:8px 14px;border-bottom:1px solid #fef3c7">
        <span style="display:inline-block;background:${r.doseWindow === "AM" ? "#dbeafe" : "#ede9fe"};color:${r.doseWindow === "AM" ? "#1d4ed8" : "#7c3aed"};font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px">${r.doseWindow}</span>
      </td>
    </tr>`),
    ...supplements.map(s => `<tr>
      <td style="padding:8px 14px;border-bottom:1px solid #fef3c7;vertical-align:middle">
        <span style="font-size:15px">💊</span>
        <strong style="color:#111827;font-size:13px;margin-left:4px">${s.name}</strong>
      </td>
      <td style="padding:8px 14px;border-bottom:1px solid #fef3c7;color:#374151;font-size:13px">${s.dose}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #fef3c7">
        <span style="display:inline-block;background:${s.doseWindow === "AM" ? "#dbeafe" : "#ede9fe"};color:${s.doseWindow === "AM" ? "#1d4ed8" : "#7c3aed"};font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px">${s.doseWindow}</span>
      </td>
    </tr>`),
  ].join("");

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:0;background:#ffffff">
      <div style="background:linear-gradient(135deg,#d97706,#b45309);padding:24px 24px 20px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:700">⚠️ ${totalCount} Dose${totalCount > 1 ? "s" : ""} Still Incomplete</h1>
        <p style="color:#fef3c7;font-size:13px;margin:6px 0 0">Don't break your streak — log now</p>
      </div>
      <div style="padding:20px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #fde68a;border-radius:8px;overflow:hidden;margin-bottom:20px">
          <thead><tr style="background:#fffbeb">
            <th style="padding:8px 14px;text-align:left;font-weight:600;color:#92400e;font-size:11px;text-transform:uppercase">Item</th>
            <th style="padding:8px 14px;text-align:left;font-weight:600;color:#92400e;font-size:11px;text-transform:uppercase">Dose</th>
            <th style="padding:8px 14px;text-align:left;font-weight:600;color:#92400e;font-size:11px;text-transform:uppercase">Window</th>
          </tr></thead>
          <tbody>${itemList}</tbody>
        </table>
        <div style="text-align:center;margin:20px 0 8px">
          <a href="https://peptyl.co.uk/dashboard" style="display:inline-block;background:#d97706;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px">✅ Complete Now</a>
        </div>
      </div>
      <div style="padding:16px 24px;text-align:center">
        <p style="font-size:10px;color:#9ca3af;margin:0;line-height:1.5">Peptyl — for educational and research purposes only.<br/>Manage notifications in your <a href="https://peptyl.co.uk/dashboard" style="color:#0d9488;text-decoration:underline">dashboard</a>.</p>
      </div>
    </div>`;
}
