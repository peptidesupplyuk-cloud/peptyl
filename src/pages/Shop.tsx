import { useState } from "react";
import { ExternalLink, Star, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { useSupportProducts } from "@/hooks/use-support-products";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_ICONS: Record<string, string> = {
  NAC: "🛡️",
  "Magnesium Glycinate": "🌙",
  "Collagen Peptides": "✨",
  Glycine: "😴",
  "Omega-3": "🐟",
  Creatine: "💪",
  Berberine: "🍃",
  CoQ10: "⚡",
  Nattokinase: "❤️",
};

const Shop = () => {
  const { t } = useTranslation();
  const { data: products, isLoading } = useSupportProducts();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const categories = products
    ? [...new Set(products.map((p) => p.category))]
    : [];

  const filtered = products?.filter((p) => {
    const matchesCat = !activeCategory || p.category === activeCategory;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Support Layer — Recommended Supplements"
        description="Curated supplements to support your peptide protocols. Independently reviewed and community-rated."
        path="/shop"
      />
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Support <span className="text-gradient-teal">Layer</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Curated supplements that complement your protocols. We earn a small commission on purchases — it helps keep Peptyl free.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search supplements…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                !activeCategory
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {CATEGORY_ICONS[cat] || "💊"} {cat}
              </button>
            ))}
          </div>

          {/* Product grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((product, i) => (
                <motion.a
                  key={product.id}
                  href={product.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group bg-card rounded-2xl border border-border p-5 hover:border-primary/30 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {CATEGORY_ICONS[product.category] || "💊"} {product.category}
                    </Badge>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <h3 className="font-heading font-semibold text-foreground text-sm leading-snug mb-2">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-auto">
                    {product.rating && (
                      <span className="flex items-center gap-1 text-xs text-foreground">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        {product.rating}
                      </span>
                    )}
                    {product.review_count && (
                      <span className="text-[10px] text-muted-foreground">
                        {product.review_count} reviews
                      </span>
                    )}
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No products match your search.</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-10 bg-muted/30 rounded-2xl border border-border p-5 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Disclosure:</strong> Links on this page are affiliate links. Peptyl earns a small commission at no extra cost to you. All products are independently selected based on community feedback and research relevance. This is not medical advice.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
