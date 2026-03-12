import { ShoppingBag, Pill, Zap, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Kept for future use — suppliers tab code lives in SuppliersContent
// import { lazy } from "react";
// const SuppliersContent = lazy(() => import("@/components/content/SuppliersContent"));

const PRODUCTS = [
  {
    name: "NAD+ At Home Kit",
    description: "Clinical-grade NAD+ self-administration kit for cellular energy and longevity support.",
    fits: ["Longevity", "Energy", "Recovery"],
    icon: Zap,
    status: "coming-soon" as const,
  },
  {
    name: "BPC-157 Capsules",
    description: "Oral BPC-157 for gut healing and systemic recovery — no injection required.",
    fits: ["Gut Health", "Recovery", "Healing"],
    icon: Pill,
    status: "coming-soon" as const,
  },
  {
    name: "GHK-Cu Topical",
    description: "Copper peptide cream for skin rejuvenation, wound healing, and collagen synthesis.",
    fits: ["Skin", "Anti-Aging", "Healing"],
    icon: Sparkles,
    status: "coming-soon" as const,
  },
  {
    name: "AHK-Cu Topical",
    description: "Advanced copper tripeptide for hair follicle support and skin repair.",
    fits: ["Hair", "Skin", "Recovery"],
    icon: Sparkles,
    status: "coming-soon" as const,
  },
  {
    name: "Many More Coming Soon",
    description: "We're curating the best research-grade products for the community. Stay tuned.",
    fits: ["Research", "Community Picks"],
    icon: Sparkles,
    status: "teaser" as const,
  },
];

const ShopHubPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Shop — Peptide & Supplement Products | Peptyl"
        description="Research-grade peptide and supplement products. NAD+ home kits, oral BPC-157, GHK-Cu topicals, and curated longevity stacks. Coming soon."
        path="/shop"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">Shop</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Curated research-grade products for your protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRODUCTS.map((product, i) => {
              const Icon = product.icon;
              return (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="relative bg-card rounded-2xl border border-border p-6 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-primary/10 rounded-xl p-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wide">
                      Coming Soon
                    </Badge>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground text-base mb-1.5">{product.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{product.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {product.fits.map((fit) => (
                      <Badge key={fit} variant="outline" className="text-[10px] font-medium">
                        {fit}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 bg-muted/30 rounded-2xl border border-border p-5 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Note:</strong> Products shown are not yet available for purchase. We're finalising partnerships to bring you the best research-grade options. Sign up to be notified when they launch.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShopHubPage;
