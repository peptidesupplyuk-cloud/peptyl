import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const productConfig: Record<string, { amount: number; description: string; redirectPath: string }> = {
  dna_assessment: { amount: 2999, description: "Peptyl DNA Assessment", redirectPath: "/dna" },
  dna_standard: { amount: 999, description: "Peptyl DNA Standard Assessment", redirectPath: "/dna/upload?tier=standard" },
  dna_advanced: { amount: 2999, description: "Peptyl DNA Advanced Assessment", redirectPath: "/dna/upload?tier=advanced" },
  subscription_individual: { amount: 499, description: "Peptyl Individual Plan", redirectPath: "/dashboard" },
  subscription_coach: { amount: 4999, description: "Peptyl Coach Plan", redirectPath: "/dashboard" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    // Parse product from request body (default: dna_standard)
    let product = "dna_standard";
    try {
      const body = await req.json();
      if (body?.product) product = body.product;
    } catch { /* no body is fine */ }

    const config = productConfig[product];
    if (!config) {
      return new Response(JSON.stringify({ error: "Invalid product" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gcToken = Deno.env.get("GOCARDLESS_ACCESS_TOKEN");
    if (!gcToken) {
      return new Response(JSON.stringify({ error: "Payment not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create billing request
    const brRes = await fetch("https://api.gocardless.com/billing_requests", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${gcToken}`,
        "GoCardless-Version": "2015-07-06",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        billing_requests: {
          payment_request: {
            amount: config.amount,
            currency: "GBP",
            description: config.description,
            metadata: {
              user_id: userId,
              product,
            },
          },
        },
      }),
    });

    if (!brRes.ok) {
      const errBody = await brRes.text();
      console.error("GoCardless billing request error:", errBody);
      return new Response(JSON.stringify({ error: "Payment creation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const brData = await brRes.json();
    const billingRequestId = brData.billing_requests.id;

    // Create billing request flow
    const flowRes = await fetch("https://api.gocardless.com/billing_request_flows", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${gcToken}`,
        "GoCardless-Version": "2015-07-06",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        billing_request_flows: {
          redirect_uri: `https://peptyl.co.uk${config.redirectPath}`,
          links: {
            billing_request: billingRequestId,
          },
          prefilled_customer: {
            email: userEmail,
          },
        },
      }),
    });

    if (!flowRes.ok) {
      const errBody = await flowRes.text();
      console.error("GoCardless flow error:", errBody);
      return new Response(JSON.stringify({ error: "Payment flow creation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const flowData = await flowRes.json();
    const authorisationUrl = flowData.billing_request_flows.authorisation_url;

    return new Response(JSON.stringify({ authorisation_url: authorisationUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
