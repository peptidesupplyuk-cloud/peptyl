import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import prerender from "@prerenderer/rollup-plugin";

// Public routes that get prerendered to static HTML for SEO.
// Auth-gated routes (dashboard, dna, admin, pip, complete-profile, dna report,
// compound, callbacks, plan, join) are intentionally excluded — they stay
// pure SPA so we never leak shells or cache wrong auth state.
const PRERENDER_ROUTES = [
  "/",
  "/peptides",
  "/calculators",
  "/improve",
  "/education",
  "/about",
  "/faq",
  "/suppliers",
  "/shop",
  "/testing",
  "/privacy-policy",
  "/terms-of-service",
  "/glossary",
  "/sitemap",
  "/dna",
  // Education articles
  "/education/beginners-guide-peptides",
  "/education/how-to-reconstitute-peptides",
  "/education/bpc157-vs-tb500",
  "/education/peptide-storage-guide",
  "/education/understanding-glp1-peptides",
  "/education/retatrutide-triple-agonist-review",
  "/education/ghk-cu-pretty-peptide",
  "/education/russia-cognitive-peptides",
  "/education/what-is-peptyl",
  "/education/bp-supplement-stack",
  "/education/longevity-supplement-stack",
  "/education/recovery-supplement-stack",
  "/education/cognitive-supplement-stack",
  "/education/mt1-vs-mt2",
  "/education/oral-glp1-boom-2026",
  "/education/bloodwork-comes-first",
  "/education/nad-longevity-stack",
  "/education/thymosin-alpha-1-immune-peptide",
  "/education/peptide-cycling-guide",
  "/education/gut-health-peptides",
  "/education/peptide-research-europe-guide",
  "/education/peptides-cancer-therapy-2026",
  "/education/peptide-craze-biohacking",
  "/education/mots-c-mitochondrial-peptide",
  "/education/ss31-elamipretide-mitochondrial-ageing",
  "/education/bpc-157-dosage-guide",
  "/education/bpc-157-oral-vs-injection",
  "/education/bpc-157-side-effects",
  "/education/semaglutide-uk-guide",
  "/education/tirzepatide-vs-semaglutide",
  "/education/glp1-muscle-loss-prevention",
  "/education/peptides-bodybuilders-use",
  "/education/humanin-longevity-peptide",
  "/education/myostatin-blockers-bimagrumab",
  "/education/fgf21-metabolic-longevity",
  "/education/peptide-stacking-guide",
  "/education/semax-selank-dosage-guide",
  "/education/endotoxin-purity-peptides",
  "/education/glp1-side-effects-supplements",
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      selfDestroying: true,
      registerType: "autoUpdate",
      includeAssets: ["favicon-v2.png", "app-icon-v2.png", "splash.png"],
      manifest: {
        name: "Peptyl",
        short_name: "Peptyl",
        description: "Your peptide tracking and education platform",
        theme_color: "#00d4aa",
        background_color: "#070b14",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/icon-192-v2.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512-v2.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icon-512-v2.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
    // Prerender public routes only — runs after build, never in dev.
    mode === "production" && prerender({
      routes: PRERENDER_ROUTES,
      renderer: "@prerenderer/renderer-puppeteer",
      rendererOptions: {
        renderAfterDocumentEvent: "render-event",
        renderAfterTime: 8000,
        maxConcurrentRoutes: 2,
        headless: true,
        // Sentinel UA so GeoGate / scraper checks let the prerender through.
        // Must match PRERENDER_UA_TOKEN in src/lib/runtime-host.ts.
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PeptylPrerender/1.0",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
      postProcess(renderedRoute: any) {
        // Strip any inline auth/session noise that may have leaked.
        renderedRoute.html = renderedRoute.html
          .replace(/<script[^>]*onesignal[^<]*<\/script>/gi, "")
          .replace(/<noscript[^>]*data-prerender-skip[^<]*<\/noscript>/gi, "");
        return renderedRoute;
      },
    }),
  ].filter(Boolean),
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
