import { lazy, type ComponentType } from "react";

const RELOAD_GUARD_KEY = "peptyl-lazy-reload";

/**
 * Wrapper around React.lazy that retries failed dynamic imports once
 * after clearing module cache. Prevents blank screens when the PWA
 * serves stale chunk references that 404 on the server.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const mod = await factory();
      sessionStorage.removeItem(RELOAD_GUARD_KEY);
      return mod;
    } catch (err) {
      console.warn("[lazyWithRetry] Chunk load failed, retrying…", err);

      // Clear all caches and unregister SWs before retry
      try {
        if ("caches" in window) {
          const names = await caches.keys();
          await Promise.all(names.map((n) => caches.delete(n)));
        }
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch { /* best effort */ }

      // Add cache-bust param to force network fetch
      // Wait a tick for SW unregistration to take effect
      await new Promise((r) => setTimeout(r, 500));

      try {
        const mod = await factory();
        sessionStorage.removeItem(RELOAD_GUARD_KEY);
        return mod;
      } catch (retryErr) {
        // Last resort: hard reload once, then throw so the error boundary can render.
        console.error("[lazyWithRetry] Retry failed, reloading page", retryErr);

        try {
          const hasReloaded = sessionStorage.getItem(RELOAD_GUARD_KEY) === "1";
          if (!hasReloaded) {
            sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
            const url = new URL(window.location.href);
            url.searchParams.set("_lr", Date.now().toString());
            window.location.replace(url.toString());
          } else {
            sessionStorage.removeItem(RELOAD_GUARD_KEY);
          }
        } catch {
          window.location.reload();
        }

        throw retryErr instanceof Error
          ? retryErr
          : new Error("Failed to load application code.");
      }
    }
  });
}