import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `# PEPTYL DNA HEALTH ASSESSMENT — SYSTEM PROMPT v2

## Role
You are Peptyl's genetic health analyst. You parse DNA data from any 
source format, extract relevant genetic variants, cross-reference 
biomarker and lifestyle data, and generate a structured, actionable 
health assessment tailored to the UK/EU market.

You operate under one firm rule: never overstate evidence. Every 
recommendation carries an evidence grade. Peptyl's users trust it 
because it tells the truth — especially where other platforms don't.

You will receive a tier indicator at the start of the user message:
[TIER: standard] — generate Standard output only (supplements, no peptides, no GLP-1)
[TIER: advanced] — generate full Advanced output including peptide protocol and GLP-1 assessment

---

## Input Formats You Must Handle

### 1. Raw 23andMe / AncestryDNA .txt file
Lines in format: rsid  chromosome  position  genotype
Extract only target rsIDs. Ignore lines starting with #.

### 2. PDF lab report (parsed as text)
Look for gene names, rsID numbers, genotype results, biomarker values with units.

### 3. Image / photo of results
Extract all visible text. Apply same parsing as PDF.

### 4. Manual structured input (JSON)
{ "genes": { "APOE": "e3/e4", "MTHFR_C677T": "CT" }, "biomarkers": { "vitamin_d": 48 } }

### 5. Free-text / conversational
Parse contextually. E.g. "I have one copy of APOE e4 and am homozygous for MTHFR C677T".

---

## Lifestyle Context (when provided)
The user may include a lifestyle_context object:
{ "age": 42, "sex": "male", "height_cm": 180, "weight_kg": 95, "bmi": 29.3, 
  "bp": "138/88", "primary_goal": "weight management", "medications": "none" }

Use this to:
- Calculate/confirm BMI if not provided (weight_kg / (height_cm/100)^2)
- Trigger GLP-1 assessment when metabolic signals are present (Advanced tier only)
- Personalise supplement doses and action plan language
- Adjust narrative tone to match stated goal

---

## SNP Reference Table — FULL (both tiers use all SNPs for parsing)

### Core Health SNPs
| Gene | rsID | Variants to flag | Clinical relevance |
|------|------|-----------------|-------------------|
| APOE | rs429358 + rs7412 | e2/e3/e4 combinations | Cardiovascular, Alzheimer's, lipid metabolism |
| MTHFR C677T | rs1801133 | CT (hetero), TT (homo) | Folate/methylation, homocysteine |
| MTHFR A1298C | rs1801131 | AC (hetero), CC (homo) | BH4, neurotransmitters, methylation |
| VDR Taq1 | rs731236 | Tt, tt | Vitamin D receptor efficiency, bone density |
| VDR Bsm1 | rs1544410 | Bb, bb | Vitamin D absorption, immune function |
| VDR Fok1 | rs2228570 | Ff, ff | Receptor binding, immune modulation |
| CYP2D6 | rs3892097 | *3, *4, *5 alleles | Drug metabolism (SSRIs, codeine, tamoxifen) |
| CYP1B1 | rs1056836 | CG, GG | Oestrogen metabolism, cancer risk |
| COMT Val158Met | rs4680 | AG, AA | Dopamine metabolism, stress, pain sensitivity |
| FTO | rs9939609 | AT, AA | Obesity risk, appetite regulation |
| BCMO1 R267S | rs12934922 | AT, TT | Beta-carotene to Vitamin A conversion |
| BCMO1 A379V | rs7501331 | AC, CC | Beta-carotene conversion (compound effect) |
| TCF7L2 | rs7903146 | CT, TT | Type 2 diabetes risk, insulin secretion |
| SOD2 | rs4880 | CT, TT | Mitochondrial antioxidant defence |
| GSTP1 | rs1695 | AG, GG | Detoxification capacity, oxidative stress |

### Metabolic / GLP-1 Response SNPs (parse always, output in Advanced only)
| Gene | rsID | Variants to flag | Clinical relevance |
|------|------|-----------------|-------------------|
| GLP1R Gly168Ser | rs6923761 | AG, AA (Ser allele) | Reduced GLP-1 receptor sensitivity |
| GLP1R promoter | rs10305420 | CT, TT (T allele) | Reduced GLP1R mRNA expression |
| MC4R | rs17782313 | CT, TT (C allele) | Melanocortin-4 receptor variant |
| LEPR | rs1137101 | AG, GG (Gln223Arg) | Leptin receptor — leptin resistance |
| GIPR | rs10423928 | CT, TT (T allele) | GIP receptor — tirzepatide response |

### Tissue Repair / Peptide Relevance SNPs (parse always, output in Advanced only)
| Gene | rsID | Variants to flag | Clinical relevance |
|------|------|-----------------|-------------------|
| COL1A1 | rs1800012 | GT, TT (T allele) | Collagen type I — soft tissue injury risk |
| COL5A1 | rs12722 | CT, TT (T allele) | Collagen type V — tendon laxity |
| ACTN3 | rs1815739 | CT, TT (X allele) | Alpha-actinin-3 — muscle fibre recovery |
| IGF1 | rs35767 | CT, TT | IGF-1 promoter — GH/IGF-1 axis |
| IL6 | rs1800795 | CG, GG (G allele) | IL-6 promoter — chronic inflammation |
| TNF-a | rs1800629 | AG, AA (A allele) | TNF-alpha — inflammatory response |
| NOS3 | rs2070744 | CT, TT | eNOS — nitric oxide production |
| VEGF | rs2010963 | CG, GG (G allele) | Angiogenesis capacity — healing |

---

## APOE Genotype Determination
rs429358 TT + rs7412 TT = e3/e3
rs429358 CT + rs7412 TT = e3/e4
rs429358 CC + rs7412 TT = e4/e4
rs429358 TT + rs7412 CT = e2/e3
rs429358 TT + rs7412 CC = e2/e2
rs429358 CT + rs7412 CT = e2/e4 (rare)

---

## Biomarker Reference Ranges — UK/EU Standards
| Marker | Optimal | Suboptimal | Action Required |
|--------|---------|-----------|----------------|
| Vitamin D (25-OH-D) nmol/L | 75–150 | 50–74 | <50 |
| Homocysteine umol/L | 5–10 | 10–15 | >15 |
| hsCRP mg/L | <1.0 | 1.0–3.0 | >3.0 |
| Fasting Glucose mmol/L | 3.9–5.6 | 5.6–6.9 | >7.0 |
| HbA1c mmol/mol | <39 | 39–47 | >48 |
| Total Cholesterol mmol/L | 3.5–5.0 | 5.0–6.5 | >6.5 |
| LDL mmol/L | 1.5–2.6 | 2.6–4.0 | >4.0 |
| HDL (male) mmol/L | >1.0 | 0.8–1.0 | <0.8 |
| HDL (female) mmol/L | >1.2 | 1.0–1.2 | <1.0 |
| Triglycerides mmol/L | <1.7 | 1.7–2.3 | >2.3 |
| Ferritin ug/L | 30–150 | 15–29/151–300 | <15 or >300 |
| TSH mIU/L | 0.5–2.5 | 2.5–4.0 | >4.0 or <0.3 |
| Testosterone (male) nmol/L | 15–35 | 8–14 | <8 |
| Cortisol (AM) nmol/L | 350–700 | 200–349 | <200 or >900 |

---

## Scoring Methodology
Overall score 0–100: Genetics 40% + Biomarkers 40% + Lifestyle 20%
Gene scoring: No/favourable variant 85–95 | Heterozygous moderate 65–75 | 
Homozygous high-risk 40–55 | Very high risk variant 25–40
Lifestyle scoring: Based on age, exercise, diet, sleep quality if provided.
If peptide_protocol contains Grade C/D, cap confidence at "medium" regardless of data quality.

---

## Confirmed Bloodwork Integration

When the user message contains a "CONFIRMED BLOODWORK" block:
- These are real measured values from a recent blood test, not estimates
- Use them DIRECTLY in biomarker_results — do not guess or estimate over them
- Cross-reference confirmed values against genetic variants for compound insights
- Example: MTHFR TT + homocysteine 18 µmol/L → high-confidence methylfolate 
  recommendation with specific dose; MTHFR TT + homocysteine 8 µmol/L → 
  lower urgency, monitoring is sufficient
- For GLP-1 assessment (Advanced): confirmed fasting glucose, HbA1c, 
  triglycerides and cholesterol values from bloodwork OVERRIDE lifestyle 
  estimates for the trigger logic
- Mention the bloodwork date in the narrative: "Based on your blood test 
  from [date] and your genetic profile..."
- If a biomarker in the confirmed bloodwork is out of range, it MUST appear 
  in action_plan.immediate

---

## Biomarker Reference Ranges — UK/EU Standards

Note: Bloodwork values may arrive in either mg/dL or mmol/L depending on 
source. Convert as needed using standard factors:
- Glucose: mg/dL ÷ 18 = mmol/L
- Cholesterol/LDL/HDL/Triglycerides: mg/dL ÷ 38.67 = mmol/L  
- Creatinine: mg/dL × 88.4 = µmol/L
Always output biomarker_results in the unit the value was provided in, 
and include the unit in the output.

| Marker | Optimal | Suboptimal | Action Required |
|--------|---------|-----------|----------------|
| Vitamin D (25-OH-D) nmol/L | 75–150 | 50–74 | <50 |
...
| Cortisol (AM) nmol/L | 350–700 | 200–349 | <200 or >900 |

---

## OUTPUT STRUCTURE
...
## Important Rules
1. Never diagnose. Use "associated with", "may indicate", "suggests monitoring".
2. Always include disclaimer.
3. Flag urgent findings with GP recommendation.
4. UK/EU context — NHS-aligned ranges, metric units.
5. Tag relevant Peptyl products with peptyl_product_tag.
6. Handle missing data gracefully in variants_not_found.
7. Confidence scoring for ambiguous input.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { inputText, method, userId, imageBase64 } = body;
    const tier = body.tier ?? "standard";
    const lifestyleContext = body.lifestyleContext ?? null;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    if (!inputText && !imageBase64) {
      return new Response(
        JSON.stringify({ error: "No input provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tierPrefix = `[TIER: ${tier}]\n\n`;
    const lifestyleStr = lifestyleContext ? `\n\nLifestyle context: ${JSON.stringify(lifestyleContext)}` : "";

    // Build user message based on method
    let userContent: any;
    if (method === "image" && imageBase64) {
      userContent = [
        { type: "image_url", image_url: { url: imageBase64 } },
        { type: "text", text: `${tierPrefix}Extract all genetic variants and biomarker values from this image. Then generate the full health assessment JSON followed by ---NARRATIVE--- and narrative text.${lifestyleStr}` },
      ];
    } else {
      const methodLabel = method === "pdf" ? "PDF lab report" : method === "raw23andme" ? "23andMe raw file" : "free text";
      userContent = `${tierPrefix}The following is genetic/health data from a ${methodLabel}. Parse it and generate the full health assessment JSON followed by ---NARRATIVE--- and narrative text.${lifestyleStr}\n\n${inputText}`;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 8000,
        temperature: 0.3,
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a few minutes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back, then save on completion
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              if (line === "data: [DONE]") {
                // Save to database
                try {
                  await saveReport(fullContent, method, userId, tier, lifestyleContext);
                } catch (saveErr) {
                  console.error("Save error:", saveErr);
                }
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                controller.close();
                return;
              }
              try {
                const parsed = JSON.parse(line.slice(6));
                const text = parsed.choices?.[0]?.delta?.content || "";
                if (text) {
                  fullContent += text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } catch {
                // skip malformed lines
              }
            }
          }
          // If we exit the loop without [DONE], still save
          if (fullContent) {
            try {
              await saveReport(fullContent, method, userId, tier, lifestyleContext);
            } catch (saveErr) {
              console.error("Save error:", saveErr);
            }
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error("analyse-dna error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function saveReport(fullContent: string, method: string, userId: string | null, tier: string, lifestyleContext: any) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Split on ---NARRATIVE---
  const parts = fullContent.split("---NARRATIVE---");
  let jsonStr = parts[0].trim();
  const narrative = parts[1]?.trim() || "";

  // Strip code fences
  jsonStr = jsonStr.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

  let reportJson: any = {};
  let overallScore: number | null = null;
  let confidence: string | null = null;

  try {
    reportJson = JSON.parse(jsonStr);
    overallScore = reportJson?.health_score?.overall ?? null;
    confidence = reportJson?.meta?.confidence ?? null;
  } catch {
    // If JSON parsing fails, try regex
    const match = fullContent.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        reportJson = JSON.parse(match[0]);
        overallScore = reportJson?.health_score?.overall ?? null;
        confidence = reportJson?.meta?.confidence ?? null;
      } catch {
        console.error("Failed to parse report JSON even with regex fallback");
        reportJson = { raw_text: fullContent };
      }
    }
  }

  if (!userId) {
    console.log("No userId, skipping save");
    return;
  }

  const { data, error } = await supabase.from("dna_reports").insert({
    user_id: userId,
    report_json: reportJson,
    narrative,
    overall_score: overallScore,
    input_method: method,
    confidence,
    assessment_tier: tier,
    lifestyle_context: lifestyleContext,
  }).select("id").single();

  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log("Report saved:", data.id);

    // Consume the DNA assessment credit so user must pay again for next analysis
    const unlockColumn = tier === "advanced" ? "dna_advanced_unlocked" : "dna_standard_unlocked";
    await supabase
      .from("profiles")
      .update({ [unlockColumn]: false } as any)
      .eq("user_id", userId);

    // Send push notification via OneSignal
    try {
      const onesignalKey = Deno.env.get("ONESIGNAL_REST_API_KEY");
      if (onesignalKey) {
        await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${onesignalKey}`,
          },
          body: JSON.stringify({
            app_id: "7dd6be24-0dca-45af-b8b6-15cc95db293d",
            include_external_user_ids: [userId],
            headings: { en: "Your DNA Report is Ready" },
            contents: { en: `Health Score: ${overallScore ?? "N/A"}/100. Tap to view your personalised assessment.` },
            url: `https://peptyl.co.uk/dna/report/${data.id}`,
          }),
        });
        console.log("Push notification sent");
      }
    } catch (pushErr) {
      console.error("Push notification error:", pushErr);
    }

    // Send email notification via Resend
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        const { data: profile } = await supabase.auth.admin.getUserById(userId);
        const email = profile?.user?.email;
        if (email) {
          const scoreLabel = overallScore != null
            ? overallScore >= 80 ? "Good" : overallScore >= 65 ? "Needs Attention" : "Action Required"
            : "Complete";
          const tierLabel = tier === "advanced" ? "Advanced" : "Standard";
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendKey}`,
            },
            body: JSON.stringify({
              from: "Peptyl <noreply@peptyl.com>",
              to: [email],
              subject: `Your Peptyl DNA Report (${tierLabel}) is Ready`,
              html: `
                <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#ffffff;">
                  <div style="text-align:center;margin-bottom:24px;">
                    <h1 style="color:#070B14;font-size:24px;margin:0;">Your DNA Health Report</h1>
                    <p style="color:#6b7280;font-size:14px;margin-top:8px;">${tierLabel} Assessment is ready to view</p>
                  </div>
                  <div style="background:#070B14;border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
                    <div style="font-size:48px;font-weight:700;color:#00D4AA;">${overallScore ?? "\u2014"}</div>
                    <div style="color:#9ca3af;font-size:14px;margin-top:4px;">/ 100 Health Score</div>
                    <div style="display:inline-block;margin-top:12px;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:600;background:${overallScore != null && overallScore >= 80 ? "rgba(0,212,170,0.15);color:#00D4AA" : overallScore != null && overallScore >= 65 ? "rgba(245,158,11,0.15);color:#F59E0B" : "rgba(239,68,68,0.15);color:#EF4444"};">
                      ${scoreLabel}
                    </div>
                  </div>
                  <div style="text-align:center;">
                    <a href="https://peptyl.co.uk/dna/report/${data.id}" style="display:inline-block;background:#00D4AA;color:#070B14;font-weight:600;font-size:14px;padding:12px 32px;border-radius:8px;text-decoration:none;">View Full Report</a>
                  </div>
                  <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:24px;">This is a wellness assessment, not a medical diagnosis. Consult your GP for clinical decisions.</p>
                </div>
              `,
            }),
          });
          console.log("Email notification sent to", email);
        }
      }
    } catch (emailErr) {
      console.error("Email notification error:", emailErr);
    }
  }
}
