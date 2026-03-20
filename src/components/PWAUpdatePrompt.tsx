import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const PWAUpdatePrompt = () => {
  useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        // Check for updates every 5 minutes
        setInterval(() => registration.update(), 5 * 60 * 1000);
      }
    },
    // skipWaiting + clientsClaim in workbox config handle activation silently
    // — no forced page reload needed
  });

  React.useEffect(() => {
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
