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
  "Semaglutide (Wegovy) – 1.7mg/week",
  "Semaglutide (Wegovy) – 2.4mg/week maintenance",
  "Tirzepatide (Mounjaro) – 2.5mg/week starter",
  "Tirzepatide (Mounjaro) – 5mg/week",
  "Tirzepatide (Mounjaro) – 7.5mg/week",
  "Tirzepatide (Mounjaro) – 10mg/week",
  "Tirzepatide (Mounjaro) – 12.5mg/week",
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
  "Cholesterol & Lipid Panel",
  "Vitamin D Test",
];

type SupplierConfig = {
  name: string;
  url: string;
  category: "medication" | "bloodwork";
  scrapePaths?: string[];
  /** Shopify stores expose /products/{handle}.json — use this for deterministic variant pricing */
  shopifyProductHandles?: string[];
};

const SUPPLIERS: SupplierConfig[] = [
  { name: "Simple Online Pharmacy", url: "https://www.simpleonlinepharmacy.co.uk", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "Boots Online Doctor", url: "https://onlinedoctor.boots.com", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "LloydsDirect", url: "https://onlinedoctor.lloydspharmacy.com", category: "medication", scrapePaths: ["/uk/weight-loss/mounjaro", "/uk/weight-loss/wegovy"] },
  { name: "Superdrug Online Doctor", url: "https://onlinedoctor.superdrug.com", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "Click Pharmacy", url: "https://www.clickpharmacy.co.uk", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "MedExpress", url: "https://www.medexpress.co.uk", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "Morrisons Clinic", url: "https://clinic.morrisons.com", category: "medication" },
  { name: "Bolt Pharmacy", url: "https://www.boltpharmacy.co.uk", category: "medication", scrapePaths: ["/wegovy", "/mounjaro"] },
  { name: "Pharmacy Planet", url: "https://www.pharmacyplanet.com", category: "medication" },
  { name: "Asda Online Doctor", url: "https://onlinedoctor.asda.com", category: "medication" },
  { name: "Oxford Online Pharmacy", url: "https://www.oxfordonlinepharmacy.co.uk", category: "medication" },
  { name: "MedicSpot", url: "https://www.medicspot.co.uk", category: "medication" },
  { name: "Lotus Weight Loss", url: "https://www.lotusweightloss.co.uk", category: "medication", shopifyProductHandles: ["wegovy", "mounjaro"] },
  { name: "Manual", url: "https://www.manual.co", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "Numan", url: "https://www.numan.com", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "PillTime", url: "https://www.pilltime.co.uk", category: "medication" },
  { name: "Zava", url: "https://www.zavamed.com/uk", category: "medication", scrapePaths: ["/weight-loss.html"] },
  { name: "Treated.com", url: "https://www.treated.com", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "Juniper", url: "https://www.juniper.clinic", category: "medication" },
  { name: "UK Meds", url: "https://www.ukmedication.co.uk", category: "medication", scrapePaths: ["/weight-loss/weight-loss-medications"] },
  { name: "Pharmacy2U", url: "https://www.pharmacy2u.co.uk", category: "medication" },
  { name: "Hey Pharmacist", url: "https://www.heypharmacist.co.uk", category: "medication" },
  { name: "HealthExpress", url: "https://www.healthexpress.co.uk", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "Pharmica", url: "https://www.pharmica.co.uk", category: "medication", scrapePaths: ["/weight-loss"] },
  { name: "Medichecks", url: "https://www.medichecks.com", category: "bloodwork", scrapePaths: ["/blood-tests"] },
  { name: "Forth", url: "https://www.forthwithlife.co.uk", category: "bloodwork", scrapePaths: ["/health-tests"] },
  { name: "Thriva", url: "https://thriva.co", category: "bloodwork" },
  { name: "Blue Crest Wellness", url: "https://www.bluecrestwellness.com", category: "bloodwork" },
  { name: "Randox Health", url: "https://www.randox.com", category: "bloodwork" },
  { name: "Numan", url: "https://www.numan.com", category: "bloodwork", scrapePaths: ["/diagnostics"] },
  { name: "Manual", url: "https://www.manual.co", category: "bloodwork" },
  { name: "LetsGetChecked", url: "https://www.letsgetchecked.com", category: "bloodwork" },
  { name: "London Medical Laboratory", url: "https://www.londonmedicallaboratory.com", category: "bloodwork" },
  { name: "Monitor My Health", url: "https://www.monitormyhealth.org.uk", category: "bloodwork" },
  { name: "Blue Horizon", url: "https://bluehorizonbloodtests.co.uk", category: "bloodwork" },
  { name: "Home2Lab", url: "https://home2lab.co.uk", category: "bloodwork" },
  { name: "Vitall", url: "https://www.vitall.co.uk", category: "bloodwork" },
  { name: "Melio", url: "https://www.melio.co.uk", category: "bloodwork" },
];

// Maximum allowed price change ratio before flagging
const MAX_PRICE_CHANGE_RATIO = 0.40;

/* ── Shopify variant → canonical product mapping ──
   Maps Shopify option values to our canonical product names.
   Only matches "1 Month (1 Pen)" supply variants (lowest unit). */

const SHOPIFY_VARIANT_MAP: Record<string, Record<string, string>> = {
  wegovy: {
    "0.25mg": "Semaglutide (Wegovy) – 0.25mg/week starter",
    "0.5mg": "Semaglutide (Wegovy) – 0.5mg/week",
    "1mg": "Semaglutide (Wegovy) – 1mg/week",
    "1.7mg": "Semaglutide (Wegovy) – 1.7mg/week",
    "2.4mg": "Semaglutide (Wegovy) – 2.4mg/week maintenance",
  },
  mounjaro: {
    "2.5mg": "Tirzepatide (Mounjaro) – 2.5mg/week starter",
    "5mg": "Tirzepatide (Mounjaro) – 5mg/week",
    "7.5mg": "Tirzepatide (Mounjaro) – 7.5mg/week",
    "10mg": "Tirzepatide (Mounjaro) – 10mg/week",
    "12.5mg": "Tirzepatide (Mounjaro) – 12.5mg/week",
    "15mg": "Tirzepatide (Mounjaro) – 15mg/week",
  },
};

/** Deterministic extraction from Shopify product JSON API — no AI needed */
async function extractShopifyPrices(
  supplier: SupplierConfig
): Promise<ExtractedPrice[]> {
  if (!supplier.shopifyProductHandles) return [];

  const results: ExtractedPrice[] = [];

  for (const handle of supplier.shopifyProductHandles) {
    const jsonUrl = `${supplier.url}/products/${handle}.json`;
    try {
      const res = await fetch(jsonUrl, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        console.error(`Shopify JSON error for ${jsonUrl}: ${res.status}`);
        await res.text(); // consume body
        continue;
      }

      const data = await res.json();
      const product = data?.product;
      if (!product?.variants) continue;

      const doseMap = SHOPIFY_VARIANT_MAP[handle] || {};
      const productUrl = `${supplier.url}/products/${handle}`;

      for (const variant of product.variants) {
        // Only match "1 Month (1 Pen)" supply option (lowest unit price)
        const option1 = (variant.option1 || "").toLowerCase();
        if (!option1.includes("1 month") && !option1.includes("1 pen")) continue;

        const dose = variant.option2 || "";
        const canonicalName = doseMap[dose];
        if (!canonicalName) continue;

        const price = parseFloat(variant.price);
        if (isNaN(price) || price <= 0) continue;

        results.push({
          product_name: canonicalName,
          variant_matched: `${variant.option1} / ${dose} (Shopify variant ID: ${variant.id})`,
          price,
          url: productUrl,
          in_stock: variant.available !== false,
          confidence: "high",
          extraction_note: `Deterministic extraction from Shopify product JSON API: ${jsonUrl}`,
        });
      }

      console.log(`  → Shopify API: ${results.length} variants matched from ${handle}`);
    } catch (err) {
      console.error(`Shopify JSON fetch error for ${jsonUrl}:`, err);
    }
  }

  return results;
}

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
          waitFor: 5000,
        }),
      });

      if (!res.ok) {
        console.error(`Firecrawl error for ${url}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const md = data?.data?.markdown || data?.markdown || "";
      if (md) allMarkdown.push(`[SOURCE URL: ${url}]\n\n${md}`);
    } catch (err) {
      console.error(`Scrape failed for ${url}:`, err);
    }
  }

  return allMarkdown.length > 0 ? allMarkdown.join("\n\n---\n\n") : null;
}

type ExtractedPrice = {
  product_name: string;
  variant_matched: string;
  price: number;
  url: string;
  in_stock: boolean;
  confidence: "high" | "low";
  extraction_note: string;
};

async function extractPrices(
  markdown: string,
  supplier: SupplierConfig,
  lovableApiKey: string
): Promise<ExtractedPrice[]> {
  const products =
    supplier.category === "medication" ? MEDICATION_PRODUCTS : BLOODWORK_PRODUCTS;

  const systemPrompt = `You are a variant-aware price extraction engine. You will receive scraped content from "${supplier.name}" (${supplier.url}).

TASK: Extract prices for ONLY these exact products:

${products.map((p, i) => `${i + 1}. ${p}`).join("\n")}

CRITICAL VARIANT MATCHING RULES:
1. Many supplier pages list ONE product with MULTIPLE variants (dose strengths, pack sizes, supply lengths).
2. You MUST identify ALL variant selectors on the page (dose dropdowns, pack size options, starter/maintenance labels, supply length choices).
3. Build a mental map of {variant → price} BEFORE matching to our product list.
4. Match each canonical product to the SPECIFIC variant by dose/strength:
   - "0.25mg/week starter" → match ONLY the 0.25mg dose variant, typically 1-month/1-pen supply
   - "0.5mg/week" → match ONLY the 0.5mg dose variant
   - "1mg/week" → match ONLY the 1mg dose variant
   - etc.
5. NEVER use the default/first visible price on the page — it often corresponds to a different variant.
6. If a page shows a single price without clear variant breakdown, set confidence to "low".
7. If you can clearly match dose AND the price is explicitly tied to that dose, set confidence to "high".

PRICE RULES:
- Prices MUST be in GBP (£)
- Use the LOWEST supply option price (1 month / 1 pen) unless the canonical name specifies otherwise
- "starter" products = initial/lowest dose, 1-month supply
- If marked "out of stock", "unavailable", or "coming soon", set in_stock to false
- If you cannot confidently match a product to a specific variant price, DO NOT include it

OUTPUT FORMAT — return a JSON array:
[{
  "product_name": "exact canonical name from list",
  "variant_matched": "description of which variant/option you matched, e.g. '0.25mg dose, 1 month supply'",
  "price": 104.99,
  "url": "direct product page URL",
  "in_stock": true,
  "confidence": "high",
  "extraction_note": "brief note on how you identified this price"
}]

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
            content: `Here is the scraped content from ${supplier.name}:\n\n${markdown.slice(0, 20000)}`,
          },
        ],
        temperature: 0.05,
      }),
    });

    if (!res.ok) {
      console.error(`AI extraction failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "";

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
        p.price < 10000 &&
        (p.confidence === "high" || p.confidence === "low")
    );
  } catch (err) {
    console.error(`AI extraction error for ${supplier.name}:`, err);
    return [];
  }
}

// Fetch most recent stored prices for a supplier to compare against
async function getExistingPrices(
  supabase: ReturnType<typeof createClient>,
  supplierName: string
): Promise<Map<string, number>> {
  const { data } = await supabase
    .from("supplier_prices")
    .select("product_name, price, scraped_at")
    .eq("supplier_name", supplierName)
    .order("scraped_at", { ascending: false })
    .limit(50);

  const priceMap = new Map<string, number>();
  if (data) {
    for (const row of data) {
      // Only keep the most recent price per product
      if (!priceMap.has(row.product_name)) {
        priceMap.set(row.product_name, row.price);
      }
    }
  }
  return priceMap;
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

  let batch = 0;
  let dryRun = false;
  try {
    const body = await req.json();
    batch = body?.batch ?? 0;
    dryRun = body?.dry_run === true;
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
  const warnings: { supplier: string; product: string; old_price: number; new_price: number; change_pct: string }[] = [];
  const dryRunResults: ExtractedPrice[] = [];
  let totalSuppliers = 0;
  let totalProducts = 0;

  for (const supplier of batchSuppliers) {
    try {
      console.log(`[Batch ${batch}] Scraping ${supplier.name}...`);

      let prices: ExtractedPrice[];

      // Use deterministic Shopify API extraction when available
      if (supplier.shopifyProductHandles && supplier.shopifyProductHandles.length > 0) {
        console.log(`  → Using Shopify product JSON API for ${supplier.name}`);
        prices = await extractShopifyPrices(supplier);
        totalSuppliers++;
      } else {
        // Fallback to Firecrawl + AI extraction
        const markdown = await scrapeSupplier(supplier, firecrawlKey);

        if (!markdown) {
          errors.push({ supplier: supplier.name, error: "No content scraped" });
          continue;
        }

        totalSuppliers++;
        prices = await extractPrices(markdown, supplier, lovableApiKey);
      }
      console.log(`  → Extracted ${prices.length} prices from ${supplier.name}`);

      // Log all extractions with their confidence and variant info
      for (const p of prices) {
        console.log(`    [${p.confidence}] ${p.product_name} → £${p.price} (variant: ${p.variant_matched})`);
      }

      if (dryRun) {
        dryRunResults.push(...prices.map(p => ({ ...p, url: p.url || supplier.url })));
        continue;
      }

      // Filter to high-confidence only for DB writes
      const highConfidence = prices.filter(p => p.confidence === "high");
      const lowConfidence = prices.filter(p => p.confidence === "low");

      if (lowConfidence.length > 0) {
        console.log(`  ⚠ Skipping ${lowConfidence.length} low-confidence prices from ${supplier.name}`);
        for (const lc of lowConfidence) {
          console.log(`    SKIPPED: ${lc.product_name} → £${lc.price} (${lc.extraction_note})`);
        }
      }

      if (highConfidence.length > 0) {
        // Get existing prices for guardrail comparison
        const existingPrices = await getExistingPrices(supabase, supplier.name);

        const rowsToInsert: {
          category: string;
          product_name: string;
          supplier_name: string;
          price: number;
          url: string;
          in_stock: boolean;
          scraped_at: string;
        }[] = [];

        for (const p of highConfidence) {
          const oldPrice = existingPrices.get(p.product_name);

          // Price change guardrail: reject if >40% change from last known price
          if (oldPrice !== undefined && oldPrice > 0) {
            const changeRatio = Math.abs(p.price - oldPrice) / oldPrice;
            if (changeRatio > MAX_PRICE_CHANGE_RATIO) {
              const changePct = (changeRatio * 100).toFixed(1);
              console.warn(
                `  🚫 REJECTED ${supplier.name} / ${p.product_name}: ` +
                `£${oldPrice} → £${p.price} (${changePct}% change exceeds ${MAX_PRICE_CHANGE_RATIO * 100}% threshold)`
              );
              warnings.push({
                supplier: supplier.name,
                product: p.product_name,
                old_price: oldPrice,
                new_price: p.price,
                change_pct: `${changePct}%`,
              });
              continue;
            }
          }

          rowsToInsert.push({
            category: supplier.category,
            product_name: p.product_name,
            supplier_name: supplier.name,
            price: p.price,
            url: p.url || supplier.url,
            in_stock: p.in_stock,
            scraped_at: scrapedAt,
          });
        }

        if (rowsToInsert.length > 0) {
          const { error: insertErr } = await supabase.from("supplier_prices").insert(rowsToInsert);
          if (insertErr) {
            console.error(`Insert error for ${supplier.name}:`, insertErr);
            errors.push({ supplier: supplier.name, error: insertErr.message });
          } else {
            totalProducts += rowsToInsert.length;
          }
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

  // In dry-run mode, return results without writing to DB
  if (dryRun) {
    return new Response(
      JSON.stringify({
        success: true,
        dry_run: true,
        batch,
        suppliers_scraped: totalSuppliers,
        extractions: dryRunResults,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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
      warnings_count: warnings.length,
      price_change_warnings: warnings,
      has_next_batch: nextBatchStart < SUPPLIERS.length,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
