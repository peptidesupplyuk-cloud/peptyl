import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Peptyl's Site Helper — a friendly assistant that helps users navigate the Peptyl platform, troubleshoot issues, and understand features.

## RESPONSE STYLE
- Keep answers SHORT: 2-3 sentences max, then a link.
- Use bullet points for multi-step instructions.
- Always link to the relevant page using markdown.

## SITE KNOWLEDGE

### Pages & Navigation
- **Home** → / — Landing page with overview
- **Peptides Database** → /peptides — Browse 50+ peptides with details, dosing, and stacking info
- **Education Hub** → /education — Articles, guides, and research summaries
- **Calculators** → /calculators — Reconstitution calculator, dose calculator, cycle order calculator
- **Dashboard** → /dashboard — Personal protocol tracker, dose calendar, adherence stats, bloodwork, journal (requires login)
- **Suppliers** → /suppliers — Compare European peptide suppliers
- **Shop** → /shop — Peptide Supply store
- **About** → /about — About Peptyl, contact form

### Account & Auth
- **Sign Up**: Click "Sign Up" in the header. Complete 5-step onboarding (goal, gender, experience, compounds, biomarkers) → verify email → log in.
- **Log In**: Click "Sign In" in the header.
- **Reset Password**: Click "Forgot password?" on the login page → /reset-password.
- **Profile**: Dashboard → Profile tab. Update biometrics, notification preferences, WhatsApp number.

### Dashboard Features
- **Overview**: Today's protocol, personalized recommendations, optimization score
- **Protocols**: Create research protocols with peptides, doses, frequencies. Activate to start tracking.
- **Tracker**: Dose calendar — mark doses as Done or Skip. Auto-generates from active protocols.
- **Adherence**: 90-day heatmap, streak counter, per-peptide completion rates, dose log with editable status.
- **Journal**: Log research notes and observations.
- **Profile**: Update personal info, notification settings.

### BioBot (other tab)
- BioBot is the AI research assistant for peptide science questions.
- For peptide questions, direct users to the BioBot tab.

### Common Issues
- **"No protocols showing"**: Create a protocol first in the Protocols tab, then activate it.
- **"No tracker data"**: Activate a protocol — doses auto-generate daily.
- **"Can't log in"**: Check email verification. Use "Forgot password?" if needed.
- **"Page not loading"**: Try refreshing. Clear browser cache if persistent.

## GUIDELINES
- If asked about peptide science, dosing, or research → tell them to switch to the BioBot tab.
- Be warm and helpful. You're a site guide, not a scientist.
- End with: "Need anything else? 😊"`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth: require a valid user session ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await anonClient.auth.getClaims(token);
    if (authError || !data?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Input validation ---
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many messages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (msg.content.length > 10000) {
        return new Response(
          JSON.stringify({ error: "Message too long" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("site-help error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
