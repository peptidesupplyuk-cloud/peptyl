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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const whatsappToken = Deno.env.get("WHATSAPP_TOKEN");
    const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    if (!whatsappToken || !whatsappPhoneNumberId) {
      return new Response(
        JSON.stringify({ error: "WhatsApp not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get the authenticated user from the Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { whatsapp_number } = await req.json();
    if (!whatsapp_number) {
      return new Response(
        JSON.stringify({ error: "WhatsApp number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format number
    const formatted = formatWhatsAppNumber(whatsapp_number);
    if (!formatted) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format. Please include country code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: check if code was sent in last 60 seconds
    const { data: profile } = await supabase
      .from("profiles")
      .select("whatsapp_verify_expires_at")
      .eq("user_id", user.id)
      .single();

    if (profile?.whatsapp_verify_expires_at) {
      const expiresAt = new Date(profile.whatsapp_verify_expires_at);
      // If expires_at is set and was created less than 60 seconds ago (expires_at - 9 minutes > now)
      const codeSentAt = new Date(expiresAt.getTime() - 10 * 60 * 1000);
      const secondsSinceSent = (Date.now() - codeSentAt.getTime()) / 1000;
      if (secondsSinceSent < 60) {
        return new Response(
          JSON.stringify({ error: "Please wait before requesting another code" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store code in profiles
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        whatsapp_number: whatsapp_number,
        whatsapp_verify_code: code,
        whatsapp_verify_expires_at: expiresAt,
      })
      .eq("user_id", user.id);

    if (updateErr) {
      console.error("Failed to store verification code:", updateErr);
      return new Response(
        JSON.stringify({ error: "Failed to store verification code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via WhatsApp
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
          to: formatted,
          type: "text",
          text: {
            body: `Your Peptyl verification code is: ${code}. Valid for 10 minutes.`,
          },
        }),
      }
    );

    const waData = await waRes.json();
    if (!waRes.ok) {
      console.error("WhatsApp API error:", waData);
      return new Response(
        JSON.stringify({ error: "Failed to send WhatsApp message. Please check your number." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Verification code sent to ${formatted}:`, waData);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Verification error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatWhatsAppNumber(raw: string): string | null {
  // Strip all non-digit chars except leading +
  let n = raw.replace(/[^\d+]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  if (n.startsWith("07") && n.length >= 10 && n.length <= 11) {
    // UK mobile: 07XXX XXXXXX → 447XXX XXXXXX
    n = "44" + n.slice(1);
  }
  if (n.startsWith("00")) n = n.slice(2); // international prefix
  if (!/^\d{10,15}$/.test(n)) return null;
  // Must start with a valid country code (1-3 digits), not 0
  if (n.startsWith("0")) return null;
  return n;
}
