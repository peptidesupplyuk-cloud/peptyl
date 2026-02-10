import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PEPTIDE_KEYWORDS = [
  "peptide", "bpc-157", "bpc157", "tb-500", "tb500", "semaglutide", "tirzepatide",
  "retatrutide", "ipamorelin", "cjc-1295", "cjc1295", "ghk-cu", "melanotan",
  "pt-141", "selank", "semax", "thymosin", "aod-9604", "mots-c", "LL-37",
  "ll37", "kpv", "dsip", "epitalon", "sermorelin", "tesamorelin", "hexarelin",
  "ghrp", "nad+", "survodutide", "cagrilintide", "glp-1", "glp1",
  "reconstitution", "subcutaneous", "peptide stack", "research chemical",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWITTER_BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN");
    if (!TWITTER_BEARER_TOKEN) throw new Error("TWITTER_BEARER_TOKEN not configured");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active monitored accounts, sorted by quality score (best first)
    const { data: accounts, error: accErr } = await supabase
      .from("monitored_accounts")
      .select("*")
      .eq("is_active", true)
      .eq("platform", "twitter")
      .order("quality_score", { ascending: false });

    if (accErr) throw new Error(`Failed to fetch accounts: ${accErr.message}`);
    if (!accounts || accounts.length === 0) {
      return new Response(JSON.stringify({ message: "No active accounts to scan", scanned: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (const account of accounts) {
      // Rate-limit: wait 1.5s between accounts to stay under Twitter API limits
      if (results.length > 0) await delay(1500);
      try {
        // Look up user ID from handle
        const userLookup = await fetch(
          `https://api.x.com/2/users/by/username/${account.handle.replace("@", "")}`,
          { headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` } }
        );

        if (!userLookup.ok) {
          console.error(`User lookup failed for ${account.handle}:`, userLookup.status);
          results.push({ handle: account.handle, status: "user_not_found" });
          continue;
        }

        const userData = await userLookup.json();
        const userId = userData.data?.id;
        if (!userId) {
          results.push({ handle: account.handle, status: "no_user_id" });
          continue;
        }

        // Fetch recent tweets (last 5 days max)
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
        const params = new URLSearchParams({
          max_results: "10",
          "tweet.fields": "created_at,text,public_metrics",
          exclude: "retweets",
          start_time: fiveDaysAgo,
        });
        if (account.last_tweet_id) {
          params.set("since_id", account.last_tweet_id);
        }

        const tweetsResp = await fetch(
          `https://api.x.com/2/users/${userId}/tweets?${params}`,
          { headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` } }
        );

        if (!tweetsResp.ok) {
          const errBody = await tweetsResp.text();
          console.error(`Tweets fetch failed for ${account.handle}:`, tweetsResp.status, errBody);
          results.push({ handle: account.handle, status: "tweets_fetch_failed", code: tweetsResp.status });
          continue;
        }

        const tweetsData = await tweetsResp.json();
        const tweets = tweetsData.data || [];

        if (tweets.length === 0) {
          results.push({ handle: account.handle, status: "no_new_tweets" });
          // Update last_scanned_at even if no new tweets
          await supabase.from("monitored_accounts").update({ last_scanned_at: new Date().toISOString() }).eq("id", account.id);
          continue;
        }

        // Filter for peptide-relevant tweets using base keywords + learned high-scoring keywords
        const { data: learnedKeywords } = await supabase
          .from("keyword_scores")
          .select("keyword")
          .gte("score", 40)
          .order("score", { ascending: false })
          .limit(50);
        
        const allKeywords = [
          ...PEPTIDE_KEYWORDS,
          ...(learnedKeywords || []).map((k: any) => k.keyword),
        ];
        const uniqueKeywords = [...new Set(allKeywords.map((k: string) => k.toLowerCase()))];

        const relevantTweets = tweets.filter((t: any) => {
          const lower = t.text.toLowerCase();
          return uniqueKeywords.some((kw) => lower.includes(kw));
        });

        if (relevantTweets.length > 0) {
          // Combine relevant tweets into one content block for ingestion
          const combinedContent = relevantTweets
            .map((t: any) => `[${t.created_at}] @${account.handle}: ${t.text}`)
            .join("\n\n---\n\n");

          // Queue for ingestion via the ingest-content pattern (direct DB insert + AI extraction)
          const { data: queueItem } = await supabase
            .from("content_queue")
            .insert({
              submitted_by: account.added_by || "00000000-0000-0000-0000-000000000000",
              content_type: "twitter",
              raw_input: combinedContent.slice(0, 50000),
              source_url: `https://x.com/${account.handle.replace("@", "")}`,
              processing_status: "processing",
            })
            .select("id")
            .single();

          // Find or create source for this account
          const sourceName = `X/@${account.handle.replace("@", "")}`;
          let sourceId: string | null = null;
          const { data: existingSource } = await supabase
            .from("sources")
            .select("id")
            .eq("name", sourceName)
            .maybeSingle();

          if (existingSource) {
            sourceId = existingSource.id;
          } else {
            const { data: newSource } = await supabase
              .from("sources")
              .insert({
                name: sourceName,
                url: `https://x.com/${account.handle.replace("@", "")}`,
                credibility: "community_verified",
              })
              .select("id")
              .single();
            sourceId = newSource?.id || null;
          }

          // AI extraction
          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                {
                  role: "system",
                  content: `You are a peptide research data extractor. Extract structured peptide data from these tweets by a peptide community account. Focus on actionable findings, dosing info, and safety notes. You MUST call the extract_peptide_data function.`,
                },
                { role: "user", content: `Extract peptide data from these tweets:\n\n${combinedContent}` },
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "extract_peptide_data",
                    description: "Extract structured peptide research data from tweets.",
                    parameters: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        summary: { type: "string" },
                        peptides_mentioned: { type: "array", items: { type: "string" } },
                        findings: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              peptide: { type: "string" },
                              finding: { type: "string" },
                              evidence_strength: { type: "string", enum: ["strong", "moderate", "weak", "anecdotal"] },
                            },
                            required: ["peptide", "finding", "evidence_strength"],
                            additionalProperties: false,
                          },
                        },
                        credibility_tier: {
                          type: "string",
                          enum: ["peer_reviewed", "clinical_trial", "expert_review", "established_media", "community_verified", "anecdotal"],
                        },
                      },
                      required: ["title", "summary", "peptides_mentioned", "findings", "credibility_tier"],
                      additionalProperties: false,
                    },
                  },
                },
              ],
              tool_choice: { type: "function", function: { name: "extract_peptide_data" } },
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall?.function?.arguments) {
              const extracted = JSON.parse(toolCall.function.arguments);

              // Create article with source_account_handle for learning
              const { data: article } = await supabase
                .from("articles")
                .insert({
                  source_id: sourceId,
                  source_account_handle: account.handle.replace("@", ""),
                  title: extracted.title || `X Digest: @${account.handle}`,
                  url: `https://x.com/${account.handle.replace("@", "")}`,
                  raw_content: combinedContent,
                  summary: extracted.summary,
                  peptides_mentioned: extracted.peptides_mentioned || [],
                  findings: extracted.findings || [],
                  credibility_tier: extracted.credibility_tier || "community_verified",
                  status: "pending_review",
                })
                .select("id")
                .single();

              if (queueItem) {
                await supabase
                  .from("content_queue")
                  .update({ processing_status: "completed", article_id: article?.id })
                  .eq("id", queueItem.id);
              }
            }
          } else {
            console.error(`AI extraction failed for ${account.handle}:`, aiResponse.status);
            if (queueItem) {
              await supabase
                .from("content_queue")
                .update({ processing_status: "failed", processing_error: `AI error: ${aiResponse.status}` })
                .eq("id", queueItem.id);
            }
          }
        }

        // Update account with latest tweet ID and scan time
        const newestTweetId = tweets[0]?.id;
        await supabase
          .from("monitored_accounts")
          .update({
            last_scanned_at: new Date().toISOString(),
            ...(newestTweetId ? { last_tweet_id: newestTweetId } : {}),
            display_name: userData.data?.name || account.display_name,
          })
          .eq("id", account.id);

        results.push({
          handle: account.handle,
          status: "scanned",
          total_tweets: tweets.length,
          relevant_tweets: relevantTweets.length,
          quality_score: account.quality_score,
        });
      } catch (accError) {
        console.error(`Error scanning ${account.handle}:`, accError);
        results.push({ handle: account.handle, status: "error", message: (accError as Error).message });
      }
    }

    // Auto-pause accounts with very low quality scores (below 15) and at least 5 reviews
    const { data: lowScoreAccounts } = await supabase
      .from("monitored_accounts")
      .select("id, handle, quality_score, total_accepted, total_rejected")
      .eq("is_active", true)
      .lt("quality_score", 15);

    const autoPaused: string[] = [];
    for (const acc of (lowScoreAccounts || [])) {
      if ((acc.total_accepted + acc.total_rejected) >= 5) {
        await supabase.from("monitored_accounts").update({ is_active: false }).eq("id", acc.id);
        autoPaused.push(acc.handle);
      }
    }

    return new Response(
      JSON.stringify({ success: true, scanned: results.length, results, auto_paused: autoPaused }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("scan-twitter error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
