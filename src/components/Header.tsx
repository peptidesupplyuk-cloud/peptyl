import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingBag, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Peptides", href: "/peptides" },
  { label: "Calculators", href: "/calculators" },
  { label: "Education", href: "/education" },
  { label: "Shop", href: "/shop" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/90 backdrop-blur-xl border-b border-border shadow-sm"
          : isHeroPage
          ? "bg-transparent"
          : "bg-card/90 backdrop-blur-xl"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/">
          <Logo size="sm" inverted={!scrolled && isHeroPage} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.href
                  ? "text-primary bg-accent"
                  : scrolled || !isHeroPage
                  ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon" className={!scrolled && isHeroPage ? "text-primary-foreground/70 hover:text-primary-foreground" : ""}>
            <ShoppingBag className="h-5 w-5" />
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium truncate max-w-[120px] ${!scrolled && isHeroPage ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className={!scrolled && isHeroPage ? "text-primary-foreground/70 hover:text-primary-foreground" : ""}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm" className="shadow-brand">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 ${!scrolled && isHeroPage ? "text-primary-foreground" : "text-foreground"}`}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border"
          >
            <nav className="container mx-auto px-6 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => { handleSignOut(); setIsOpen(false); }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors text-left flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="mt-3 shadow-brand w-full">Sign In</Button>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
