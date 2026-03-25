import React from "react";
import { isEditorPreviewHost, isPublicAppHost } from "@/lib/runtime-host";

const PWAUpdatePrompt = () => {
  React.useEffect(() => {
    let updateInterval: number | undefined;

    const handleControllerChange = () => {
      // Do NOT auto-reload — this was causing random full-page refreshes.
      // The new service worker is already active via skipWaiting+clientsClaim.
      console.info("[PWA] New service worker activated — changes will apply on next navigation.");
    };

    const clearCaches = async () => {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
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
      await clearCaches();

      const { registerSW } = await import("virtual:pwa-register");
      registerSW({
        immediate: true,
        onRegisteredSW(_swUrl, registration) {
          if (registration) {
            updateInterval = window.setInterval(() => registration.update(), 60 * 1000);
            registration.update();
          }
        },
      });
      
      // skipWaiting is handled by workbox config — no manual postMessage needed
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
