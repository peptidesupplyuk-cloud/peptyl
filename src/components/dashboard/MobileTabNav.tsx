import { LayoutDashboard, FlaskConical, CalendarDays, User, BarChart3, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
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
  { value: "journal", label: "Journal", icon: BookOpen },
  { value: "profile", label: "Profile", icon: User },
];

const MobileTabNav = ({ activeTab, onTabChange }: Props) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
      {tabs.map(({ value, label, icon: Icon }) => {
        const isActive = activeTab === value;
        return (
          <button
            key={value}
            onClick={() => onTabChange(value)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
              isActive
                ? "bg-primary/15 text-primary"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="dashboard-tab-pill"
                className="absolute inset-0 rounded-full bg-primary/15"
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              />
            )}
            <Icon className="relative z-10 h-3.5 w-3.5" />
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileTabNav;
