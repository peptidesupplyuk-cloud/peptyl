import { motion } from "framer-motion";

/**
 * Premium animated double-helix DNA graphic with 4D depth, glow effects,
 * and HiDPI-quality rendering using layered SVG filters and gradients.
 */
const PAIRS = 18;
const HEIGHT = 320;
const WIDTH = 160;
const CX = WIDTH / 2;
const PAIR_GAP = HEIGHT / (PAIRS + 1);
const RADIUS = 48;

const AnimatedDNA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative mx-auto w-[160px] h-[320px]"
    >
      {/* Multi-layer ambient glow */}
      <div className="absolute inset-0 blur-[60px] bg-primary/25 rounded-full scale-[2] pointer-events-none" />
      <div className="absolute inset-0 blur-[30px] bg-primary/15 rounded-full scale-[1.5] pointer-events-none" />

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="relative z-10 w-full h-full"
        fill="none"
        style={{ filter: "drop-shadow(0 0 12px hsl(var(--primary) / 0.3))" }}
      >
        <defs>
          {/* Radial glow for nodes */}
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>

          {/* Strand gradient for depth */}
          <linearGradient id="strandGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          </linearGradient>

          {/* Soft glow filter */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Intense glow for front nodes */}
          <filter id="nodeFilter" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base-pair rungs with depth */}
        {Array.from({ length: PAIRS }).map((_, i) => {
          const y = PAIR_GAP * (i + 1);
          const phase = (i / PAIRS) * Math.PI * 2;
          const sin = Math.sin(phase);
          const cos = Math.cos(phase);
          const x1 = CX + sin * RADIUS;
          const x2 = CX - sin * RADIUS;
          const depthFactor = (cos + 1) / 2; // 0=back, 1=front

          return (
            <motion.g
              key={i}
              animate={{ y: [0, -PAIR_GAP] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              {/* Rung connection */}
              <motion.line
                x1={x1} y1={y} x2={x2} y2={y}
                stroke="hsl(var(--primary))"
                strokeWidth={0.8 + depthFactor * 0.6}
                strokeOpacity={0.06 + depthFactor * 0.12}
                strokeLinecap="round"
              />

              {/* Left strand node — outer glow */}
              <motion.circle
                cx={x1} cy={y}
                r={5 + depthFactor * 2}
                fill="url(#nodeGlow)"
                opacity={0.15 + depthFactor * 0.25}
              />
              {/* Left strand node — core */}
              <motion.circle
                cx={x1} cy={y}
                r={2.2 + depthFactor * 1.8}
                fill="hsl(var(--primary))"
                opacity={0.25 + depthFactor * 0.75}
                filter={depthFactor > 0.5 ? "url(#nodeFilter)" : undefined}
                animate={{
                  cx: [
                    CX + Math.sin(phase) * RADIUS,
                    CX + Math.sin(phase + Math.PI * 2) * RADIUS,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />

              {/* Right strand node — outer glow */}
              <motion.circle
                cx={x2} cy={y}
                r={5 + (1 - depthFactor) * 2}
                fill="url(#nodeGlow)"
                opacity={0.15 + (1 - depthFactor) * 0.25}
              />
              {/* Right strand node — core */}
              <motion.circle
                cx={x2} cy={y}
                r={2.2 + (1 - depthFactor) * 1.8}
                fill="hsl(var(--primary))"
                opacity={0.25 + (1 - depthFactor) * 0.75}
                filter={(1 - depthFactor) > 0.5 ? "url(#nodeFilter)" : undefined}
                animate={{
                  cx: [
                    CX - Math.sin(phase) * RADIUS,
                    CX - Math.sin(phase + Math.PI * 2) * RADIUS,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </motion.g>
          );
        })}

        {/* Left strand path with gradient */}
        <motion.path
          d={Array.from({ length: PAIRS + 4 })
            .map((_, i) => {
              const idx = i - 2;
              const y = PAIR_GAP * (idx + 1);
              const phase = (idx / PAIRS) * Math.PI * 2;
              const x = CX + Math.sin(phase) * RADIUS;
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ")}
          stroke="url(#strandGradient)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#softGlow)"
          animate={{ pathLength: [0, 1] }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />

        {/* Right strand path with gradient */}
        <motion.path
          d={Array.from({ length: PAIRS + 4 })
            .map((_, i) => {
              const idx = i - 2;
              const y = PAIR_GAP * (idx + 1);
              const phase = (idx / PAIRS) * Math.PI * 2;
              const x = CX - Math.sin(phase) * RADIUS;
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ")}
          stroke="url(#strandGradient)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#softGlow)"
          animate={{ pathLength: [0, 1] }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.15 }}
        />
      </svg>
    </motion.div>
  );
};

export default AnimatedDNA;
