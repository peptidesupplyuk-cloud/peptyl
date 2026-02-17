import { ExternalLink, Star, FlaskConical, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { useSupportProducts } from "@/hooks/use-support-products";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORY_BENEFITS: Record<string, { fits: string[]; benefit: string }> = {
  NAC: {
    fits: ["Recovery", "Longevity"],
    benefit: "Powerful antioxidant that supports liver detox and glutathione production.",
  },
  "Magnesium Glycinate": {
    fits: ["Recovery", "Sleep"],
    benefit: "Highly bioavailable form that promotes deep sleep and muscle relaxation.",
  },
  "Collagen Peptides": {
    fits: ["Recovery", "Skin & Joints"],
    benefit: "Supports connective tissue repair, skin elasticity, and joint health.",
  },
  Glycine: {
    fits: ["Sleep", "Longevity"],
    benefit: "Calming amino acid that improves sleep quality and supports collagen synthesis.",
  },
  "Omega-3": {
    fits: ["Heart", "Anti-Inflammatory"],
    benefit: "High EPA/DHA for cardiovascular support and systemic inflammation control.",
  },
  Creatine: {
    fits: ["Performance", "Cognitive"],
    benefit: "Boosts muscular energy output and supports brain function under stress.",
  },
  Berberine: {
    fits: ["Metabolic", "GLP-1 Support"],
    benefit: "Activates AMPK to support healthy blood sugar and metabolic function.",
  },
  CoQ10: {
    fits: ["Energy", "Heart"],
    benefit: "Essential cofactor for cellular energy production and cardiovascular health.",
  },
  Nattokinase: {
    fits: ["Cardiovascular", "Longevity"],
    benefit: "Fibrinolytic enzyme that supports healthy circulation and blood flow.",
  },
  "L-Glutamine": {
    fits: ["Gut Health", "Recovery"],
    benefit: "Supports intestinal lining integrity and post-exercise muscle recovery.",
  },
  Zinc: {
    fits: ["Immune", "Hormonal"],
    benefit: "Essential mineral for immune function, testosterone support, and wound healing.",
  },
};

const Shop = () => {
  const { t } = useTranslation();
  const { data: products, isLoading } = useSupportProducts();

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
              Shop
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Curated products and supplements to support your protocols.
            </p>
          </div>

          <Tabs defaultValue="support" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="coming-soon" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Coming Soon
              </TabsTrigger>
              <TabsTrigger value="support" className="gap-2">
                <FlaskConical className="h-4 w-4" />
                Support Layer
              </TabsTrigger>
            </TabsList>

            {/* Coming Soon Tab */}
            <TabsContent value="coming-soon">
              <div className="text-center py-20 space-y-3">
                <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto" />
                <h2 className="text-lg font-heading font-semibold text-foreground">
                  Peptyl Store — Coming Soon
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Supplies, kits, and research accessories curated for the community. Stay tuned.
                </p>
              </div>
            </TabsContent>

            {/* Support Layer Tab */}
            <TabsContent value="support">
              <p className="text-sm text-muted-foreground mb-6">
                Supplements that complement your research protocols. We earn a small commission on purchases — it helps keep Peptyl free.
              </p>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-56 rounded-2xl" />
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product, i) => {
                    const meta = CATEGORY_BENEFITS[product.category];
                    return (
                      <motion.a
                        key={product.id}
                        href={product.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="group bg-card rounded-2xl border border-border p-5 hover:border-primary/30 transition-all hover:shadow-md flex flex-col"
                      >
                        {/* Category + link icon */}
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            {product.category}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Name */}
                        <h3 className="font-heading font-semibold text-foreground text-sm leading-snug mb-2">
                          {product.name}
                        </h3>

                        {/* Benefit */}
                        {meta?.benefit && (
                          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                            {meta.benefit}
                          </p>
                        )}

                        {/* Fits badges */}
                        {meta?.fits && meta.fits.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {meta.fits.map((fit) => (
                              <Badge
                                key={fit}
                                variant="secondary"
                                className="text-[10px] font-medium"
                              >
                                {fit}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Rating */}
                        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border">
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
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No products available yet.</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-10 bg-muted/30 rounded-2xl border border-border p-5 text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Disclosure:</strong> Links on this page are affiliate links. Peptyl earns a small commission at no extra cost to you. All products are independently selected based on community feedback and research relevance. This is not medical advice.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
