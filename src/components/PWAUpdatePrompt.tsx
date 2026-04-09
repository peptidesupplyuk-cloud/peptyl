import React from "react";

const PWAUpdatePrompt = () => {
  React.useEffect(() => {
    const disableServiceWorkers = async () => {
      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
          console.info(`[PWA] Unregistered ${registrations.length} service worker(s)`);
        }

        if ("caches" in window) {
          const names = await caches.keys();
          await Promise.all(names.map((name) => caches.delete(name)));
          console.info(`[PWA] Cleared ${names.length} cache(s)`);
        }

        localStorage.removeItem("peptyl-build-version");
        sessionStorage.removeItem("peptyl-crash-recovery");
        sessionStorage.removeItem("preview-sw-disabled");
      } catch (error) {
        console.warn("[PWA] Failed to disable service workers:", error);
      }
    };

    void disableServiceWorkers();
  }, []);

  return null;
};

export default PWAUpdatePrompt;
