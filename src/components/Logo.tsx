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
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Molecular hexagon mark */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer hexagon */}
        <path
          d="M24 2L43.5 13V35L24 46L4.5 35V13L24 2Z"
          className={inverted ? "stroke-primary-foreground" : "stroke-primary"}
          strokeWidth="2"
          fill="none"
        />
        {/* Inner molecular structure - peptide chain */}
        <circle cx="16" cy="18" r="3" className={inverted ? "fill-primary-foreground" : "fill-primary"} opacity="0.9" />
        <circle cx="32" cy="18" r="3" className={inverted ? "fill-primary-foreground" : "fill-primary"} opacity="0.9" />
        <circle cx="24" cy="30" r="3" className={inverted ? "fill-primary-foreground" : "fill-primary"} opacity="0.9" />
        {/* Bonds */}
        <line x1="18.5" y1="19.5" x2="29.5" y2="19.5" className={inverted ? "stroke-primary-foreground" : "stroke-primary"} strokeWidth="1.5" opacity="0.6" />
        <line x1="17.5" y1="20.5" x2="22.5" y2="28.5" className={inverted ? "stroke-primary-foreground" : "stroke-primary"} strokeWidth="1.5" opacity="0.6" />
        <line x1="30.5" y1="20.5" x2="25.5" y2="28.5" className={inverted ? "stroke-primary-foreground" : "stroke-primary"} strokeWidth="1.5" opacity="0.6" />
        {/* Glow dot */}
        <circle cx="24" cy="30" r="5" className={inverted ? "fill-primary-foreground" : "fill-primary"} opacity="0.15" />
      </svg>

      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span className={cn(
            "font-heading font-bold tracking-tight",
            s.text,
            "text-foreground"
          )}>
            Pep<span className="text-gradient-teal">tyl</span>
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
