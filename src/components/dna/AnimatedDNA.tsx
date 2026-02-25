import { motion } from "framer-motion";

/**
 * Animated double-helix DNA graphic built with SVG + framer-motion.
 * Renders ~12 base-pairs that continuously rotate, giving a 3-D helix feel.
 */
const PAIRS = 14;
const HEIGHT = 260;
const WIDTH = 120;
const CX = WIDTH / 2;
const PAIR_GAP = HEIGHT / (PAIRS + 1);

const AnimatedDNA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative mx-auto w-[120px] h-[260px]"
    >
      {/* Soft glow behind the helix */}
      <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full scale-150 pointer-events-none" />

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="relative z-10 w-full h-full"
        fill="none"
      >
        {Array.from({ length: PAIRS }).map((_, i) => {
          const y = PAIR_GAP * (i + 1);
          // Phase offset creates the helix twist
          const phase = (i / PAIRS) * Math.PI * 2;
          const sin = Math.sin(phase);
          // x-offsets for left & right strand nodes
          const x1 = CX + sin * 36;
          const x2 = CX - sin * 36;
          // depth-based opacity (nodes in "back" are dimmer)
          const frontOpacity = 0.3 + 0.7 * ((sin + 1) / 2);
          const backOpacity = 0.3 + 0.7 * ((1 - (sin + 1) / 2));

          return (
            <motion.g
              key={i}
              animate={{ y: [0, -PAIR_GAP] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {/* Connecting bar */}
              <motion.line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="hsl(var(--primary))"
                strokeWidth={1.2}
                strokeOpacity={0.15}
              />
              {/* Left strand node */}
              <motion.circle
                cx={x1}
                cy={y}
                r={3.5}
                fill="hsl(var(--primary))"
                opacity={frontOpacity}
                animate={{
                  cx: [
                    CX + Math.sin(phase) * 36,
                    CX + Math.sin(phase + Math.PI * 2) * 36,
                  ],
                  opacity: [
                    frontOpacity,
                    frontOpacity,
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              {/* Right strand node */}
              <motion.circle
                cx={x2}
                cy={y}
                r={3.5}
                fill="hsl(var(--primary))"
                opacity={backOpacity}
                animate={{
                  cx: [
                    CX - Math.sin(phase) * 36,
                    CX - Math.sin(phase + Math.PI * 2) * 36,
                  ],
                  opacity: [
                    backOpacity,
                    backOpacity,
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.g>
          );
        })}

        {/* Left strand path */}
        <motion.path
          d={Array.from({ length: PAIRS })
            .map((_, i) => {
              const y = PAIR_GAP * (i + 1);
              const phase = (i / PAIRS) * Math.PI * 2;
              const x = CX + Math.sin(phase) * 36;
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ")}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeOpacity={0.4}
          strokeLinecap="round"
          fill="none"
          animate={{ pathLength: [0, 1] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Right strand path */}
        <motion.path
          d={Array.from({ length: PAIRS })
            .map((_, i) => {
              const y = PAIR_GAP * (i + 1);
              const phase = (i / PAIRS) * Math.PI * 2;
              const x = CX - Math.sin(phase) * 36;
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ")}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeOpacity={0.4}
          strokeLinecap="round"
          fill="none"
          animate={{ pathLength: [0, 1] }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
    </motion.div>
  );
};

export default AnimatedDNA;
