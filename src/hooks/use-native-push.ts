import { useEffect, useCallback, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const IS_NATIVE = Capacitor.isNativePlatform();

export function useNativePush() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  const register = useCallback(async () => {
    if (!IS_NATIVE || !user) return;
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== "granted") return;

      await PushNotifications.register();

      PushNotifications.addListener("registration", async (t) => {
        setToken(t.value);
        // Store the device token so backend can send targeted pushes
        await supabase.from("profiles" as any).update({
          apns_token: t.value,
          device_platform: Capacitor.getPlatform(),
        }).eq("id", user.id);
      });

      PushNotifications.addListener("registrationError", (err) => {
        console.error("[Push] Registration failed:", err);
      });

      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.info("[Push] Received:", notification);
      });

      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        console.info("[Push] Action:", action);
        // Could navigate to specific screen based on action.notification.data
      });
    } catch (err) {
      console.error("[Push] Setup failed:", err);
    }
  }, [user]);

  useEffect(() => {
    register();
  }, [register]);

  return { token };
}
