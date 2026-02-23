import { Star, ShoppingBag, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useSupportProducts } from "@/hooks/use-support-products";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_BENEFITS: Record<string, { fits: string[]; benefit: string }> = {
  NAC: { fits: ["Recovery", "Longevity"], benefit: "Powerful antioxidant that supports liver detox and glutathione production." },
  "Magnesium Glycinate": { fits: ["Recovery", "Sleep"], benefit: "Highly bioavailable form that promotes deep sleep and muscle relaxation." },
  "Collagen Peptides": { fits: ["Recovery", "Skin & Joints"], benefit: "Supports connective tissue repair, skin elasticity, and joint health." },
  Glycine: { fits: ["Sleep", "Longevity"], benefit: "Calming amino acid that improves sleep quality and supports collagen synthesis." },
  "Omega-3": { fits: ["Heart", "Anti-Inflammatory"], benefit: "High EPA/DHA for cardiovascular support and systemic inflammation control." },
  Creatine: { fits: ["Performance", "Cognitive"], benefit: "Boosts muscular energy output and supports brain function under stress." },
  Berberine: { fits: ["Metabolic", "GLP-1 Support"], benefit: "Activates AMPK to support healthy blood sugar and metabolic function." },
  CoQ10: { fits: ["Energy", "Heart"], benefit: "Essential cofactor for cellular energy production and cardiovascular health." },
  Nattokinase: { fits: ["Cardiovascular", "Longevity"], benefit: "Fibrinolytic enzyme that supports healthy circulation and blood flow." },
  "L-Glutamine": { fits: ["Gut Health", "Recovery"], benefit: "Supports intestinal lining integrity and post-exercise muscle recovery." },
  Zinc: { fits: ["Immune", "Hormonal"], benefit: "Essential mineral for immune function, testosterone support, and wound healing." },
};

const ShopContent = () => {
  const { data: products, isLoading } = useSupportProducts();

  return (
    <>
      <p className="text-sm text-muted-foreground mb-6">
        Supplements that complement your research protocols. We earn a small commission on purchases, which helps keep Peptyl free.
      </p>

      {/* Coming Soon overlay */}
      <div className="relative">
        {/* Blur overlay */}
        <div className="absolute inset-0 z-10 backdrop-blur-md bg-background/40 rounded-2xl flex flex-col items-center justify-center gap-3">
          <div className="bg-primary/10 rounded-full p-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-heading font-bold text-xl text-foreground">Coming Soon</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm px-4">
            We're curating the best supplement picks for your research protocols. Check back soon.
          </p>
        </div>

        {/* Blurred content behind */}
        <div className="pointer-events-none select-none" aria-hidden="true">
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
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-card rounded-2xl border border-border p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">{product.category}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-foreground text-sm leading-snug mb-2">{product.name}</h3>
                    {meta?.benefit && <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{meta.benefit}</p>}
                    {meta?.fits && meta.fits.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {meta.fits.map((fit) => (
                          <Badge key={fit} variant="secondary" className="text-[10px] font-medium">{fit}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border">
                      {product.rating && (
                        <span className="flex items-center gap-1 text-xs text-foreground">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> {product.rating}
                        </span>
                      )}
                      {product.review_count && (
                        <span className="text-[10px] text-muted-foreground">{product.review_count} reviews</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-5 h-56" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 bg-muted/30 rounded-2xl border border-border p-5 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Disclosure:</strong> Links on this page are affiliate links. Peptyl earns a small commission at no extra cost to you. All products are independently selected based on community feedback and research relevance. This is not medical advice.
      </div>
    </>
  );
};

export default ShopContent;
