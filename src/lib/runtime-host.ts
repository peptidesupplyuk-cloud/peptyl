const PUBLIC_APP_HOSTS = new Set([
  "peptyl.co.uk",
  "www.peptyl.co.uk",
  "peptyl.lovable.app",
]);

// Sentinel string injected into the user-agent during build-time prerendering
// (vite-plugin-prerender + Puppeteer). Used to bypass GeoGate / scraper checks
// so the headless browser can render real page content for SEO.
export const PRERENDER_UA_TOKEN = "PeptylPrerender/1.0";

export const isPublicAppHost = (hostname?: string) => {
  if (typeof window === "undefined") return false;
  return PUBLIC_APP_HOSTS.has(hostname ?? window.location.hostname);
};

export const isPrerenderEnvironment = () => {
  if (typeof window === "undefined") return true; // SSR/build context
  try {
    return navigator.userAgent.includes(PRERENDER_UA_TOKEN);
  } catch {
    return false;
  }
};

export const isEditorPreviewHost = () => {
  if (typeof window === "undefined") return false;

  const { hostname, search } = window.location;
  const params = new URLSearchParams(search);

  return (
    hostname.includes("id-preview--") ||
    hostname.endsWith(".lovableproject.com") ||
    params.has("__lovable_token")
  );
};
