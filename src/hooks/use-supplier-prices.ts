import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/suppliers";
import { medicationProducts, bloodworkProducts } from "@/data/suppliers";

type SupplierPriceRow = {
  product_name: string;
  supplier_name: string;
  price: number;
  url: string;
  in_stock: boolean;
  scraped_at: string;
};

function buildProducts(rows: SupplierPriceRow[]): Product[] {
  // De-duplicate: keep only the latest entry per product+supplier combo
  const latest = new Map<string, SupplierPriceRow>();
  for (const row of rows) {
    const key = `${row.product_name}|||${row.supplier_name}`;
    const existing = latest.get(key);
    if (!existing || new Date(row.scraped_at) > new Date(existing.scraped_at)) {
      latest.set(key, row);
    }
  }

  const grouped = new Map<string, Product>();
  for (const row of latest.values()) {
    if (!grouped.has(row.product_name)) {
      grouped.set(row.product_name, { name: row.product_name, prices: [] });
    }
    grouped.get(row.product_name)!.prices.push({
      supplier: row.supplier_name,
      price: row.price,
      url: row.url,
      inStock: row.in_stock,
    });
  }

  return Array.from(grouped.values());
}

export function useSupplierPrices(category: "medication" | "bloodwork") {
  const fallback = category === "medication" ? medicationProducts : bloodworkProducts;

  const { data, isLoading, error } = useQuery({
    queryKey: ["supplier-prices", category],
    queryFn: async () => {
      // Get the latest scrape timestamp
      const { data: latestScrape } = await (supabase as any)
        .from("supplier_prices")
        .select("scraped_at")
        .eq("category", category)
        .order("scraped_at", { ascending: false })
        .limit(1)
        .single();

      if (!latestScrape?.scraped_at) return null;

      const latestTime = new Date(latestScrape.scraped_at);
      // Go back 30 minutes to capture all batches from the same scrape run
      const windowStart = new Date(latestTime.getTime() - 30 * 60 * 1000).toISOString();

      // Get all prices from the scrape run window
      const { data: prices, error } = await (supabase as any)
        .from("supplier_prices")
        .select("product_name, supplier_name, price, url, in_stock, scraped_at")
        .eq("category", category)
        .gte("scraped_at", windowStart);

      if (error) throw error;
      return {
        products: buildProducts(prices || []),
        scrapedAt: latestScrape.scraped_at as string,
      };
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  return {
    products: data?.products && data.products.length > 0 ? data.products : fallback,
    lastUpdated: data?.scrapedAt || null,
    isLive: !!data?.products && data.products.length > 0,
    isLoading,
    error,
  };
}
