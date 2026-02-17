import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SupportProduct = {
  id: string;
  name: string;
  category: string;
  affiliate_url: string;
  rating: number | null;
  review_count: string | null;
  description: string | null;
  tags: string[];
  sort_order: number;
};

export const useSupportProducts = () =>
  useQuery({
    queryKey: ["support-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_products")
        .select("id, name, category, affiliate_url, rating, review_count, description, tags, sort_order")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as SupportProduct[];
    },
    staleTime: 1000 * 60 * 10,
  });
