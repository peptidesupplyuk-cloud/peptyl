import { LayoutDashboard, FlaskConical, CalendarDays, User, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { value: "overview", label: "Today", icon: LayoutDashboard },
  { value: "protocols", label: "Protocols", icon: FlaskConical },
  { value: "results", label: "Results", icon: BarChart3 },
  { value: "injections", label: "Tracker", icon: CalendarDays },
  { value: "profile", label: "Profile", icon: User },
];

const MobileTabNav = ({ activeTab, onTabChange }: Props) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 safe-area-bottom">
      {/* Floating glass pill */}
      <div
        className="relative rounded-2xl border border-border/50 p-1"
        style={{
          background: "var(--gradient-glass)",
          backdropFilter: "blur(20px) saturate(1.8)",
          WebkitBackdropFilter: "blur(20px) saturate(1.8)",
          boxShadow:
            "0 8px 32px -4px hsl(var(--navy) / 0.25), 0 0 0 0.5px hsl(var(--border) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.08)",
        }}
      >
        <div className="flex items-center justify-around py-1 px-0.5">
          {tabs.map(({ value, label, icon: Icon }) => {
            const isActive = activeTab === value;
            return (
              <motion.button
                key={value}
                onClick={() => onTabChange(value)}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {/* Active indicator glow */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="tab-glow"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      style={{
                        boxShadow: "0 0 16px hsl(var(--primary) / 0.2)",
                      }}
                    />
                  )}
                </AnimatePresence>

                <motion.div
                  animate={isActive ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="relative z-10"
                >
                  <Icon className="h-5 w-5" />
                </motion.div>

                <span className={`relative z-10 text-[9px] leading-none transition-all ${
                  isActive ? "font-bold" : "font-medium"
                }`}>
                  {label}
                </span>

                {/* Active dot */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute -top-0.5 right-1/2 translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      style={{ boxShadow: "0 0 6px hsl(var(--primary) / 0.6)" }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileTabNav;
