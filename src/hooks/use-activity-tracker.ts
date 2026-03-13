import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SESSION_KEY = "peptyl_session_id";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function isPWA(): boolean {
  if (typeof window === "undefined") return false;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;
  return isStandalone;
}

function getDisplayMode(): string {
  if (isPWA()) return "standalone";
  if (window.matchMedia("(display-mode: fullscreen)").matches) return "fullscreen";
  if (window.matchMedia("(display-mode: minimal-ui)").matches) return "minimal-ui";
  return "browser";
}

function getDeviceType(): string {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function useActivityTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const lastPath = useRef<string>("");
  const lastLogTime = useRef<number>(0);

  useEffect(() => {
    if (!user) return;

    const now = Date.now();
    const path = location.pathname;

    // Debounce: don't log same path within 5 seconds
    if (path === lastPath.current && now - lastLogTime.current < 5000) return;

    lastPath.current = path;
    lastLogTime.current = now;

    const sessionId = getSessionId();

    supabase
      .from("user_activity")
      .insert({
        user_id: user.id,
        session_id: sessionId,
        is_pwa: isPWA(),
        display_mode: getDisplayMode(),
        device_type: getDeviceType(),
        page_path: path,
        referrer: document.referrer || null,
        screen_width: window.innerWidth,
      } as any)
      .then(({ error }) => {
        if (error) console.warn("Activity log failed:", error.message);
      });
  }, [user, location.pathname]);
}
