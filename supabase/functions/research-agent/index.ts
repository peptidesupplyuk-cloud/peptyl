import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const NCBI_API_KEY = Deno.env.get("NCBI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const SEARCH_TERMS = [
  "BPC-157 peptide",
  "TB-500 Thymosin Beta-4",
  "Ipamorelin growth hormone",
  "Sermorelin GHRH",
  "Semax BDNF",
  "Epitalon telomerase",
  "TA-1 Thymosin Alpha-1",
  "MOTS-c mitochondrial peptide",
  "SS-31 Elamipretide",
  "Kisspeptin GnRH",
  "peptide senolytic Fisetin",
  "NMN NAD precursor longevity",
  "MTHFR methylfolate supplementation",
];

const DEFAULT_DAYS_BACK = 7;

async function fetchPubMedArticles(searchTerm: string): Promise<any[]> {
  const today = new Date();
  const past = new Date(today.getTime() - DAYS_BACK * 24 * 60 * 60 * 1000);
  const dateFilter = `${past.toISOString().split("T")[0]}[PDAT]:${today.toISOString().split("T")[0]}[PDAT]`;
  const query = encodeURIComponent(`${searchTerm} AND ${dateFilter}`);
  const apiKeyParam = NCBI_API_KEY ? `&api_key=${NCBI_API_KEY}` : "";
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmax=5&retmode=json${apiKeyParam}`;

  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const ids: string[] = searchData?.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(",")}&retmode=xml${apiKeyParam}`;
  const fetchRes = await fetch(fetchUrl);
  const xml = await fetchRes.text();

  const articles: any[] = [];
  const articleMatches = xml.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g);

  for (const match of articleMatches) {
    const articleXml = match[1];
    const pmid = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] ?? null;
    const title = articleXml.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1]?.replace(/<[^>]+>/g, "")?.trim() ?? "Unknown title";
    const abstractParts = [...articleXml.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)];
    const abstract = abstractParts.map(m => m[1].replace(/<[^>]+>/g, "")).join(" ").trim();
    const authorMatches = [...articleXml.matchAll(/<LastName>([\s\S]*?)<\/LastName>/g)];
    const authors = authorMatches.map(m => m[1].trim()).slice(0, 5);
    const pubYear = articleXml.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1];
    const pubMonth = articleXml.match(/<PubDate>[\s\S]*?<Month>(\w+)<\/Month>/)?.[1] ?? "01";
    const publishedDate = pubYear ? `${pubYear}-${pubMonth}-01` : null;
    articles.push({ pmid, title, abstract, authors, publishedDate });
  }

  return articles;
}

async function extractWithAI(article: any): Promise<any> {
  const prompt = `You are a biomedical research analyst for Peptyl, a peptide health optimisation platform.

Analyse this PubMed abstract and extract structured data. Return ONLY valid JSON, no markdown, no commentary.

Article title: ${article.title}
Abstract: ${article.abstract || "No abstract available"}

Return this exact JSON structure:
{
  "compound_names": [],
  "gene_names": [],
  "biomarker_names": [],
  "relationship_type": "",
  "strength": "",
  "evidence_level": "",
  "dose_note": "",
  "ai_summary": "",
  "evidence_score": 0,
  "relevant": true
}

Rules:
- compound_names: peptides or supplements mentioned (e.g. "BPC-157", "NMN", "Methylfolate")
- gene_names: gene variants mentioned (e.g. "MTHFR_C677T", "APOE", "PGC1A")
- biomarker_names: biomarkers mentioned (e.g. "IGF-1", "Homocysteine", "hsCRP")
- relationship_type: one of: triggers / synergises / antagonises / contraindicated / confirms / predicts / supports / depletes / requires
- strength: one of: strong / moderate / weak
- evidence_level: one of: rct / meta_analysis / observational / mechanistic / expert_consensus
- dose_note: any dosing information mentioned, or empty string
- ai_summary: 2-3 sentence plain English summary of the finding relevant to peptide/supplement users
- evidence_score: integer 1-5 (1=anecdotal, 3=observational, 5=RCT/meta-analysis)
- relevant: false if not relevant to peptides, supplements, or longevity biomarkers

If a field has no data, use empty array [] or empty string "".`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      max_tokens: 800,
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    console.error("AI gateway error:", res.status, await res.text());
    return { relevant: false };
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "{}";

  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { relevant: false };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const results = {
    searched: 0,
    fetched: 0,
    inserted: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const term of SEARCH_TERMS) {
    results.searched++;

    try {
      const articles = await fetchPubMedArticles(term);
      results.fetched += articles.length;

      for (const article of articles) {
        if (!article.pmid) continue;

        // Skip duplicates
        const { data: existing } = await supabase
          .from("research_queue")
          .select("id")
          .eq("pubmed_id", article.pmid)
          .maybeSingle();

        if (existing) {
          results.skipped++;
          continue;
        }

        // Extract via AI
        const extracted = await extractWithAI(article);

        if (!extracted.relevant) {
          results.skipped++;
          continue;
        }

        const { error } = await supabase.from("research_queue").insert({
          pubmed_id: article.pmid,
          title: article.title,
          abstract: article.abstract,
          authors: article.authors,
          published_date: article.publishedDate,
          source_url: `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
          compound_names: extracted.compound_names ?? [],
          gene_names: extracted.gene_names ?? [],
          biomarker_names: extracted.biomarker_names ?? [],
          relationship_type: extracted.relationship_type ?? null,
          strength: extracted.strength ?? null,
          evidence_level: extracted.evidence_level ?? null,
          dose_note: extracted.dose_note ?? null,
          ai_summary: extracted.ai_summary ?? null,
          evidence_score: extracted.evidence_score ?? 3,
          status: "pending",
        });

        if (error) {
          results.errors.push(`PMID ${article.pmid}: ${error.message}`);
        } else {
          results.inserted++;
        }

        // Rate limiting for AI calls
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (err: any) {
      results.errors.push(`Term "${term}": ${err.message}`);
    }

    // Rate limiting between PubMed searches
    await new Promise(r => setTimeout(r, 1000));
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
