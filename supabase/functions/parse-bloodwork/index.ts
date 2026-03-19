import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// All tracked marker keys from BIOMARKERS
const TRACKED_MARKERS: Record<string, { key: string; unit: string }> = {
  "fasting glucose": { key: "fasting_glucose", unit: "mg/dL" },
  "hba1c": { key: "hba1c", unit: "%" },
  "glycated haemoglobin": { key: "hba1c", unit: "%" },
  "glycated hemoglobin": { key: "hba1c", unit: "%" },
  "total cholesterol": { key: "total_cholesterol", unit: "mg/dL" },
  "cholesterol": { key: "total_cholesterol", unit: "mg/dL" },
  "ldl cholesterol": { key: "ldl", unit: "mg/dL" },
  "ldl": { key: "ldl", unit: "mg/dL" },
  "ldl-c": { key: "ldl", unit: "mg/dL" },
  "hdl cholesterol": { key: "hdl", unit: "mg/dL" },
  "hdl": { key: "hdl", unit: "mg/dL" },
  "hdl-c": { key: "hdl", unit: "mg/dL" },
  "triglycerides": { key: "triglycerides", unit: "mg/dL" },
  "alt": { key: "alt", unit: "U/L" },
  "alanine aminotransferase": { key: "alt", unit: "U/L" },
  "ast": { key: "ast", unit: "U/L" },
  "aspartate aminotransferase": { key: "ast", unit: "U/L" },
  "creatinine": { key: "creatinine", unit: "mg/dL" },
  "egfr": { key: "egfr", unit: "mL/min" },
  "estimated glomerular filtration rate": { key: "egfr", unit: "mL/min" },
  "hscrp": { key: "hscrp", unit: "mg/L" },
  "hs-crp": { key: "hscrp", unit: "mg/L" },
  "high sensitivity crp": { key: "hscrp", unit: "mg/L" },
  "c-reactive protein": { key: "hscrp", unit: "mg/L" },
  "vitamin d": { key: "vitamin_d", unit: "ng/mL" },
  "25-oh vitamin d": { key: "vitamin_d", unit: "ng/mL" },
  "25-hydroxyvitamin d": { key: "vitamin_d", unit: "ng/mL" },
  "igf-1": { key: "igf1", unit: "ng/mL" },
  "igf1": { key: "igf1", unit: "ng/mL" },
  "insulin-like growth factor": { key: "igf1", unit: "ng/mL" },
  "total testosterone": { key: "total_testosterone", unit: "ng/dL" },
  "testosterone": { key: "total_testosterone", unit: "ng/dL" },
  "free testosterone": { key: "free_testosterone", unit: "pg/mL" },
  "shbg": { key: "shbg", unit: "nmol/L" },
  "sex hormone binding globulin": { key: "shbg", unit: "nmol/L" },
  "estradiol": { key: "estradiol", unit: "pg/mL" },
  "oestradiol": { key: "estradiol", unit: "pg/mL" },
  "e2": { key: "estradiol", unit: "pg/mL" },
  "tsh": { key: "tsh", unit: "mIU/L" },
  "thyroid stimulating hormone": { key: "tsh", unit: "mIU/L" },
  "free t3": { key: "free_t3", unit: "pg/mL" },
  "ft3": { key: "free_t3", unit: "pg/mL" },
  "free t4": { key: "free_t4", unit: "ng/dL" },
  "ft4": { key: "free_t4", unit: "ng/dL" },
  "free thyroxine": { key: "free_t4", unit: "ng/dL" },
  "fasting insulin": { key: "fasting_insulin", unit: "µIU/mL" },
  "insulin": { key: "fasting_insulin", unit: "µIU/mL" },
  "homocysteine": { key: "homocysteine", unit: "µmol/L" },
  "ferritin": { key: "ferritin", unit: "µg/L" },
  "cortisol": { key: "cortisol_am", unit: "nmol/L" },
  "cortisol am": { key: "cortisol_am", unit: "nmol/L" },
  "morning cortisol": { key: "cortisol_am", unit: "nmol/L" },
  "dhea-s": { key: "dhea_s", unit: "µmol/L" },
  "dheas": { key: "dhea_s", unit: "µmol/L" },
  "dhea sulphate": { key: "dhea_s", unit: "µmol/L" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return new Response(JSON.stringify({ error: "No document text provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use Lovable AI to extract biomarker data
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trackedList = Object.values(TRACKED_MARKERS)
      .map(v => v.key)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", ");

    const prompt = `Extract ALL biomarker/blood test results from this lab report text. Return a JSON object with:
{
  "markers": [
    { "name": "<original name from report>", "value": <numeric value>, "unit": "<unit from report>" }
  ],
  "test_date": "<YYYY-MM-DD if found, else null>",
  "lab_name": "<lab name if found, else null>"
}

Rules:
- Extract EVERY biomarker with a numeric result value
- Include both common and uncommon markers
- Convert ranges like "< 0.5" to their numeric value (0.5)
- For results like "Normal" without a number, skip them
- Keep the original marker name exactly as printed
- Keep the original unit exactly as printed
- Our tracked markers are: ${trackedList}
- Include ALL markers you find, even ones not in our tracked list

Lab report text:
${text.slice(0, 15000)}`;

    const aiResponse = await fetch("https://ai.lovable.dev/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a clinical lab report parser. Extract biomarker data precisely. Return ONLY valid JSON, no markdown." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI error:", await aiResponse.text());
      return new Response(JSON.stringify({ error: "Failed to parse document" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content ?? "";
    
    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let parsed: { markers: { name: string; value: number; unit: string }[]; test_date: string | null; lab_name: string | null };
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content.slice(0, 500));
      return new Response(JSON.stringify({ error: "Could not parse the lab report. Try a clearer document." }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(parsed.markers) || parsed.markers.length === 0) {
      return new Response(JSON.stringify({ error: "No biomarker results found in document" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map extracted markers to our tracked system
    const matched: { marker_name: string; value: number; unit: string; original_name: string }[] = [];
    const untracked: { name: string; value: number; unit: string }[] = [];

    for (const m of parsed.markers) {
      if (m.value == null || isNaN(Number(m.value))) continue;
      
      const normalised = m.name.toLowerCase().trim();
      const found = TRACKED_MARKERS[normalised];
      
      if (found) {
        // Check for duplicates (keep first match)
        if (!matched.some(x => x.marker_name === found.key)) {
          matched.push({
            marker_name: found.key,
            value: Number(m.value),
            unit: m.unit || found.unit,
            original_name: m.name,
          });
        }
      } else {
        // Try partial matching
        let matchedPartial = false;
        for (const [alias, def] of Object.entries(TRACKED_MARKERS)) {
          if (normalised.includes(alias) || alias.includes(normalised)) {
            if (!matched.some(x => x.marker_name === def.key)) {
              matched.push({
                marker_name: def.key,
                value: Number(m.value),
                unit: m.unit || def.unit,
                original_name: m.name,
              });
              matchedPartial = true;
              break;
            }
          }
        }
        if (!matchedPartial) {
          untracked.push({ name: m.name, value: Number(m.value), unit: m.unit });
        }
      }
    }

    return new Response(
      JSON.stringify({
        matched,
        untracked,
        test_date: parsed.test_date,
        lab_name: parsed.lab_name,
        total_extracted: parsed.markers.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("parse-bloodwork error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
