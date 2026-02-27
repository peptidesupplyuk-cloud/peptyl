import { LayoutDashboard, Activity, FlaskConical, CalendarDays, User, BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { value: "overview", label: "Today", icon: LayoutDashboard },
  { value: "biomarkers", label: "Results", icon: Activity },
  { value: "protocols", label: "Protocols", icon: FlaskConical },
  { value: "injections", label: "Tracker", icon: CalendarDays },
  { value: "journal", label: "Journal", icon: BookOpen },
  { value: "profile", label: "Profile", icon: User },
];

const MobileTabNav = ({ activeTab, onTabChange }: Props) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around py-1.5 px-1">
        {tabs.map(({ value, label, icon: Icon }) => {
          const isActive = activeTab === value;
          return (
            <button
              key={value}
              onClick={() => onTabChange(value)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-0 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-medium leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabNav;
