import React from "react";
import { isPublicAppHost } from "@/lib/runtime-host";

const RECOVERY_KEY = "peptyl-crash-recovery";
const MAX_RETRIES = 2;

/**
 * Error boundary that detects fatal React crashes on production/PWA,
 * clears all service worker caches, unregisters the SW, and reloads.
 * Prevents users getting stuck on a cached broken build.
 */
class PWACrashRecovery extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[PWACrashRecovery] Fatal render error:", error.message);

    if (!isPublicAppHost()) {
      // In preview/dev, just show the error — don't auto-reload
      return;
    }

    const retries = parseInt(sessionStorage.getItem(RECOVERY_KEY) || "0", 10);

    if (retries >= MAX_RETRIES) {
      console.warn("[PWACrashRecovery] Max retries reached, showing fallback.");
      sessionStorage.removeItem(RECOVERY_KEY);
      return;
    }

    sessionStorage.setItem(RECOVERY_KEY, String(retries + 1));

    // Clear all caches + unregister SW, then hard reload
    void (async () => {
      try {
        if ("caches" in window) {
          const names = await caches.keys();
          await Promise.all(names.map((n) => caches.delete(n)));
          console.info(`[PWACrashRecovery] Cleared ${names.length} cache(s)`);
        }
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
          console.info(`[PWACrashRecovery] Unregistered ${regs.length} SW(s)`);
        }
      } catch (e) {
        console.warn("[PWACrashRecovery] Cache clear failed:", e);
      }

      // Force a network fetch (bypass cache)
      window.location.reload();
    })();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-foreground">
              Something went wrong
            </h1>
            <p className="text-muted-foreground">
              We're refreshing the app to fix this. If the problem persists,
              try clearing your browser cache.
            </p>
            <button
              onClick={() => {
                sessionStorage.removeItem(RECOVERY_KEY);
                void (async () => {
                  if ("caches" in window) {
                    const names = await caches.keys();
                    await Promise.all(names.map((n) => caches.delete(n)));
                  }
                  if ("serviceWorker" in navigator) {
                    const regs = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(regs.map((r) => r.unregister()));
                  }
                  window.location.href = "/";
                })();
              }}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PWACrashRecovery;
