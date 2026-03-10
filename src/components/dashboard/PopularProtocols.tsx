import { useState } from "react";
import { TrendingUp, Pill, FlaskConical, Shield } from "lucide-react";
import { POPULAR_PROTOCOLS, CATEGORY_LABELS, CATEGORY_COLORS, type PopularProtocol, type Recommendation } from "@/data/recommendation-rules";
import RecommendationCard from "./RecommendationCard";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  onActivate: (rec: Recommendation) => void;
  isActivating: boolean;
  disclaimerAccepted: boolean;
}

const toRecommendation = (p: PopularProtocol): Recommendation => ({
  id: p.id,
  protocolName: p.protocolName,
  goal: p.goal,
  triggerDescription: "",
  peptides: p.peptides,
  supplements: p.supplements,
  durationWeeks: p.durationWeeks,
  retestWeeks: p.retestWeeks,
  source: p.source,
});

const PopularProtocols = ({ onActivate, isActivating, disclaimerAccepted }: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<PopularProtocol["category"] | "all">("all");

  const categories = Object.keys(CATEGORY_LABELS) as PopularProtocol["category"][];

  const supplementOnly = POPULAR_PROTOCOLS.filter(p => p.peptides.length === 0);
  const peptideProtocols = POPULAR_PROTOCOLS.filter(p => p.peptides.length > 0);

  const filteredPeptide = selectedCategory === "all"
    ? peptideProtocols
    : peptideProtocols.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* ─── Supplement-Only Protocols ──────────────────────────────────────── */}
      {supplementOnly.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">Supplement Protocols</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            No injections required. Supplement stacks to support your health goals.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supplementOnly.map((protocol) => (
              <RecommendationCard
                key={protocol.id}
                recommendation={toRecommendation(protocol)}
                onActivate={onActivate}
                isActivating={isActivating}
                badge={CATEGORY_LABELS[protocol.category]}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Peptide Protocols ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <Carousel opts={{ align: "start", loop: false }} className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              <h2 className="font-heading font-semibold text-foreground">Peptide Protocols</h2>
            </div>
            <div className="flex items-center gap-1">
              <CarouselPrevious className="static translate-y-0 h-7 w-7" />
              <CarouselNext className="static translate-y-0 h-7 w-7" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Research peptide stacks with suggested supplements. Require injection equipment.
          </p>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : `${CATEGORY_COLORS[cat]} border-transparent hover:opacity-80`
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <CarouselContent className="-ml-3 mt-3">
            {filteredPeptide.map((protocol) => (
              <CarouselItem key={protocol.id} className="pl-3 basis-[85%] sm:basis-[70%] md:basis-1/2 lg:basis-[45%]">
                <RecommendationCard
                  recommendation={toRecommendation(protocol)}
                  onActivate={onActivate}
                  isActivating={isActivating}
                  badge={CATEGORY_LABELS[protocol.category]}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default PopularProtocols;
