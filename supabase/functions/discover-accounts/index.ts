import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEARCH_QUERIES = [
  "site:x.com peptide researcher scientist",
  "site:x.com BPC-157 TB-500 peptide therapy expert",
  "site:x.com semaglutide tirzepatide GLP-1 doctor",
  "site:x.com longevity biohacking peptides health optimization",
  "site:x.com peptide dosing reconstitution subcutaneous",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get existing handles to avoid duplicates
    const { data: existing } = await supabase
      .from("monitored_accounts")
      .select("handle");
    const existingHandles = new Set(
      (existing || []).map((a: any) => a.handle.toLowerCase())
    );

    const discoveredAccounts: { handle: string; source: string }[] = [];

    // Run searches in parallel (max 3 concurrent to be nice to the API)
    for (const query of SEARCH_QUERIES) {
      try {
        const resp = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, limit: 10 }),
        });

        if (!resp.ok) {
          console.error(`Search failed for "${query}":`, resp.status);
          continue;
        }

        const data = await resp.json();
        const results = data.data || [];

        for (const result of results) {
          const url: string = result.url || "";
          // Extract X handle from URL patterns like x.com/handle or twitter.com/handle
          const match = url.match(
            /(?:x\.com|twitter\.com)\/([A-Za-z0-9_]{1,15})(?:\/|$|\?)/
          );
          if (match) {
            const handle = match[1].toLowerCase();
            // Filter out generic pages
            if (
              !["home", "search", "explore", "settings", "i", "hashtag", "login", "signup"].includes(handle) &&
              !existingHandles.has(handle)
            ) {
              existingHandles.add(handle);
              discoveredAccounts.push({
                handle: match[1], // preserve original casing
                source: query,
              });
            }
          }
        }
      } catch (err) {
        console.error(`Search error for "${query}":`, err);
      }
    }

    if (discoveredAccounts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No new accounts found", discovered: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert discovered accounts (inactive by default so admin can review)
    const rows = discoveredAccounts.map((a) => ({
      handle: a.handle,
      is_active: false,
      platform: "twitter",
    }));

    const { error: insertErr } = await supabase
      .from("monitored_accounts")
      .insert(rows);

    if (insertErr) {
      console.error("Insert error:", insertErr);
      throw new Error(`Failed to insert accounts: ${insertErr.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        discovered: discoveredAccounts.length,
        accounts: discoveredAccounts.map((a) => a.handle),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("discover-accounts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
