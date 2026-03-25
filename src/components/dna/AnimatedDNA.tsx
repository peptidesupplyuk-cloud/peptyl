import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Premium 3D DNA double-helix rendered on Canvas for buttery-smooth
 * 60fps animation with glow, depth-of-field, and HiDPI rendering.
 */
const AnimatedDNA = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const W = 200;
    const H = 280;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const CX = W / 2;
    const CY = H / 2;
    const PAIRS = 14;
    const SPACING = H / (PAIRS + 1);
    const RADIUS = 42;
    const ROTATION_SPEED = 0.008;

    // Get CSS primary color
    const style = getComputedStyle(document.documentElement);
    const primaryRaw = style.getPropertyValue("--primary").trim();
    const hslParts = primaryRaw.split(/\s+/);
    const hue = parseFloat(hslParts[0]) || 175;
    const sat = parseFloat(hslParts[1]) || 85;
    const lig = parseFloat(hslParts[2]) || 40;

    const hsl = (h: number, s: number, l: number, a = 1) =>
      `hsla(${h}, ${s}%, ${l}%, ${a})`;

    const primary = (a = 1) => hsl(hue, sat, lig, a);
    const primaryBright = (a = 1) => hsl(hue, sat, Math.min(lig + 20, 70), a);

    let t = 0;

    const draw = () => {
      t += ROTATION_SPEED;
      ctx.clearRect(0, 0, W, H);

      // Collect all renderable elements with z-depth for proper sorting
      const elements: {
        z: number;
        type: "rung" | "node";
        x1: number;
        y1: number;
        x2?: number;
        y2?: number;
        depth: number;
        side?: "left" | "right";
      }[] = [];

      for (let i = 0; i < PAIRS; i++) {
        const baseY = SPACING * (i + 1);
        const phase = t + (i / PAIRS) * Math.PI * 2;
        const sin = Math.sin(phase);
        const cos = Math.cos(phase);

        const x1 = CX + sin * RADIUS;
        const x2 = CX - sin * RADIUS;
        const depthL = (cos + 1) / 2;
        const depthR = (1 - cos + 1) / 2;

        // Rung
        elements.push({
          z: Math.min(depthL, depthR),
          type: "rung",
          x1, y1: baseY, x2, y2: baseY,
          depth: (depthL + (1 - depthL)) / 2,
        });

        // Left node
        elements.push({
          z: depthL,
          type: "node",
          x1, y1: baseY,
          depth: depthL,
          side: "left",
        });

        // Right node
        elements.push({
          z: 1 - depthL,
          type: "node",
          x1: x2, y1: baseY,
          depth: 1 - depthL,
          side: "right",
        });
      }

      // Sort back-to-front
      elements.sort((a, b) => a.z - b.z);

      // Vertical fade mask at top/bottom
      const fadeH = 40;

      for (const el of elements) {
        // Vertical edge fade
        let vertFade = 1;
        if (el.y1 < fadeH) vertFade = el.y1 / fadeH;
        else if (el.y1 > H - fadeH) vertFade = (H - el.y1) / fadeH;
        vertFade = Math.max(0, Math.min(1, vertFade));

        if (el.type === "rung" && el.x2 !== undefined && el.y2 !== undefined) {
          const rungAlpha = (0.04 + el.depth * 0.12) * vertFade;
          ctx.beginPath();
          ctx.moveTo(el.x1, el.y1);
          ctx.lineTo(el.x2, el.y2);
          ctx.strokeStyle = primary(rungAlpha);
          ctx.lineWidth = 1;
          ctx.stroke();

          // Rung midpoint dot for molecular feel
          const mx = (el.x1 + el.x2) / 2;
          const my = (el.y1 + el.y2!) / 2;
          ctx.beginPath();
          ctx.arc(mx, my, 1, 0, Math.PI * 2);
          ctx.fillStyle = primary(rungAlpha * 0.6);
          ctx.fill();
        }

        if (el.type === "node") {
          const d = el.depth;
          const nodeAlpha = (0.15 + d * 0.85) * vertFade;
          const nodeRadius = 1.5 + d * 2.5;

          // Outer glow (only for front-facing nodes)
          if (d > 0.4) {
            const glowRadius = nodeRadius * 4;
            const grd = ctx.createRadialGradient(
              el.x1, el.y1, 0,
              el.x1, el.y1, glowRadius
            );
            grd.addColorStop(0, primaryBright(0.25 * nodeAlpha));
            grd.addColorStop(0.5, primaryBright(0.08 * nodeAlpha));
            grd.addColorStop(1, primaryBright(0));
            ctx.beginPath();
            ctx.arc(el.x1, el.y1, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
          }

          // Core node
          const coreGrd = ctx.createRadialGradient(
            el.x1 - nodeRadius * 0.3,
            el.y1 - nodeRadius * 0.3,
            0,
            el.x1, el.y1, nodeRadius
          );
          coreGrd.addColorStop(0, primaryBright(nodeAlpha));
          coreGrd.addColorStop(0.7, primary(nodeAlpha * 0.9));
          coreGrd.addColorStop(1, primary(nodeAlpha * 0.5));

          ctx.beginPath();
          ctx.arc(el.x1, el.y1, nodeRadius, 0, Math.PI * 2);
          ctx.fillStyle = coreGrd;
          ctx.fill();

          // Specular highlight for 3D feel
          if (d > 0.6) {
            ctx.beginPath();
            ctx.arc(
              el.x1 - nodeRadius * 0.25,
              el.y1 - nodeRadius * 0.25,
              nodeRadius * 0.35,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = `rgba(255,255,255,${0.3 * d * vertFade})`;
            ctx.fill();
          }
        }
      }

      // Draw smooth helix backbone strands
      for (const strand of [1, -1]) {
        ctx.beginPath();
        for (let i = -2; i <= PAIRS + 2; i++) {
          const y = SPACING * (i + 1);
          const phase = t + (i / PAIRS) * Math.PI * 2;
          const sin = Math.sin(phase);
          const x = CX + sin * RADIUS * strand;
          if (i === -2) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = primary(0.12);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="relative mx-auto w-[200px] h-[280px]"
    >
      {/* Ambient glow layers */}
      <div className="absolute inset-0 blur-[80px] bg-primary/20 rounded-full scale-[2.5] pointer-events-none" />
      <div className="absolute inset-0 blur-[40px] bg-primary/10 rounded-full scale-[1.8] pointer-events-none" />
      <canvas ref={canvasRef} className="relative z-10 w-full h-full" />
    </motion.div>
  );
};

export default AnimatedDNA;
