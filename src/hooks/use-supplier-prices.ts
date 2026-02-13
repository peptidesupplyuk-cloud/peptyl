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
  const grouped = new Map<string, Product>();

  for (const row of rows) {
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

      // Get all prices from the latest scrape
      const { data: prices, error } = await (supabase as any)
        .from("supplier_prices")
        .select("product_name, supplier_name, price, url, in_stock, scraped_at")
        .eq("category", category)
        .eq("scraped_at", latestScrape.scraped_at);

      if (error) throw error;
      return {
        products: buildProducts(prices || []),
        scrapedAt: latestScrape.scraped_at as string,
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
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
