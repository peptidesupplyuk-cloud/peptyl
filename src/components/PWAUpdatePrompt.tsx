import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const PWAUpdatePrompt = () => {
  useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        // Check for updates every 60 seconds (was 5 min)
        setInterval(() => registration.update(), 60 * 1000);
        // Also force an immediate check
        registration.update();
      }
    },
  });

  React.useEffect(() => {
    // On mount, aggressively clear all caches and force SW update
    const nukeCaches = async () => {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          // If a waiting worker exists, tell it to activate now
          if (reg.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
          }
        }
      }
    };
    nukeCaches();

    // Reload once when a new service worker takes control mid-session
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        const key = "pwa-reloaded-at";
        const last = sessionStorage.getItem(key);
        if (last && Date.now() - Number(last) < 5000) return;
        sessionStorage.setItem(key, String(Date.now()));
        window.location.reload();
      });
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && "serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          reg?.update();
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return null;
};

export default PWAUpdatePrompt;
