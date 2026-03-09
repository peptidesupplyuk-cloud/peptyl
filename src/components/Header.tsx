import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingBag, LogOut, Heart, Zap, FileText, BookOpen, Store, Info, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

const ADMIN_EMAIL = "peptidesupplyuk@gmail.com";

const BASE_NAV_ITEMS = [
  { labelKey: "nav.myHealth", href: "/dashboard", icon: Heart },
  { labelKey: "nav.improve", href: "/improve", icon: Zap },
  { labelKey: "nav.dna", href: "/dna", dynamic: true, icon: FileText },
  { labelKey: "nav.learn", href: "/education", icon: BookOpen },
  { labelKey: "nav.shop", href: "/shop", icon: Store },
  { labelKey: "nav.about", href: "/about", icon: Info },
  { labelKey: "nav.admin", href: "/admin/dashboard", adminOnly: true, icon: Shield },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

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

  const navItems = useMemo(() =>
    BASE_NAV_ITEMS.map((item) => {
      if (item.dynamic && item.labelKey === "nav.dna") {
        if (!user) return { ...item, href: "/dna" };
        return { ...item, href: hasDnaReports ? "/dna/dashboard" : "/dna/upload" };
      }
      return item;
    }),
    [user, hasDnaReports]
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHeroPage = location.pathname === "/";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (href: string) => {
    if (href === "/improve") return location.pathname === "/improve" || location.pathname === "/calculators" || location.pathname === "/testing";
    return location.pathname === href;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      {/* Desktop floating pill nav */}
      <div className="hidden md:flex items-center gap-1 mt-3 px-2 py-1.5 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-md pointer-events-auto transition-all duration-300">
        <Link to="/" className="px-3 py-1.5 mr-1">
          <Logo size="sm" />
        </Link>

        {navItems.filter(item => !item.adminOnly || user?.email === ADMIN_EMAIL).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(item.labelKey)}
            </Link>
          );
        })}

        <div className="w-px h-6 mx-1 bg-border/50" />

        <div className="flex items-center gap-0.5">
          <LanguageToggle className="h-8 w-8" />
          <ThemeToggle className="h-8 w-8" />
        </div>

        {user ? (
          <div className="flex items-center gap-1 ml-1">
            <span className="text-xs font-medium truncate max-w-[100px] text-muted-foreground">
              {user.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button size="sm" className="shadow-brand ml-1 h-8 text-xs">
              {t("nav.signIn")}
            </Button>
          </Link>
        )}
      </div>

      {/* Mobile header */}
      <div
        className={`md:hidden w-full pointer-events-auto transition-all duration-300 ${
          scrolled
            ? "bg-card/90 backdrop-blur-xl border-b border-border shadow-sm"
            : isHeroPage
            ? "bg-transparent"
            : "bg-card/90 backdrop-blur-xl"
        } ${!scrolled && isHeroPage ? "dark-section" : ""}`}
      >
        <div className="container mx-auto px-4 h-14 flex items-center justify-between safe-area-top">
          <Link to="/">
            <Logo size="sm" inverted={!scrolled && isHeroPage} />
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 ${!scrolled && isHeroPage ? "text-primary-foreground" : "text-foreground"}`}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card/95 backdrop-blur-xl border-b border-border max-h-[calc(100dvh-3.5rem)] overflow-y-auto"
            >
              <nav className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
                {navItems.filter(item => !item.adminOnly || user?.email === ADMIN_EMAIL).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 ${
                        isActive(item.href)
                          ? "text-primary bg-accent"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t(item.labelKey)}
                    </Link>
                  );
                })}
                <div className="px-3 py-2 flex items-center gap-2">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
                {user ? (
                  <button
                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors text-left flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> {t("nav.signOut")}
                  </button>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button className="mt-2 shadow-brand w-full">{t("nav.signIn")}</Button>
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
