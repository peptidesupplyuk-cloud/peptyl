import React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => registration.update(), 60 * 1000);
      }
    },
    onNeedRefresh() {
      updateServiceWorker(true);
    },
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
    if (needRefresh) {
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
};

export default PWAUpdatePrompt;
