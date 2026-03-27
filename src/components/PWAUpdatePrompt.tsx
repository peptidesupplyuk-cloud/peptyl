import React from "react";
import { isEditorPreviewHost, isPublicAppHost } from "@/lib/runtime-host";

const PWAUpdatePrompt = () => {
  React.useEffect(() => {
    let updateInterval: number | undefined;

    // Build-time stamp so we can detect stale SW caches
    const BUILD_VERSION = import.meta.env.VITE_BUILD_TIME ?? Date.now().toString();

    const handleControllerChange = () => {
      // Reload once when a new SW takes over — this ensures the latest assets load
      console.info("[PWA] New service worker activated — reloading for latest build.");
      window.location.reload();
    };

    const clearCaches = async () => {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
        console.info(`[PWA] Cleared ${names.length} cache(s)`);
      }
    };

    const disablePreviewServiceWorker = async () => {
      await clearCaches();

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if (isEditorPreviewHost()) {
        const key = "preview-sw-disabled";
        const currentUrl = new URL(window.location.href);

        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "true");
          currentUrl.searchParams.set("preview-bust", Date.now().toString());
          window.location.replace(currentUrl.toString());
        }
      }
    };

    const setupProductionServiceWorker = async () => {
      // If build version changed, nuke all caches first to prevent stale content
      const lastBuild = localStorage.getItem("peptyl-build-version");
      if (lastBuild !== BUILD_VERSION) {
        console.info(`[PWA] Build changed (${lastBuild} → ${BUILD_VERSION}), clearing caches`);
        await clearCaches();
        localStorage.setItem("peptyl-build-version", BUILD_VERSION);
      }

      const { registerSW } = await import("virtual:pwa-register");
      registerSW({
        immediate: true,
        onRegisteredSW(_swUrl, registration) {
          if (registration) {
            // Check for updates every 30s (was 60s)
            updateInterval = window.setInterval(() => registration.update(), 30 * 1000);
            registration.update();
          }
        },
      });
    };

    if (!isPublicAppHost()) {
      void disablePreviewServiceWorker();
      return;
    }

    void setupProductionServiceWorker();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && "serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          reg?.update();
        });
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (updateInterval) {
        window.clearInterval(updateInterval);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      }
    };
  }, []);

  return null;
};

export default PWAUpdatePrompt;
