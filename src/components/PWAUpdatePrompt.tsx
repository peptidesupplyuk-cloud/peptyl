import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Poll for updates every 60 seconds while the tab is active
      if (registration) {
        setInterval(() => registration.update(), 60 * 1000);
      }
    },
    onNeedRefresh() {
      // Auto-apply update immediately — no user prompt
      updateServiceWorker(true);
    },
  });

  // iOS PWAs freeze in the background — check for updates when the app
  // returns to the foreground so users always get the latest version.
  useEffect(() => {
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

  // Force reload if the hook flags a pending refresh (belt-and-suspenders)
  useEffect(() => {
    if (needRefresh) {
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
};

export default PWAUpdatePrompt;
