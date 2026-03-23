import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Zap, Dna, BookOpen, Store, LogIn, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

const GlobalMobileNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const { data: hasDnaReports } = useQuery({
    queryKey: ["has-dna-reports", user?.id],
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const { count } = await supabase
        .from("dna_reports")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return (count ?? 0) > 0;
    },
  });

  const dnaHref = useMemo(() => {
    if (!user) return "/dna";
    return hasDnaReports ? "/dna/dashboard" : "/dna/upload";
  }, [user, hasDnaReports]);

  const tabs = useMemo(() => [
    { href: "/dashboard", label: t("nav.myHealth"), icon: Heart },
    { href: "/improve", label: t("nav.improve"), icon: Zap },
    { href: dnaHref, label: t("nav.dna"), icon: Dna },
    { href: "/education", label: t("nav.learn"), icon: BookOpen },
    { href: "/shop", label: t("nav.shop"), icon: Store },
  ], [t, dnaHref]);

  if (!isMobile) return null;

  const isActive = (href: string) => {
    if (href === "/improve") return location.pathname === "/improve" || location.pathname === "/calculators" || location.pathname === "/testing";
    if (href === "/education") return location.pathname.startsWith("/education") || location.pathname === "/glossary";
    if (href === "/shop") return location.pathname === "/shop" || location.pathname === "/suppliers";
    if (href.startsWith("/dna")) return location.pathname.startsWith("/dna");
    if (href === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div
        className="mx-2 mb-2 rounded-2xl border border-border/50 px-1 py-1"
        style={{
          background: "var(--gradient-glass, hsl(var(--card) / 0.92))",
          backdropFilter: "blur(20px) saturate(1.8)",
          WebkitBackdropFilter: "blur(20px) saturate(1.8)",
          boxShadow: "0 -4px 24px -4px hsl(var(--navy) / 0.2), 0 0 0 0.5px hsl(var(--border) / 0.3)",
        }}
      >
        <div className="flex items-center justify-around">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                to={href}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0 flex-1 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="global-tab-glow"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                </AnimatePresence>
                <Icon className="relative z-10 h-5 w-5" />
                <span className={`relative z-10 text-[9px] leading-none truncate max-w-full ${
                  active ? "font-bold" : "font-medium"
                }`}>
                  {label}
                </span>
                {href === "/dashboard" && (
                  <span className="absolute -top-0.5 -right-0.5 z-20 text-[6px] font-bold uppercase tracking-wider px-1 py-px rounded bg-primary/10 text-primary leading-none">Beta</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default GlobalMobileNav;
