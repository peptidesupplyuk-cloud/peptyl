import React, { useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const PWAUpdatePrompt = () => {
  const hasReloaded = useRef(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        // Check for updates every 5 minutes (not 60s — reduces reload churn)
        setInterval(() => registration.update(), 5 * 60 * 1000);
      }
    },
    // Don't auto-reload here — let the useEffect handle it once
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

  React.useEffect(() => {
    if (needRefresh && !hasReloaded.current) {
      // Guard: only reload once per component lifecycle to prevent loops
      hasReloaded.current = true;

      // Also guard with sessionStorage so a rapid reload cycle can't restart
      const reloadKey = "pwa_reloaded_at";
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (lastReload && now - Number(lastReload) < 30_000) {
        // Reloaded less than 30s ago — skip to break the loop
        return;
      }
      sessionStorage.setItem(reloadKey, String(now));
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
};

export default PWAUpdatePrompt;
