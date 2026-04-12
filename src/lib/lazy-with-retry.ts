import { lazy, type ComponentType } from "react";

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
      return await factory();
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
        return await factory();
      } catch (retryErr) {
        // Last resort: hard reload
        console.error("[lazyWithRetry] Retry failed, reloading page", retryErr);
        window.location.reload();
        // Return a never-resolving promise so React doesn't try to render
        return new Promise(() => {});
      }
    }
  });
}