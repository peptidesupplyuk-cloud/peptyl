import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  className?: string;
  children?: React.ReactNode;
  /** Add ambient glow behind the card */
  glow?: boolean;
  /** Delay for stagger animation (seconds) */
  delay?: number;
  onClick?: () => void;
}

/**
 * Premium card with scroll-triggered entrance animation, 
 * subtle hover lift, and optional ambient glow.
 */
const PremiumCard = ({ className, children, glow = false, delay = 0, onClick }: PremiumCardProps) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 16, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
        delay,
      }}
      whileHover={prefersReduced ? {} : {
        y: -2,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border border-border bg-card text-card-foreground overflow-hidden",
        className
      )}
      style={{
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Ambient glow */}
      {glow && (
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none opacity-40 blur-3xl"
          style={{ background: "hsl(var(--primary) / 0.15)" }}
        />
      )}
      {children}
    </motion.div>
  );
};

export default PremiumCard;
