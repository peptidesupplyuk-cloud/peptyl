import { useRegisterSW } from "virtual:pwa-register/react";

const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-border bg-card/95 backdrop-blur-xl px-5 py-3 shadow-lg">
      <span className="text-sm text-foreground">New version available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="text-sm font-semibold text-primary hover:underline"
      >
        Update now
      </button>
    </div>
  );
};

export default PWAUpdatePrompt;
