import { useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface ReportCard {
  id: string;
  label: string;
  content: ReactNode;
}

interface Props {
  cards: ReportCard[];
}

const ReportCardNav = ({ cards }: Props) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const isTransitioning = useRef(false);

  const goTo = useCallback(
    (index: number, dir?: number) => {
      if (isTransitioning.current) return;
      if (index < 0 || index >= cards.length) return;
      isTransitioning.current = true;
      setDirection(dir ?? (index > current ? 1 : -1));
      setCurrent(index);
      setTimeout(() => {
        isTransitioning.current = false;
      }, 500);
    },
    [current, cards.length],
  );

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 50) {
      delta > 0 ? next() : prev();
    }
  };

  // Wheel (debounced)
  const wheelTimeout = useRef<ReturnType<typeof setTimeout>>();
  const onWheel = (e: React.WheelEvent) => {
    // Only trigger card nav if the inner content is not scrollable or is at boundary
    const cardEl = containerRef.current?.querySelector('[data-card-content]') as HTMLElement;
    if (cardEl) {
      const { scrollTop, scrollHeight, clientHeight } = cardEl;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
      if (e.deltaY > 0 && !atBottom) return;
      if (e.deltaY < 0 && !atTop) return;
    }
    if (wheelTimeout.current) return;
    wheelTimeout.current = setTimeout(() => {
      wheelTimeout.current = undefined;
    }, 600);
    if (e.deltaY > 30) next();
    else if (e.deltaY < -30) prev();
  };

  const variants = {
    enter: (d: number) => ({ y: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (d: number) => ({ y: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[100dvh] w-full overflow-hidden bg-background"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      {/* Card content */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={cards[current].id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.5 }}
          className="absolute inset-0 flex flex-col"
        >
          <div
            data-card-content
            className="flex-1 overflow-y-auto overscroll-contain"
          >
            <div className="min-h-full px-4 md:px-8 py-6 md:py-10 max-w-4xl mx-auto">
              {cards[current].content}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows (desktop) */}
      <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-2 z-20">
        <button
          onClick={prev}
          disabled={current === 0}
          className="p-2 rounded-full bg-card/80 backdrop-blur border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={next}
          disabled={current === cards.length - 1}
          className="p-2 rounded-full bg-card/80 backdrop-blur border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-card/80 backdrop-blur-md border border-border rounded-full px-3 py-2">
        {cards.map((card, i) => (
          <button
            key={card.id}
            onClick={() => goTo(i)}
            title={card.label}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2 bg-primary"
                : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>

      {/* Card counter */}
      <div className="absolute top-4 right-4 z-20 text-xs text-muted-foreground bg-card/80 backdrop-blur border border-border rounded-full px-3 py-1.5 font-mono">
        {current + 1} / {cards.length}
      </div>
    </div>
  );
};

export default ReportCardNav;
