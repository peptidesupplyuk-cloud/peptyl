import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── Canonical product catalog ──
   The AI extractor MUST map scraped data to these exact names.
   Any price that doesn't match is discarded. */

const MEDICATION_PRODUCTS = [
  "Semaglutide (Wegovy) – 0.25mg/week starter",
  "Semaglutide (Wegovy) – 0.5mg/week",
  "Semaglutide (Wegovy) – 1mg/week",
  "Tirzepatide (Mounjaro) – 2.5mg/week starter",
  "Tirzepatide (Mounjaro) – 5mg/week",
  "Tirzepatide (Mounjaro) – 10mg/week",
  "Tirzepatide (Mounjaro) – 15mg/week",
  "Liraglutide (Saxenda) – starter pack",
  "Orlistat 120mg – 84 capsules",
];

const BLOODWORK_PRODUCTS = [
  "Basic Health Check (Full Blood Count, Liver, Kidney, Thyroid)",
  "Advanced Well Man / Well Woman",
  "Testosterone Panel",
  "Thyroid Function (TSH, FT3, FT4)",
  "HbA1c (Diabetes Check)",
  "Comprehensive Hormone Panel (Male)",
  "Liver Function Test",
  "Full Body MOT / Ultimate Health Check",
];

type SupplierConfig = {
  name: string;
  url: string;
  category: "medication" | "bloodwork";
  scrapePaths?: string[]; // specific pages to scrape for better results
};

const SUPPLIERS: SupplierConfig[] = [
  // Medication suppliers
  { name: "Simple Online Pharmacy", url: "https://www.simpleonlinepharmacy.co.uk", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "Boots Online Doctor", url: "https://onlinedoctor.boots.com", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "LloydsDirect", url: "https://onlinedoctor.lloydspharmacy.com", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "Superdrug Online Doctor", url: "https://onlinedoctor.superdrug.com", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "Click Pharmacy", url: "https://www.clickpharmacy.co.uk", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "MedExpress", url: "https://www.medexpress.co.uk", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "Morrisons Clinic", url: "https://clinic.morrisons.com", category: "medication" },
  { name: "Bolt Pharmacy", url: "https://www.boltpharmacy.co.uk", category: "medication" },
  { name: "Pharmacy Planet", url: "https://www.pharmacyplanet.com", category: "medication" },
  { name: "Asda Online Doctor", url: "https://onlinedoctor.asda.com", category: "medication" },
  { name: "Oxford Online Pharmacy", url: "https://www.oxfordonlinepharmacy.co.uk", category: "medication" },
  { name: "MedicSpot", url: "https://www.medicspot.co.uk", category: "medication" },
  { name: "Lotus Weight Loss", url: "https://lotusweightloss.co.uk", category: "medication" },
  { name: "Manual", url: "https://www.manual.co", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "Numan", url: "https://www.numan.com", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "PillTime", url: "https://www.pilltime.co.uk", category: "medication" },
  // Bloodwork suppliers
  { name: "Medichecks", url: "https://www.medichecks.com", category: "bloodwork", scrapePaths: ["/blood-tests"] },
  { name: "Forth", url: "https://www.forthwithlife.co.uk", category: "bloodwork", scrapePaths: ["/health-tests"] },
  { name: "Thriva", url: "https://thriva.co", category: "bloodwork" },
  { name: "Blue Crest Wellness", url: "https://www.bluecrestwellness.com", category: "bloodwork" },
  { name: "Randox Health", url: "https://www.randox.com", category: "bloodwork" },
  { name: "Numan", url: "https://www.numan.com", category: "bloodwork" },
  { name: "Manual", url: "https://www.manual.co", category: "bloodwork" },
  { name: "LetsGetChecked", url: "https://www.letsgetchecked.com", category: "bloodwork" },
  { name: "London Medical Laboratory", url: "https://www.londonmedicallaboratory.com", category: "bloodwork" },
  { name: "Monitor My Health", url: "https://www.monitormyhealth.org.uk", category: "bloodwork" },
];

async function scrapeSupplier(supplier: SupplierConfig, firecrawlKey: string): Promise<string | null> {
  const urls = supplier.scrapePaths
    ? supplier.scrapePaths.map((p) => `${supplier.url}${p}`)
    : [supplier.url];

  const allMarkdown: string[] = [];

  for (const url of urls) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent: true,
          waitFor: 3000,
        }),
      });

      if (!res.ok) {
        console.error(`Firecrawl error for ${url}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const md = data?.data?.markdown || data?.markdown || "";
      if (md) allMarkdown.push(md);
    } catch (err) {
      console.error(`Scrape failed for ${url}:`, err);
    }
  }

  return allMarkdown.length > 0 ? allMarkdown.join("\n\n---\n\n") : null;
}

type ExtractedPrice = {
  product_name: string;
  price: number;
  url: string;
  in_stock: boolean;
};

async function extractPrices(
  markdown: string,
  supplier: SupplierConfig,
  lovableApiKey: string
): Promise<ExtractedPrice[]> {
  const products =
    supplier.category === "medication" ? MEDICATION_PRODUCTS : BLOODWORK_PRODUCTS;

  const systemPrompt = `You are a price extraction assistant. You will be given scraped website content from "${supplier.name}" (${supplier.url}).

Your task: Find prices for ONLY these exact products and map them precisely:

${products.map((p, i) => `${i + 1}. ${p}`).join("\n")}

CRITICAL RULES:
- Only return products from the list above that you can confidently match
- Match by active ingredient AND dosage/strength precisely
- Wegovy = semaglutide injection, Mounjaro = tirzepatide injection, Saxenda = liraglutide injection
- Prices must be in GBP (£)
- If a product is listed but marked as "out of stock", "unavailable", or "coming soon", set in_stock to false
- If you cannot confidently match a product, DO NOT include it
- Return the direct URL to the product page if visible, otherwise use the supplier base URL

Return a JSON array of objects with these exact fields:
{ "product_name": "exact name from list above", "price": number, "url": "string", "in_stock": boolean }

Return ONLY the JSON array, no other text.`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here is the scraped content from ${supplier.name}:\n\n${markdown.slice(0, 15000)}`,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      console.error(`AI extraction failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error(`No JSON array found in AI response for ${supplier.name}`);
      return [];
    }

    const parsed: ExtractedPrice[] = JSON.parse(jsonMatch[0]);

    // Validate: only allow exact product name matches
    const validProducts = new Set(products);
    return parsed.filter(
      (p) =>
        validProducts.has(p.product_name) &&
        typeof p.price === "number" &&
        p.price > 0 &&
        p.price < 10000
    );
  } catch (err) {
    console.error(`AI extraction error for ${supplier.name}:`, err);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!firecrawlKey) {
    return new Response(JSON.stringify({ error: "FIRECRAWL_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!lovableApiKey) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Accept batch parameter: { batch: 0 } processes suppliers 0-4, { batch: 1 } processes 5-9, etc.
  let batch = 0;
  try {
    const body = await req.json();
    batch = body?.batch ?? 0;
  } catch {
    // default batch 0
  }

  const BATCH_SIZE = 5;
  const startIdx = batch * BATCH_SIZE;
  const batchSuppliers = SUPPLIERS.slice(startIdx, startIdx + BATCH_SIZE);

  if (batchSuppliers.length === 0) {
    return new Response(JSON.stringify({ success: true, message: "No more suppliers in this batch" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const scrapedAt = new Date().toISOString();
  const errors: { supplier: string; error: string }[] = [];
  let totalSuppliers = 0;
  let totalProducts = 0;

  for (const supplier of batchSuppliers) {
    try {
      console.log(`[Batch ${batch}] Scraping ${supplier.name}...`);
      const markdown = await scrapeSupplier(supplier, firecrawlKey);

      if (!markdown) {
        errors.push({ supplier: supplier.name, error: "No content scraped" });
        continue;
      }

      totalSuppliers++;
      const prices = await extractPrices(markdown, supplier, lovableApiKey);
      console.log(`  → Extracted ${prices.length} prices from ${supplier.name}`);

      // Insert immediately per supplier
      if (prices.length > 0) {
        const rows = prices.map((p) => ({
          category: supplier.category,
          product_name: p.product_name,
          supplier_name: supplier.name,
          price: p.price,
          url: p.url,
          in_stock: p.in_stock,
          scraped_at: scrapedAt,
        }));

        const { error: insertErr } = await supabase.from("supplier_prices").insert(rows);
        if (insertErr) {
          console.error(`Insert error for ${supplier.name}:`, insertErr);
          errors.push({ supplier: supplier.name, error: insertErr.message });
        } else {
          totalProducts += prices.length;
        }
      }

      // Rate limit between suppliers
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ supplier: supplier.name, error: msg });
      console.error(`Error with ${supplier.name}:`, msg);
    }
  }

  // Log this batch result
  await supabase.from("supplier_scrape_log").insert({
    status: errors.length > 0 ? "completed_with_errors" : "completed",
    completed_at: new Date().toISOString(),
    suppliers_scraped: totalSuppliers,
    products_matched: totalProducts,
    errors: errors.length > 0 ? errors : [],
  });

  // If there are more suppliers, trigger next batch
  const nextBatchStart = (batch + 1) * BATCH_SIZE;
  if (nextBatchStart < SUPPLIERS.length) {
    // Fire-and-forget next batch
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    fetch(`${supabaseUrl}/functions/v1/scrape-supplier-prices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ batch: batch + 1 }),
    }).catch((err) => console.error("Failed to trigger next batch:", err));
  }

  return new Response(
    JSON.stringify({
      success: true,
      batch,
      suppliers_scraped: totalSuppliers,
      products_matched: totalProducts,
      errors_count: errors.length,
      has_next_batch: nextBatchStart < SUPPLIERS.length,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
