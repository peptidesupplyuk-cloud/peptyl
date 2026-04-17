import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import ReportErrorBoundary from "./ReportErrorBoundary";

export interface ReportSection {
  id: string;
  label: string;
  content: ReactNode;
}

interface Props {
  sections: ReportSection[];
}

/**
 * Mobile-first scrolling report layout.
 *
 *  - Native vertical scroll (no fragile swipe/wheel handlers).
 *  - Sticky horizontal section pills that highlight the active section.
 *  - Each section is wrapped in an error boundary so one panel crash
 *    cannot blank the whole report.
 */
const ReportScrollLayout = ({ sections }: Props) => {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const [showTop, setShowTop] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const navScrollRef = useRef<HTMLDivElement>(null);

  // Track which section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  // Show "back to top" after scrolling past hero
  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Auto-scroll the nav pill into view when active changes
  useEffect(() => {
    const nav = navScrollRef.current;
    if (!nav) return;
    const active = nav.querySelector<HTMLElement>(`[data-pill="${activeId}"]`);
    if (active) {
      const navRect = nav.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      const offset = activeRect.left - navRect.left - navRect.width / 2 + activeRect.width / 2;
      nav.scrollBy({ left: offset, behavior: "smooth" });
    }
  }, [activeId]);

  const goTo = useCallback((id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Sticky section pill nav */}
      <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div
          ref={navScrollRef}
          className="flex gap-2 overflow-x-auto px-4 md:px-8 py-3 max-w-5xl mx-auto scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {sections.map((s) => {
            const isActive = s.id === activeId;
            return (
              <button
                key={s.id}
                data-pill={s.id}
                onClick={() => goTo(s.id)}
                className={`shrink-0 text-xs md:text-sm font-medium px-3.5 py-2 rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted active:scale-95"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-12 md:space-y-16">
        {sections.map((s) => (
          <section
            key={s.id}
            id={s.id}
            ref={(el) => (sectionRefs.current[s.id] = el)}
            className="scroll-mt-24"
          >
            <ReportErrorBoundary sectionLabel={s.label}>{s.content}</ReportErrorBoundary>
          </section>
        ))}
        <div className="h-24" />
      </div>

      {/* Back-to-top */}
      {showTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-4 md:right-8 z-40 h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95"
          aria-label="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  );
};

export default ReportScrollLayout;
