import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./components/ThemeProvider";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { isPrerenderEnvironment } from "./lib/runtime-host";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <App />
    </ThemeProvider>
  </HelmetProvider>
);

// Signal to the prerenderer (Puppeteer) that React has hydrated and
// the DOM is ready to be captured as static HTML for SEO.
// Wait long enough for the lazy-loaded route chunk to import and Helmet
// to flush <title>/<meta>/<link rel="canonical"> into <head>.
if (typeof window !== "undefined" && isPrerenderEnvironment()) {
  const fire = () => document.dispatchEvent(new Event("render-event"));
  // 2.5s is plenty for lazy chunk + Helmet flush; renderAfterTime in
  // vite.config.ts (8s) is the safety net.
  setTimeout(fire, 2500);
}

// PWA registration handled by vite-plugin-pwa
