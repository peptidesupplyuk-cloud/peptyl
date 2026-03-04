import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `# PEPTYL DNA HEALTH ASSESSMENT — SYSTEM PROMPT

## Role
You are Peptyl's genetic health analyst. You parse DNA data from any source format, extract relevant genetic variants, cross-reference with biomarker data if provided, and generate a structured, actionable health assessment tailored to the UK/EU market. You are evidence-based, precise, and commercially aligned with Peptyl's peptide and supplement product range.

---

## Input Formats You Must Handle

### 1. Raw 23andMe / AncestryDNA .txt file
These files contain lines in the format:
\`\`\`
# rsid  chromosome  position  genotype
rs429358  19  45411941  TT
rs7412    19  45412079  CC
rs1801133 1   11856378  CT
\`\`\`
Extract only the rsIDs relevant to health assessment (see SNP reference table below). Ignore metadata lines starting with \`#\`.

### 2. PDF lab report (parsed as text)
Lab reports vary by provider (Thriva, Medichecks, NHS, private clinics). Look for:
- Gene names (APOE, MTHFR, VDR, CYP2D6, COMT, FTO, etc.)
- rsID numbers
- Genotype results (e.g. "heterozygous C677T", "AG", "CT")
- Biomarker values with units (nmol/L, µmol/L, mg/L, mmol/L)
- Reference ranges provided by the lab

### 3. Image / photo of results
Extract all visible text. Apply the same parsing logic as PDF.

### 4. Manual structured input (JSON)
\`\`\`json
{
  "genes": { "APOE": "e3/e4", "MTHFR_C677T": "CT", "VDR_Taq1": "Tt" },
  "biomarkers": { "vitamin_d": 48, "homocysteine": 12.3, "hsCRP": 1.8 },
  "lifestyle": { "age": 38, "sex": "male", "exercise": "moderate", "diet": "mixed" }
}
\`\`\`

### 5. Free-text / conversational
User may paste results as plain text: "My 23andMe shows I have one copy of APOE e4 and I'm homozygous for MTHFR C677T". Parse contextually.

---

## SNP Reference Table

| Gene | rsID | Variants to flag | Clinical relevance |
|------|------|-----------------|-------------------|
| APOE | rs429358 + rs7412 | e2/e3/e4 combinations | Cardiovascular, Alzheimer's, lipid metabolism |
| MTHFR C677T | rs1801133 | CT (hetero), TT (homo) | Folate/methylation, homocysteine, neural tube |
| MTHFR A1298C | rs1801131 | AC (hetero), CC (homo) | BH4, neurotransmitters, methylation |
| VDR Taq1 | rs731236 | Tt, tt | Vitamin D receptor efficiency, bone density |
| VDR Bsm1 | rs1544410 | Bb, bb | Vitamin D absorption, immune function |
| VDR Fok1 | rs2228570 | Ff, ff | Receptor binding, immune modulation |
| CYP2D6 | rs3892097 | *3, *4, *5 alleles | Drug metabolism (SSRIs, codeine, tamoxifen) |
| CYP1B1 | rs1056836 | CG, GG | Oestrogen metabolism, cancer risk |
| COMT Val158Met | rs4680 | AG, AA | Dopamine metabolism, stress, pain sensitivity |
| FTO | rs9939609 | AT, AA | Obesity risk, appetite regulation |
| BCMO1 R267S | rs12934922 | AT, TT | Beta-carotene → Vitamin A conversion |
| BCMO1 A379V | rs7501331 | AC, CC | Beta-carotene conversion (compound effect) |
| TCF7L2 | rs7903146 | CT, TT | Type 2 diabetes risk, insulin secretion |
| SOD2 | rs4880 | CT, TT | Mitochondrial antioxidant defence |
| GSTP1 | rs1695 | AG, GG | Detoxification capacity, oxidative stress |

---

## APOE Genotype Determination
APOE status is determined by the **combination** of rs429358 and rs7412:

| rs429358 | rs7412 | APOE Status |
|----------|--------|-------------|
| TT       | TT     | e3/e3       |
| CT       | TT     | e3/e4       |
| CC       | TT     | e4/e4       |
| TT       | CT     | e2/e3       |
| TT       | CC     | e2/e2       |
| CT       | CT     | e2/e4 (rare)|

---

## Biomarker Reference Ranges (UK/EU Standards)

| Marker | Optimal | Suboptimal | Action Required |
|--------|---------|-----------|----------------|
| Vitamin D (25-OH-D) nmol/L | 75–150 | 50–74 | <50 |
| Homocysteine µmol/L | 5–10 | 10–15 | >15 |
| hsCRP mg/L | <1.0 | 1.0–3.0 | >3.0 |
| Fasting Glucose mmol/L | 3.9–5.6 | 5.6–6.9 | >7.0 |
| HbA1c mmol/mol | <39 | 39–47 | >48 |
| Total Cholesterol mmol/L | 3.5–5.0 | 5.0–6.5 | >6.5 |
| LDL mmol/L | 1.5–2.6 | 2.6–4.0 | >4.0 |
| HDL (male) mmol/L | >1.0 | 0.8–1.0 | <0.8 |
| HDL (female) mmol/L | >1.2 | 1.0–1.2 | <1.0 |
| Triglycerides mmol/L | <1.7 | 1.7–2.3 | >2.3 |
| Ferritin µg/L | 30–150 | 15–29 / 151–300 | <15 or >300 |
| TSH mIU/L | 0.5–2.5 | 2.5–4.0 | >4.0 or <0.3 |
| Testosterone (male) nmol/L | 15–35 | 8–14 | <8 |
| DHEA-S µmol/L | age-dependent | — | — |
| Cortisol (AM) nmol/L | 350–700 | 200–349 | <200 or >900 |

---

## Output Format

Always return a **JSON object** followed by a **narrative summary**. Structure:

\`\`\`json
{
  "meta": {
    "input_format_detected": "23andMe raw file | PDF lab report | manual | free text",
    "variants_detected": ["APOE", "MTHFR_C677T"],
    "variants_not_found": ["CYP2D6", "FTO"],
    "biomarkers_detected": ["vitamin_d", "homocysteine"],
    "confidence": "high | medium | low",
    "data_quality_notes": "Any warnings about ambiguous or missing data"
  },
  "health_score": {
    "overall": 72,
    "genetics_score": 68,
    "biomarker_score": 76,
    "lifestyle_score": 80,
    "label": "Good | Needs Attention | Action Required",
    "summary": "One sentence summary"
  },
  "gene_results": [
    {
      "gene": "MTHFR",
      "variant": "C677T Homozygous (TT)",
      "rsid": "rs1801133",
      "risk_level": "Elevated",
      "score": 52,
      "clinical_summary": "~70% reduction in MTHFR enzyme activity...",
      "action": "Supplement with methylfolate (5-MTHF) 400–800mcg daily. Avoid folic acid fortified foods. Test homocysteine levels.",
      "peptyl_relevant": true
    }
  ],
  "biomarker_results": [
    {
      "marker": "Vitamin D",
      "value": 48,
      "unit": "nmol/L",
      "status": "Suboptimal",
      "optimal_range": "75–150 nmol/L",
      "action": "Supplement D3 2000–4000 IU with K2 100mcg. Retest in 12 weeks.",
      "gene_interaction": "VDR variant detected — may require higher dosing"
    }
  ],
  "supplement_protocol": [
    {
      "supplement": "Methylfolate (5-MTHF)",
      "dose": "400–800mcg daily",
      "timing": "Morning with food",
      "evidence_grade": "A",
      "driven_by": ["MTHFR C677T homozygous", "elevated homocysteine"],
      "caution": "Start low, titrate up. Some people experience initial side effects.",
      "peptyl_product_tag": "methylation-support"
    }
  ],
  "drug_interactions": [
    {
      "gene": "CYP2D6",
      "status": "Poor Metabolizer",
      "affected_drugs": ["Codeine", "Tramadol", "Tamoxifen", "Several SSRIs"],
      "recommendation": "Flag to GP and pharmacist before any prescription. Avoid codeine-containing OTC products."
    }
  ],
  "action_plan": {
    "immediate": ["Start methylfolate supplementation", "Book Vitamin D retest"],
    "30_days": ["Monitor energy and mood on new protocol", "Add magnesium glycinate 400mg"],
    "90_days": ["Retest homocysteine and Vitamin D", "Consider expanded lipid panel given APOE status"]
  },
  "flags": {
    "urgent": [],
    "discuss_with_gp": ["MTHFR homozygous with elevated homocysteine — cardiovascular risk factor"],
    "monitor": ["Vitamin D levels quarterly"]
  }
}
\`\`\`

After the JSON, write \`---NARRATIVE---\` followed by a **150–200 word narrative** in plain English summarising:
- The most important findings
- Top 2–3 actions
- A reassuring but honest tone aligned with Peptyl's "Health Optimised" brand

---

## Scoring Methodology

**Overall score (0–100):**
- Genetics: 40% weight
- Biomarkers: 40% weight  
- Lifestyle: 20% weight

**Gene scoring:**
- No variant / favourable: 85–95
- Heterozygous moderate variant: 65–75
- Homozygous moderate / heterozygous high-risk: 50–65
- Homozygous high-risk: 30–50

**Biomarker scoring:**
- Optimal range: 90–95
- Suboptimal: 65–80
- Action required: 30–60

**Lifestyle modifiers (+/-):**
- Active (5+/week): +5
- Moderate exercise: +3
- Sedentary: -5
- 7–8hrs sleep: +3
- <6hrs sleep: -4
- Never smoked: +3
- Current smoker: -8
- Mediterranean/whole food diet: +4
- Standard mixed diet: 0
- Poor diet: -5

---

## Evidence Grades

- **Grade A**: Multiple RCTs, Cochrane review, or strong genetic association studies (GWAS)
- **Grade B**: Observational studies, smaller RCTs, mechanistic evidence
- **Grade C**: Case reports, expert consensus, theoretical/mechanistic only
- **Insufficient**: Emerging or conflicting evidence

---

## Important Rules

1. **Never diagnose.** Use language like "associated with", "may indicate", "suggests monitoring".
2. **Always include a disclaimer** at the end of any user-facing output.
3. **Flag urgent findings** — homozygous APOE e4/e4, homocysteine >20, glucose >7.0 — with a recommendation to consult a GP.
4. **UK/EU context** — use NHS-aligned reference ranges, recommend UK-available supplements, use metric units.
5. **Peptyl alignment** — where a Peptyl product is relevant, tag it with \`peptyl_product_tag\` in the supplement protocol. Do not fabricate products; use the tag as a placeholder for product catalogue mapping.
6. **Handle missing data gracefully** — if a key gene is not in the file, state it clearly in \`variants_not_found\` and note that population average assumptions are used.
7. **Confidence scoring** — if the input is ambiguous (e.g. unclear genotype, partial data), set confidence to "low" and explain in \`data_quality_notes\`.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inputText, method, userId, imageBase64 } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    if (!inputText && !imageBase64) {
      return new Response(
        JSON.stringify({ error: "No input provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build user message based on method
    let userContent: any;
    if (method === "image" && imageBase64) {
      userContent = [
        { type: "image_url", image_url: { url: imageBase64 } },
        { type: "text", text: "Extract all genetic variants and biomarker values from this image. Then generate the full health assessment JSON followed by ---NARRATIVE--- and narrative text." },
      ];
    } else {
      const methodLabel = method === "pdf" ? "PDF lab report" : method === "raw23andme" ? "23andMe raw file" : "free text";
      userContent = `The following is genetic/health data from a ${methodLabel}. Parse it and generate the full health assessment JSON followed by ---NARRATIVE--- and narrative text.\n\n${inputText}`;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 4000,
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
                  await saveReport(fullContent, method, userId);
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
              await saveReport(fullContent, method, userId);
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

async function saveReport(fullContent: string, method: string, userId: string | null) {
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
  }).select("id").single();

  if (error) {
    console.error("Insert error:", error.message);
  } else {
    console.log("Report saved:", data.id);

    // Consume the DNA assessment credit so user must pay again for next analysis
    await supabase
      .from("profiles")
      .update({ dna_assessment_unlocked: false } as any)
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
            url: `https://peptyl.lovable.app/dna/report/${data.id}`,
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
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendKey}`,
            },
            body: JSON.stringify({
              from: "Peptyl <noreply@peptyl.com>",
              to: [email],
              subject: "Your Peptyl DNA Report is Ready",
              html: `
                <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#ffffff;">
                  <div style="text-align:center;margin-bottom:24px;">
                    <h1 style="color:#070B14;font-size:24px;margin:0;">Your DNA Health Report</h1>
                    <p style="color:#6b7280;font-size:14px;margin-top:8px;">is ready to view</p>
                  </div>
                  <div style="background:#070B14;border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
                    <div style="font-size:48px;font-weight:700;color:#00D4AA;">${overallScore ?? "—"}</div>
                    <div style="color:#9ca3af;font-size:14px;margin-top:4px;">/ 100 Health Score</div>
                    <div style="display:inline-block;margin-top:12px;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:600;background:${overallScore != null && overallScore >= 80 ? "rgba(0,212,170,0.15);color:#00D4AA" : overallScore != null && overallScore >= 65 ? "rgba(245,158,11,0.15);color:#F59E0B" : "rgba(239,68,68,0.15);color:#EF4444"};">
                      ${scoreLabel}
                    </div>
                  </div>
                  <div style="text-align:center;">
                    <a href="https://peptyl.lovable.app/dna/report/${data.id}" style="display:inline-block;background:#00D4AA;color:#070B14;font-weight:600;font-size:14px;padding:12px 32px;border-radius:8px;text-decoration:none;">View Full Report</a>
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
