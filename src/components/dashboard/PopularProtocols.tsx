import { useState } from "react";
import { Star, TrendingUp } from "lucide-react";
import { POPULAR_PROTOCOLS, CATEGORY_LABELS, CATEGORY_COLORS, type PopularProtocol, type Recommendation } from "@/data/recommendation-rules";
import RecommendationCard from "./RecommendationCard";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

interface Props {
  onActivate: (rec: Recommendation) => void;
  isActivating: boolean;
  disclaimerAccepted: boolean;
}

const PopularProtocols = ({ onActivate, isActivating, disclaimerAccepted }: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<PopularProtocol["category"] | "all">("all");

  const categories = Object.keys(CATEGORY_LABELS) as PopularProtocol["category"][];

  const filtered = selectedCategory === "all"
    ? POPULAR_PROTOCOLS
    : POPULAR_PROTOCOLS.filter((p) => p.category === selectedCategory);

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

  return (
    <div className="space-y-4">
      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-heading font-semibold text-foreground">Popular Protocols</h2>
          </div>
          <div className="flex items-center gap-1">
            <CarouselPrevious className="static translate-y-0 h-7 w-7" />
            <CarouselNext className="static translate-y-0 h-7 w-7" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Community-verified stacks. Tap the pencil icon to customise dosages before starting.
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
          {filtered.map((protocol) => (
            <CarouselItem key={protocol.id} className="pl-3 basis-[85%] sm:basis-[70%] md:basis-1/2 lg:basis-[45%]">
              <div className="relative h-full">
                <div className="absolute top-3 right-14 flex items-center gap-0.5 z-10">
                  {Array.from({ length: protocol.popularity }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                  ))}
                </div>
                <RecommendationCard
                  recommendation={toRecommendation(protocol)}
                  onActivate={onActivate}
                  isActivating={isActivating}
                  badge={CATEGORY_LABELS[protocol.category]}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default PopularProtocols;
