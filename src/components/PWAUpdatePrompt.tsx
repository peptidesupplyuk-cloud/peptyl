import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const PWAUpdatePrompt = () => {
  useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => registration.update(), 5 * 60 * 1000);
      }
    },
  });

  React.useEffect(() => {
    // Reload once when a new service worker takes control mid-session
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        // Guard against infinite reload loops
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
