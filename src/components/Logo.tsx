import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  inverted?: boolean;
  hideTagline?: boolean;
}

const Logo = ({ className, size = "md", variant = "full", inverted = false, hideTagline = false }: LogoProps) => {
  const sizes = {
    sm: { icon: 28, text: "text-lg" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 48, text: "text-3xl" },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex items-center min-w-0", className)}>
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span className={cn(
            "font-heading font-bold tracking-tight",
            s.text,
            "text-foreground"
          )}>
            Pept<span className="text-gradient-teal">yl</span>
            <span className="text-[0.35em] font-medium uppercase tracking-widest text-muted-foreground/50 ml-1.5 align-middle">Beta</span>
          </span>
          {!hideTagline && (
            <span className={cn(
              "text-[0.5em] font-body font-medium tracking-[0.15em] mt-0.5",
              inverted ? "text-primary-foreground/40" : "text-muted-foreground/60"
            )}>
              HEALTH OPTIMISED
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
