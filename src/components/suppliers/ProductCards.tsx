import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/suppliers";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

const ProductCards = ({ products }: { products: Product[] }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-muted-foreground font-medium">No pricing data available.</p>
        <p className="text-sm text-muted-foreground">Prices will appear here once they have been added to the database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {products.map((product, i) => {
        const inStockPrices = product.prices.filter(p => p.inStock);
        const lowest = inStockPrices.length > 0 ? Math.min(...inStockPrices.map(p => p.price)) : null;
        return (
          <motion.div
            key={product.name}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="p-5 sm:p-6 border-b border-border bg-muted/30">
              <h3 className="font-heading font-semibold text-foreground text-lg">{product.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {product.prices.length} suppliers · Best price:{" "}
                <span className="text-primary font-semibold">
                  {lowest !== null ? `£${lowest.toFixed(2)}` : "—"}
                </span>
              </p>
            </div>
            <div className="divide-y divide-border">
              {product.prices.map((entry, j) => {
                const isBest = entry.inStock && lowest !== null && entry.price === lowest;
                return (
                  <div
                    key={`${entry.supplier}-${j}`}
                    className={`flex items-center justify-between px-5 sm:px-6 py-4 gap-4 ${isBest ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-medium text-sm text-foreground truncate">{entry.supplier}</span>
                      {isBest && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] shrink-0">Best Price</Badge>
                      )}
                      {!entry.inStock && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">Out of Stock</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`font-semibold text-sm ${entry.inStock ? "text-foreground" : "text-muted-foreground line-through"}`}>
                        £{entry.price.toFixed(2)}
                      </span>
                      <a href={entry.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductCards;
