import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-signature",
};

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computed === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Always return 200 to prevent GoCardless retries
  const rawBody = await req.text();

  const webhookSecret = Deno.env.get("GOCARDLESS_WEBHOOK_SECRET");
  const gcToken = Deno.env.get("GOCARDLESS_ACCESS_TOKEN");

  if (!webhookSecret || !gcToken) {
    console.error("Missing GOCARDLESS_WEBHOOK_SECRET or GOCARDLESS_ACCESS_TOKEN");
    return new Response("OK", { status: 200, headers: corsHeaders });
  }

  // Verify signature
  const signature = req.headers.get("Webhook-Signature") || "";
  const valid = await verifySignature(rawBody, signature, webhookSecret);
  if (!valid) {
    console.error("Invalid webhook signature");
    return new Response("OK", { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("Invalid JSON body");
    return new Response("OK", { status: 200, headers: corsHeaders });
  }

  const events = payload.events || [];

  for (const event of events) {
    if (event.resource_type !== "payments" || event.action !== "confirmed") {
      continue;
    }

    const paymentId = event.links?.payment;
    if (!paymentId) continue;

    try {
      // Fetch payment details from GoCardless
      const paymentRes = await fetch(`https://api.gocardless.com/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${gcToken}`,
          "GoCardless-Version": "2015-07-06",
        },
      });

      if (!paymentRes.ok) {
        const errText = await paymentRes.text();
        console.error(`Failed to fetch payment ${paymentId}:`, errText);
        continue;
      }

      const paymentData = await paymentRes.json();
      const metadata = paymentData.payments?.metadata || {};
      const userId = metadata.user_id;
      const product = metadata.product;
      const amount = paymentData.payments?.amount;
      const currency = paymentData.payments?.currency;

      if (!userId || !product) {
        console.error(`Payment ${paymentId} missing user_id or product in metadata`);
        continue;
      }

      // Log the event
      await supabase.from("payment_events").insert({
        user_id: userId,
        product,
        event_type: "confirmed",
        payment_id: paymentId,
        gocardless_event_id: event.id,
        amount: amount ? Number(amount) : null,
        currency: currency || "GBP",
      } as any);

      // Update profile based on product
      if (product === "dna_assessment") {
        await supabase
          .from("profiles")
          .update({ dna_assessment_unlocked: true } as any)
          .eq("user_id", userId);
      } else if (product === "dna_standard") {
        await supabase
          .from("profiles")
          .update({ dna_standard_unlocked: true } as any)
          .eq("user_id", userId);
      } else if (product === "dna_advanced") {
        await supabase
          .from("profiles")
          .update({ dna_advanced_unlocked: true } as any)
          .eq("user_id", userId);
      } else if (product === "subscription_individual") {
        await supabase
          .from("profiles")
          .update({
            subscription_tier: "individual",
            subscription_start: new Date().toISOString(),
            subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          } as any)
          .eq("user_id", userId);
      } else if (product === "subscription_coach") {
        await supabase
          .from("profiles")
          .update({
            subscription_tier: "coach",
            subscription_start: new Date().toISOString(),
            subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          } as any)
          .eq("user_id", userId);
      }

      console.log(`Processed payment ${paymentId} for user ${userId}, product: ${product}`);
    } catch (err) {
      console.error(`Error processing payment ${paymentId}:`, err);
    }
  }

  return new Response("OK", { status: 200, headers: corsHeaders });
});
