import React from "react";

const PREVIEW_HOST_MARKER = "id-preview--";

const isPreviewHost = () =>
  typeof window !== "undefined" && window.location.hostname.includes(PREVIEW_HOST_MARKER);

const PWAUpdatePrompt = () => {
  React.useEffect(() => {
    let updateInterval: number | undefined;

    const handleControllerChange = () => {
      const key = "pwa-reloaded-at";
      const last = sessionStorage.getItem(key);
      if (last && Date.now() - Number(last) < 5000) return;
      sessionStorage.setItem(key, String(Date.now()));
      window.location.reload();
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

        if (registrations.length > 0) {
          const key = "preview-sw-disabled";
          const currentUrl = new URL(window.location.href);
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "true");
            currentUrl.searchParams.set("preview-bust", Date.now().toString());
            window.location.replace(currentUrl.toString());
          }
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
      
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      }
    };

    if (isPreviewHost()) {
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
