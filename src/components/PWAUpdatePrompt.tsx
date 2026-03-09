import { useRegisterSW } from "virtual:pwa-register/react";

const PWAUpdatePrompt = () => {
  useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Check for updates every 60 seconds
      if (registration) {
        setInterval(() => registration.update(), 60 * 1000);
      }
    },
    onNeedRefresh() {
      // Auto-reload without user action
      window.location.reload();
    },
  });

  return null;
};

export default PWAUpdatePrompt;
