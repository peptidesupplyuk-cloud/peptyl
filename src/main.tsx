import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./components/ThemeProvider";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <App />
    </ThemeProvider>
  </HelmetProvider>
);

// Signal to the prerenderer (Puppeteer) that React has hydrated and
// the DOM is ready to be captured as static HTML for SEO.
if (typeof window !== "undefined") {
  // Wait one frame so Helmet has flushed <title>/<meta> into <head>.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.dispatchEvent(new Event("render-event"));
    });
  });
}

// PWA registration handled by vite-plugin-pwa
