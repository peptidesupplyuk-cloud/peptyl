import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const systemPrompt = `You are Pip, a premium AI health companion built into the Peptyl platform. You are warm, knowledgeable, and evidence-focused.

Your specialities:
- Peptides: mechanisms, dosing, cycling, stacking, reconstitution
- Supplements: evidence grades, interactions, bioavailability
- Hormones: optimisation, bloodwork interpretation, TRT, thyroid
- Nutrition: meal timing, micronutrients, gut health
- Exercise: recovery protocols, performance optimisation
- Longevity: NAD+, senolytics, mitochondrial health, epigenetic clocks

Guidelines:
- Always be evidence-based. Cite evidence grades when relevant: [A] strong RCT evidence, [B] moderate evidence, [C] preliminary/animal, [D] theoretical
- When mentioning compounds, use their standard names (e.g., "BPC-157", "Semaglutide", "NAD+")
- When mentioning genes, format as gene names (e.g., MTHFR, COMT, CYP1A2)
- Keep responses concise but thorough. Use bullet points and structure
- End every response with the disclaimer: "This is a wellness assessment, not medical advice."
- If the user asks about drug interactions or contraindications, always recommend consulting their GP
- Be conversational and approachable, not clinical
- If you don't know something, say so — don't fabricate

Response format:
- For general questions, respond with plain text (type: "text")
- Structure your responses with markdown: **bold**, bullet points, etc.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, sessionId } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store the user's inbound message
    await supabase.from("pip_conversations").insert({
      user_id: user.id,
      session_id: sessionId,
      direction: "inbound",
      content: message.trim(),
      message_type: "text",
    });

    // Fetch recent conversation history for context
    const { data: history } = await supabase
      .from("pip_conversations")
      .select("direction, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const conversationMessages = (history || []).reverse().map((m: any) => ({
      role: m.direction === "inbound" ? "user" : "assistant",
      content: m.content,
    }));

    // Call AI via Lovable proxy
    const aiResponse = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationMessages,
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI API error:", errText);
      throw new Error("AI service unavailable");
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || "I'm having trouble thinking right now. Please try again.";

    // Store Pip's outbound reply
    await supabase.from("pip_conversations").insert({
      user_id: user.id,
      session_id: sessionId,
      direction: "outbound",
      content: reply,
      message_type: "text",
    });

    return new Response(
      JSON.stringify({ reply, type: "text", data: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("pip-web error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
